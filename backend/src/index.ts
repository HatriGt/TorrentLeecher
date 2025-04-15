import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { z } from 'zod'
import { google } from 'googleapis'
import torrentStream from 'torrent-stream'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe'

// Type definitions
declare module 'torrent-stream' {
  interface TorrentEngine {
    destroy(): void;
    magnetURI: string;
    infoHash: string;
    torrent: {
      name: string;
      length: number;
    };
    files: Array<{
      name: string;
      length: number;
      path: string;
      select(): void;
    }>;
    swarm: {
      downloaded: number;
      downloadSpeed(): number;
      uploaded: number;
      wires: Array<{
        address: string;
        port: number;
      }>;
    };
  }
}

dotenv.config()

// Environment variables validation
const envSchema = z.object({
  PORT: z.string().default('3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string(),
  GOOGLE_PRIVATE_KEY: z.string(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().default('1J40N1hQf3WkS6yOnWcpiyGV4csG9RNyS'),
  GOOGLE_DRIVE_USER_EMAIL: z.string(),
  DOWNLOAD_DIR: z.string().default('./downloads'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string()
})

const env = envSchema.parse(process.env)

// Initialize Supabase client
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

// Ensure download directory exists
if (!fs.existsSync(env.DOWNLOAD_DIR)) {
  fs.mkdirSync(env.DOWNLOAD_DIR, { recursive: true })
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  path: '/socket.io',
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowEIO3: true,
  serveClient: false
})

app.use(cors())
app.use(express.json())

// Google Drive setup with service account
const auth = new google.auth.JWT({
  email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive.file']
})

// Initialize the auth client
auth.authorize((err) => {
  if (err) {
    console.error('Error authorizing service account:', err)
    process.exit(1)
  }
  console.log('Service account authorized successfully')
})

// Set up Google Drive API
const drive = google.drive({ version: 'v3', auth })

// Set FFmpeg paths
ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)

// Schema for magnet link validation
const magnetLinkSchema = z.object({
  magnetLink: z.string().url(),
  socketId: z.string()
})

// Active downloads tracking
interface DownloadEngine {
  engine: TorrentEngine;
  progress: number;
  status: 'downloading' | 'uploading' | 'completed' | 'error';
  error?: string;
}

const activeDownloads = new Map<string, DownloadEngine>()

// Add this near the top where other interfaces are defined
interface TorrentState {
  isUploading: boolean;
  uploadComplete: boolean;
}

// Add this near other state tracking variables
const torrentStates = new Map<string, TorrentState>();

// Add after TorrentState interface
interface TorrentPeer {
  address: string;
  port: number;
  id?: string;
  connected?: boolean;
}

// Add after torrentStates declaration
const activePeers = new Map<string, Set<string>>(); // magnetLink -> Set of peer addresses

// Add after the imports but before other interfaces
interface TorrentEngine {
  magnetURI: string;
  infoHash: string;
  destroy(): void;
  on(event: string, callback: (...args: any[]) => void): void;
  torrent: {
    name: string;
    length: number;
  };
  files: Array<{
    name: string;
    length: number;
    path: string;
    select(): void;
    createReadStream(): NodeJS.ReadableStream;
  }>;
  swarm: {
    downloaded: number;
    downloadSpeed(): number;
    uploaded: number;
    wires: Array<{
      address: string;
      port: number;
    }>;
  };
}

// Function to fetch and parse trackers
async function getTrackersFromAPI(): Promise<string[]> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_all.txt')
    const text = await response.text()
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
  } catch (error) {
    console.error('Error fetching trackers:', error)
    return [] // Return empty array if fetch fails
  }
}

// Default trackers as fallback
const defaultTrackers = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://tracker.openbittorrent.com:6969/announce",
  "udp://open.stealth.si:80/announce",
  "udp://exodus.desync.com:6969/announce",
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://tracker.openbittorrent.com:6969/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://explodie.org:6969/announce",
  "udp://tracker.skyts.net:6969/announce",
  "udp://tracker.ololosh.space:6969/announce",
  "udp://retracker01-msk-virt.corbina.net:80/announce",
  "udp://leet-tracker.moe:1337/announce",
  "udp://isk.richardsw.club:6969/announce",
  "udp://bt.ktrackers.com:6666/announce",
  "udp://open.demonii.com:1337/announce",
  "http://tracker.trackerfix.com:80/announce",
  "udp://9.rarbg.me:2710/announce"
]

// Keep track of the latest trackers
let cachedTrackers: string[] = [...defaultTrackers]

// Update trackers periodically (every 6 hours)
async function updateTrackers() {
  try {
    const newTrackers = await getTrackersFromAPI()
    if (newTrackers.length > 0) {
      cachedTrackers = [...new Set([...defaultTrackers, ...newTrackers])] // Merge and deduplicate
      console.log(`Updated trackers list. Total trackers: ${cachedTrackers.length}`)
    }
  } catch (error) {
    console.error('Failed to update trackers:', error)
  }
}

