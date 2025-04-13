import { NextResponse } from 'next/server';
import { cancelDownload } from '@/services/downloadService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await cancelDownload(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to cancel download:', error);
    return NextResponse.json(
      { error: 'Failed to cancel download' },
      { status: 500 }
    );
  }
} 