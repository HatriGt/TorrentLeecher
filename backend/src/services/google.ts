import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables validation
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  throw new Error('Missing required Google Drive credentials in environment variables');
}

// Google Drive setup with service account
const auth = new google.auth.JWT({
  email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

// Initialize the auth client
auth.authorize((err) => {
  if (err) {
    console.error('Error authorizing service account:', err);
    process.exit(1);
  }
  console.log('Service account authorized successfully');
});

// Set up Google Drive API
export const drive = google.drive({ version: 'v3', auth }); 