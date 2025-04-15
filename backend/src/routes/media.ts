import { Router } from 'express';
import { drive } from '../services/google';
import { Readable } from 'stream';

const router = Router();

router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const range = req.headers.range;

    // Get file metadata
    const file = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
      supportsAllDrives: true
    });

    if (!file.data) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileSize = parseInt(file.data.size || '0');

    // Handle range requests for streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunkSize,
        'Content-Type': file.data.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.data.name}"`,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
        'Cache-Control': 'no-cache'
      });

      // Get the file content as a stream
      const response = await drive.files.get({
        fileId,
        alt: 'media',
        supportsAllDrives: true
      }, {
        responseType: 'stream',
        headers: {
          Range: `bytes=${start}-${end}`
        }
      });

      if (response.data) {
        const stream = response.data as Readable;
        stream.pipe(res);

        // Handle streaming errors
        stream.on('error', (error) => {
          console.error('Error streaming file:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error streaming file' });
          }
        });
      } else {
        throw new Error('No stream data available');
      }
    } else {
      // Non-range request - send entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': file.data.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.data.name}"`,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
        'Cache-Control': 'no-cache'
      });

      const response = await drive.files.get({
        fileId,
        alt: 'media',
        supportsAllDrives: true
      }, {
        responseType: 'stream'
      });

      if (response.data) {
        const stream = response.data as Readable;
        stream.pipe(res);

        // Handle streaming errors
        stream.on('error', (error) => {
          console.error('Error streaming file:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error streaming file' });
          }
        });
      } else {
        throw new Error('No stream data available');
      }
    }
  } catch (error) {
    console.error('Error fetching file:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error fetching file' });
    }
  }
});

export default router; 