// Initial update and schedule periodic updates
updateTrackers()
setInterval(updateTrackers, 6 * 60 * 60 * 1000) // Update every 6 hours

// Function to create or get folder in Google Drive
async function createOrGetFolder(folderName: string, parentId?: string) {
  try {
    // Check if folder exists
    const query = parentId 
      ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`;

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create folder if it doesn't exist
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId || env.GOOGLE_DRIVE_FOLDER_ID]
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id'
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error creating/getting folder:', error);
    throw error;
  }
}

// Get storage information
app.get('/api/storage', async (req, res) => {
  try {
    const response = await drive.about.get({
      fields: 'storageQuota'
    })
    res.json(response.data)
  } catch (error) {
    console.error('Error getting storage info:', error)
    res.status(500).json({ error: 'Failed to get storage info' })
  }
})

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason)
  })

  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })

  // Handle reconnection
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Reconnection attempt:', attemptNumber)
  })

  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts')
  })

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error)
  })

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect')
  })
})

// Handle magnet link download and upload
app.post('/api/download', async (req, res) => {
  try {
    console.log('Received download request:', req.body)
    const { magnetLink, socketId } = magnetLinkSchema.parse(req.body)
    
    // Check if download is already in progress
    if (activeDownloads.has(magnetLink)) {
      console.log('Download already in progress for:', magnetLink)
      return res.status(400).json({ 
        success: false, 
        error: 'Download already in progress' 
      })
    }

    const socket = io.sockets.sockets.get(socketId)
    if (!socket) {
      console.log('Invalid socket ID:', socketId)
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid socket ID' 
      })
    }

    console.log('Starting torrent download with magnet link:', magnetLink)

    // Start downloading with more options
    const engine = torrentStream(magnetLink, {
      connections: 100,
      uploads: 10,
      verify: true,
      dht: true,
      tracker: true,
      trackers: cachedTrackers
    })

    activeDownloads.set(magnetLink, {
      engine,
      progress: 0,
      status: 'downloading'
    })

    // Log torrent metadata when ready
    engine.on('ready', () => {
      console.log('Torrent ready:', {
        infoHash: engine.infoHash,
        name: engine.torrent.name,
        files: engine.files.map(f => ({ 
          name: f.name, 
          length: f.length,
          path: f.path 
        })),
        totalSize: engine.torrent.length
      })

      // Select all files for download
      engine.files.forEach(file => {
        console.log(`Selecting file for download: ${file.name}`)
        file.select()
      })
    })

    let lastProgressUpdate = Date.now()
    engine.on('download', () => {
      const now = Date.now()
      // Throttle progress updates to once per second
      if (now - lastProgressUpdate > 1000) {
        const progress = (engine.swarm.downloaded / engine.torrent.length * 100).toFixed(1)
        const download = activeDownloads.get(magnetLink)
        if (download) {
          download.progress = parseFloat(progress)
          const stats = { 
            progress,
            downloadSpeed: engine.swarm.downloadSpeed(),
            uploaded: engine.swarm.uploaded,
            total: engine.torrent.length,
            peers: engine.swarm.wires.length
          }
          console.log('Download progress:', stats)
          socket.emit('download-progress', stats)
        }
        lastProgressUpdate = now
      }
    })

    // Update the peer handling section
    engine.on('peer', (peer: TorrentPeer | string) => {
      try {
        // Initialize peer set for this torrent if not exists
        if (!activePeers.has(magnetLink)) {
          activePeers.set(magnetLink, new Set());
        }
        
        // Parse peer address and port
        let peerAddress: string;
        let peerPort: number;
        
        if (typeof peer === 'string') {
          const [address, portStr] = peer.split(':');
          peerAddress = address;
          peerPort = parseInt(portStr, 10);
        } else {
          peerAddress = peer.address;
          peerPort = peer.port;
        }

        const peerKey = `${peerAddress}:${peerPort}`;
        const peers = activePeers.get(magnetLink);
        
        if (peers && !peers.has(peerKey)) {
          peers.add(peerKey);
          console.log('New peer discovered:', {
            address: peerAddress,
            port: peerPort,
            totalPeers: peers.size,
            activePeers: Array.from(peers)
          });

          // Emit peer discovery event to client
          socket.emit('peer-discovered', {
            address: peerAddress,
            port: peerPort,
            totalPeers: peers.size
          });
        }
      } catch (error) {
        console.error('Error handling peer:', error);
      }
    });

    // In the download endpoint, before setting up the engine
    const torrentState: TorrentState = {
      isUploading: false,
      uploadComplete: false
    };
    torrentStates.set(magnetLink, torrentState);

    engine.on('idle', async () => {
      try {
        const state = torrentStates.get(magnetLink);
        if (!state || state.isUploading || state.uploadComplete) {
          console.log('Skipping upload - already in progress or completed');
          return;
        }

        console.log('Download completed, starting upload to Google Drive...');
        state.isUploading = true;
        
        const download = activeDownloads.get(magnetLink);
        if (download) {
          download.status = 'uploading';
        }

        try {
          // Get the torrent name as the main folder name
          const torrentName = engine.torrent.name;
          console.log('Creating main folder:', torrentName);
          
          // Create main folder
          const mainFolderId = await createOrGetFolder(torrentName);
          if (!mainFolderId) {
            throw new Error('Failed to create or get main folder');
          }

          // Upload to Google Drive
          for (const file of engine.files) {
            console.log(`Processing file for upload: ${file.name}`);
            
            try {
              // Create file metadata with proper type assertion
              const fileMetadata: { name: string; parents: string[] } = {
                name: path.basename(file.path),
                parents: [mainFolderId]
              };

              // Create a readable stream from the torrent file
              const fileStream = file.createReadStream();

              console.log('Uploading file to Google Drive...');
              const uploadResponse = await drive.files.create({
                requestBody: fileMetadata,
                media: {
                  mimeType: 'application/octet-stream',
                  body: fileStream
                },
                fields: 'id, name, webViewLink',
                supportsAllDrives: true
              });

              if (!uploadResponse?.data) {
                throw new Error('Upload failed - no response data');
              }

              const response = uploadResponse.data;

              console.log('File uploaded successfully:', {
                fileId: response.id,
                fileName: response.name,
                webViewLink: response.webViewLink
              });

              // Share the file with the user
              console.log('Setting file permissions...');
              await drive.permissions.create({
                fileId: response.id,
                requestBody: {
                  role: 'writer',
                  type: 'user',
                  emailAddress: env.GOOGLE_DRIVE_USER_EMAIL
                },
                supportsAllDrives: true
              });

              console.log('File permissions set successfully');

              socket.emit('download-complete', {
                name: file.name,
                size: file.length,
                driveLink: response.webViewLink,
                parentFolder: mainFolderId,
                isFolder: false,
                path: file.path
              });
            } catch (uploadError) {
              console.error('Detailed upload error:', uploadError);
              socket.emit('download-error', { 
                error: `Failed to upload ${file.name} to Google Drive: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` 
              });
              throw uploadError; // Re-throw to handle in outer catch
            }
          }

          // Emit folder structure only after successful upload
          socket.emit('folder-structure-complete', {
            name: torrentName,
            id: mainFolderId,
            isFolder: true,
            driveLink: `https://drive.google.com/drive/folders/${mainFolderId}`
          });

          if (download) {
            download.status = 'completed';
            console.log('Download and upload process completed');
          }

          // Mark upload as complete
          state.uploadComplete = true;
        } finally {
          state.isUploading = false;
          cleanupDownload(engine);
          torrentStates.delete(magnetLink);
        }
      } catch (error) {
        console.error('Error handling download:', error);
        const download = activeDownloads.get(magnetLink);
        if (download) {
          download.status = 'error';
          download.error = 'Failed to process download';
        }
        socket.emit('download-error', { 
          error: error instanceof Error ? error.message : 'Failed to process download' 
        });
        cleanupDownload(engine);
        torrentStates.delete(magnetLink);
      }
    })

    engine.on('error', (error: Error) => {
      console.error('Torrent error:', error)
      socket.emit('download-error', { error: error.message })
      cleanupDownload(engine)
    })

    res.json({ success: true, message: 'Download started' })
  } catch (error) {
    console.error('Error starting download:', error)
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Get download status
app.get('/api/download/:magnetLink', (req, res) => {
  const { magnetLink } = req.params
  const download = activeDownloads.get(magnetLink)
  
  if (!download) {
    return res.status(404).json({ 
      success: false, 
      error: 'Download not found' 
    })
  }

  res.json({
    success: true,
    data: {
      progress: download.progress,
      status: download.status,
      error: download.error
    }
  })
})

// Cancel download
app.post('/api/downloads/:downloadId/cancel', async (req, res) => {
  try {
    const { downloadId } = req.params;
    
    // 1. Check and cleanup active download process
    const download = activeDownloads.get(downloadId);
    if (download) {
      cleanupDownload(download.engine);
      activeDownloads.delete(downloadId);
    }

    // 2. Get files associated with this download from Supabase
    const { data: filesData, error: filesError } = await supabase
      .from('files')
      .select('drive_link')
      .eq('download_id', downloadId);

    if (filesError) {
      console.error('Error fetching files:', filesError);
    } else if (filesData) {
      // 3. Delete files from Google Drive
      for (const file of filesData) {
        if (file.drive_link) {
          try {
            const fileId = file.drive_link.split('/').pop();
            if (fileId) {
              await drive.files.delete({
                fileId,
                supportsAllDrives: true
              });
            }
          } catch (driveError) {
            console.error('Error deleting file from Google Drive:', driveError);
            // Continue with other files even if one fails
          }
        }
      }
    }

    // 4. Delete download record from Supabase (this will cascade delete files due to FK constraint)
    const { error: downloadError } = await supabase
      .from('downloads')
      .delete()
      .eq('id', downloadId);

    if (downloadError) {
      console.error('Error deleting download:', downloadError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete download record' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Download cancelled and cleaned up successfully' 
    });
  } catch (error) {
    console.error('Error cancelling download:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to cancel download' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    activeDownloads: activeDownloads.size
  })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  })
})

