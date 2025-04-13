# TorrentLeecher Backend

Backend service for TorrentLeecher that handles torrent downloads and Google Drive uploads.

## Features

- Torrent download management
- Real-time progress updates via WebSocket
- Google Drive integration
- Error handling and cleanup
- Health monitoring
- Download cancellation support

## Prerequisites

- Node.js 18+
- Google Cloud Platform account with Drive API enabled
- Google OAuth 2.0 credentials

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

4. Set up Google Drive API:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google Drive API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
   - Copy credentials to `.env`

## Development

Run the development server:
```bash
npm run dev
```

## Production Build

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: Add all variables from `.env`

4. Deploy the service

## API Endpoints

- `POST /api/download` - Start a new download
  ```json
  {
    "magnetLink": "magnet:?xt=urn:...",
    "socketId": "socket-id"
  }
  ```

- `POST /api/cancel` - Cancel a download
  ```json
  {
    "magnetLink": "magnet:?xt=urn:..."
  }
  ```

- `GET /health` - Health check endpoint

## WebSocket Events

- `download-progress` - Download progress updates
- `download-complete` - Download completion
- `download-error` - Error notifications

## Error Handling

The service includes comprehensive error handling for:
- Invalid magnet links
- Download failures
- Google Drive upload errors
- Socket connection issues

## Security Considerations

- All environment variables are validated
- Input validation using Zod
- Error messages are sanitized
- Temporary files are cleaned up
- Rate limiting (to be implemented)

## Monitoring

The service includes:
- Health check endpoint
- Active downloads tracking
- Error logging
- Performance monitoring

## License

MIT 