-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Downloads table
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    magnet_link TEXT NOT NULL,
    file_name TEXT,
    file_size INT8,
    status TEXT DEFAULT 'queued'::text,
    progress INT4 DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    drive_link TEXT,
    user_id UUID
);

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    download_id UUID REFERENCES downloads(id) ON DELETE CASCADE,
    name TEXT,
    size INT8,
    drive_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID
);

-- Add indexes
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_files_download_id ON files(download_id);
CREATE INDEX idx_files_user_id ON files(user_id);

-- Add RLS policies
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Downloads policies
CREATE POLICY "Users can view their own downloads"
    ON downloads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads"
    ON downloads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own downloads"
    ON downloads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own downloads"
    ON downloads FOR DELETE
    USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view their own files"
    ON files FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
    ON files FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
    ON files FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
    ON files FOR DELETE
    USING (auth.uid() = user_id); 