// Update the cleanupDownload function with proper typing
const cleanupDownload = (engine: TorrentEngine) => {
  engine.destroy();
  const magnetURI = engine.magnetURI;
  activeDownloads.delete(magnetURI);
  activePeers.delete(magnetURI);
}

// Interface for file/folder response
interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink: string;
  parents: string[];
}

// Get files and folders from Google Drive
app.get('/api/drive/files', async (req, res) => {
  try {
    const { folderId = env.GOOGLE_DRIVE_FOLDER_ID, recursive = false } = req.query;
    
    const files = await listFilesAndFolders(folderId as string, recursive === 'true');
    res.json({ success: true, data: files });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get files' 
    });
  }
});

// Get specific folder contents
app.get('/api/drive/folders/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    const files = await listFilesAndFolders(folderId, false);
    res.json({ success: true, data: files });
  } catch (error) {
    console.error('Error getting folder contents:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get folder contents' 
    });
  }
});

// Helper function to list files and folders
async function listFilesAndFolders(folderId: string, recursive: boolean): Promise<DriveItem[]> {
  try {
    const query = `'${folderId}' in parents and trashed = false`;
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, parents)',
      orderBy: 'name',
      pageSize: 1000,
      supportsAllDrives: true
    });

    const files = response.data.files || [];
    
    if (recursive) {
      const folders = files.filter(file => file.mimeType === 'application/vnd.google-apps.folder');
      for (const folder of folders) {
        const subFiles = await listFilesAndFolders(folder.id, true);
        files.push(...subFiles);
      }
    }

    return files as DriveItem[];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

