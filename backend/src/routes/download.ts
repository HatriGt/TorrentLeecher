import { Router } from 'express';
import { drive } from '../services/google';
import { Readable } from 'stream';

const router = Router();

router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file metadata
    const file = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
      supportsAllDrives: true
    });

    if (!file.data) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get the file content
    const response = await drive.files.get({
      fileId,
      alt: 'media',
      supportsAllDrives: true
    }, {
      responseType: 'stream'
    });

    // Set appropriate headers for download
    res.setHeader('Content-Type', file.data.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.data.name}"`);
    if (file.data.size) {
      res.setHeader('Content-Length', file.data.size);
    }

    // Stream the file
    const stream = response.data as Readable;
    stream.pipe(res);

    // Handle errors during streaming
    stream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error fetching file' });
    }
  }
});

export default router; 