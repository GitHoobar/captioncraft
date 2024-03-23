import { NextApiRequest, NextApiResponse } from 'next';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import ytdl from 'ytdl-core';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { corsMiddleware } from '../../middleware/cors';
import  CloudConvert from 'cloudconvert'; 
require('dotenv').config();

const cors = corsMiddleware;


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


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  cors(req, res, async () => {
    
    if (req.method === 'POST') {
      const { youtubeLink } = req.body;
      if (!youtubeLink) {
        return res.status(400).json({ message: "Youtube Link Required" });
      }

      try {
        
        const videoInfo = await ytdl.getInfo(youtubeLink);
        const videoTitle = videoInfo.videoDetails.title;
        const videoStream = ytdl(youtubeLink, { filter: 'audioandvideo', quality: 'highest' });
        const sanitizedVideoTitle = sanitizeFileName(videoTitle);

        const tmpDir = os.tmpdir();
        const videoFilePath = path.join(tmpDir, 'tmp.mp4');
        const writeStream = fs.createWriteStream(videoFilePath);

        videoStream.pipe(writeStream);

        writeStream.on('finish', async () => {
          console.log('Video downloaded successfully');

          const apiKey = process.env.CLOUDCONVERT_API_KEY ?? ''; 
          const cloudConvert = new CloudConvert(apiKey);

          
          const audioFilePath = path.join(tmpDir, 'test.mp3');
          const conversion = await cloudConvert.jobs.convert({
            inputformat: 'mp4',
            outputformat: 'mp3',
            input: 'upload',
            file: fs.createReadStream(videoFilePath),
          });

          
          if (conversion && conversion.step === 'finished') {
            
            const convertedAudio = await cloudConvert.download(conversion.output.url);
            fs.writeFileSync(audioFilePath, convertedAudio);

            console.log('Video converted to audio successfully');

            
            fs.unlinkSync(videoFilePath);
            console.log('Video file deleted successfully');

            try {
              
              const transcription = await transcribeAudio(audioFilePath);
              const tpath = path.join(tmpDir, 'transcription.txt');

              const transcriptionString = JSON.stringify(transcription, null, 2);
              fs.writeFile(tpath, transcriptionString, (err) => {
                if (err) {
                  console.error('Error writing file:', err);
                } else {
                  console.log('Transcription saved to:', tpath);

                  
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
          } else {
            console.error('Error converting video to audio:', conversion.message);
            res.status(500).json({ error: 'Internal Server Error' });
          }
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
