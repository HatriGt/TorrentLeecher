
# TorrentLeecher - Technical Information

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **CSS Framework**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks + Context API
- **Routing**: React Router DOM
- **Data Fetching**: Tanstack React Query

### Backend
- **Database & Auth**: Supabase
- **Real-time Updates**: Supabase Realtime
- **API Communication**: Axios

## Architecture Overview
The application follows a component-based architecture with a clear separation of concerns:

1. **Components**: UI elements built with shadcn/ui and custom components
2. **Services**: API and data handling logic
3. **Hooks**: Custom React hooks for shared functionality
4. **Pages**: Main page compositions
5. **Types**: TypeScript definitions for type safety

## Data Flow
1. User interacts with the UI (e.g., submits a magnet link)
2. Frontend calls appropriate service function
3. Service function makes a request to Supabase
4. Database state changes trigger real-time updates
5. UI components react to state changes and update accordingly

## Key Components
- **MagnetInput**: Allows users to input magnet links and start downloads
- **DownloadsList**: Displays active downloads with progress tracking
- **FilesList**: Shows completed downloads and folders
- **FileItem**: Individual file/folder representation with actions
- **DownloadProgress**: Displays and manages download progress

## Database Schema

### Tables
1. **downloads**
   - id (primary key)
   - magnet_link (text)
   - file_name (text)
   - file_size (number, nullable)
   - status (enum: queued, downloading, processing, completed, error, cancelled)
   - progress (number)
   - created_at (timestamp)
   - completed_at (timestamp, nullable)
   - user_id (foreign key, nullable)

2. **files**
   - id (primary key)
   - name (text)
   - size (number)
   - drive_link (text)
   - download_id (foreign key, nullable)
   - created_at (timestamp)
   - user_id (foreign key, nullable)

## Real-time Subscriptions
The application uses Supabase real-time capabilities to provide live updates:
- Downloads table changes trigger updates to the downloads list
- Files table changes trigger updates to the files list

## Development Workflow
1. Local development with `npm run dev`
2. Changes automatically synchronized with Supabase

## Future Technical Improvements
- Implement user authentication for personalized experience
- Add file searching and advanced filtering
- Implement file preview functionality
- Add batch operations for files and downloads
- Optimize performance for large file lists
- Implement proper error handling and retry mechanisms