// Helper function to get MIME type based on file extension
function getMimeType(filename: string) {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: { [key: string]: string } = {
    'mkv': 'video/x-matroska',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'm4a': 'audio/mp4',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

// Stream video from Google Drive
app.get('/api/stream/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const range = req.headers.range;

    // Get file metadata
    const file = await drive.files.get({
      fileId,
      fields: 'size, mimeType, name',
      supportsAllDrives: true
    });

    if (!file.data) {
      return res.status(404).send('File not found');
    }

    const fileSize = parseInt(file.data.size || '0');
    const fileName = file.data.name || '';
    
    // Determine the correct MIME type
    const mimeType = getMimeType(fileName);
    const isMKV = fileName.toLowerCase().endsWith('.mkv');

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Transfer-Encoding', 'binary');

    if (isMKV) {
      // For MKV files, we'll transcode on the fly
      res.setHeader('Content-Type', 'video/mp4'); // Transcode to MP4 for better browser support
      
      // Get the file stream from Google Drive
      const fileStream = await drive.files.get({
        fileId,
        alt: 'media'
      }, {
        responseType: 'stream'
      });

      // Create FFmpeg command for transcoding
      const ffmpegCommand = ffmpeg(fileStream.data)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .outputOptions([
          '-movflags frag_keyframe+empty_moov',
          '-movflags +faststart',
          '-preset ultrafast',
          '-tune zerolatency',
          '-crf 23'
        ])
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          if (!res.headersSent) {
            res.status(500).send('Error transcoding video');
          }
        });

      // Pipe the transcoded stream to the response
      ffmpegCommand.pipe(res);
    } else {
      // For non-MKV files, use the existing streaming logic
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunkSize,
          'Content-Type': mimeType
        });

        const stream = await drive.files.get({
          fileId,
          alt: 'media',
          headers: {
            Range: `bytes=${start}-${end}`
          }
        }, {
          responseType: 'stream'
        });

        stream.data.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': mimeType
        });

        const stream = await drive.files.get({
          fileId,
          alt: 'media'
        }, {
          responseType: 'stream'
        });

        stream.data.pipe(res);
      }
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).send('Error streaming video');
  }
});

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
}) 