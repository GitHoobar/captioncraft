
import { NextApiRequest, NextApiResponse } from 'next';
import type {VercelRequest,VercelResponse} from '@vercel/node';
import OpenAI from 'openai';
import ytdl from 'ytdl-core';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { corsMiddleware } from '../../middleware/cors';
import { exec } from 'child_process';
require('dotenv').config();

const cors = corsMiddleware;

// Function to sanitize file name
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9_]/g, '');
}

function createTempDirIfNotExists() {
  const tmpDirPath = '/tmp'; 

  
  if (!fs.existsSync(tmpDirPath)) {
    
    fs.mkdirSync(tmpDirPath);
    console.log('Temporary directory created:', tmpDirPath);
  } else {
    console.log('Temporary directory already exists:', tmpDirPath);
  }
}

// Define the API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS middleware
  cors(req, res, async () => {
    // Check request method
    if (req.method === 'POST') {
      const { youtubeLink } = req.body;
      if (!youtubeLink) {
        return res.status(400).json({ message: "Youtube Link Required" });
      }

      try {
        // Download the YouTube video locally
        const videoInfo = await ytdl.getInfo(youtubeLink);
        const videoTitle = videoInfo.videoDetails.title;
        const videoStream = ytdl(youtubeLink, { filter: 'audioandvideo', quality: 'highest' });
        const sanitizedVideoTitle = sanitizeFileName(videoTitle);

        const tmpDir = os.tmpdir();
        const videoFilePath = path.join(tmpDir,'tmp.mp4');
        const writeStream = fs.createWriteStream(videoFilePath);

        videoStream.pipe(writeStream);

        writeStream.on('finish', async () => {
          console.log('Video downloaded successfully');

          // Convert video to audio using ffmpeg
          const audioFilePath = path.join(tmpDir,'test.mp3');
          const bitrate = '128k';
          const ffmpegCommand = `ffmpeg -i ${videoFilePath} -vn -acodec libmp3lame -b:a ${bitrate}  -y ${audioFilePath}`;

          exec(ffmpegCommand, async (error, stdout, stderr) => {
            console.log('Video converted to audio successfully');

            if (error) {
              console.error('Error converting video to audio:', error);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }

            if (!fs.existsSync(audioFilePath)) {
              console.error('Error: Audio file not found');
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
            // Delete the original video file
            try {
              fs.unlinkSync(videoFilePath);
              console.log('Video file deleted successfully');
            } catch (unlinkError) {
              console.error('Error deleting video file:', unlinkError);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }

            try {
              // Transcribing
              const transcription = await transcribeAudio(audioFilePath);
              const tpath = path.join(tmpDir,'transcription.txt');

              const transcriptionString = JSON.stringify(transcription, null, 2); // Pretty-print with 2 spaces indentation
              fs.writeFile(tpath, transcriptionString, (err) => {
                if (err) {
                  console.error('Error writing file:', err);
                } else {
                  console.log('Transcription saved to:', tpath);

                  // Delete the audio file
                  fs.unlink(audioFilePath, (audioUnlinkError) => {
                    if (audioUnlinkError) {
                      console.error('Error deleting audio file:', audioUnlinkError);
                    } else {
                      console.log('Audio file deleted successfully');
                    }
                  });
                  res.status(200).json({ transcription: transcriptionString });
                }
              });
            } catch (writeError) {
              console.error('Error saving transcription to file:', writeError);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          });
        });
      } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  });
}

// Function to transcribe audio
async function transcribeAudio(audioFilePath: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath), // Pass the file path directly
      model: "whisper-1",
    });

    return transcription;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
