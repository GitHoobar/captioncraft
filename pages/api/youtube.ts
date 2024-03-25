export const runtime = 'edge';
export const maxDuration = 30;
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import ytdl from 'ytdl-core';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { corsMiddleware } from '../../middleware/cors';
import axios from 'axios';
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

          const apiKey = process.env.CLOUDCONVERT_API_KEY; 

          if (!apiKey) {
            console.error('CloudConvert API key not found');
            res.status(500).json({ error: 'No Cloud Convert API key found.' });
            return;
          }

          const stats = fs.statSync(videoFilePath);   
          const fileSizeInBytes = stats.size;
          const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
          if (fileSizeInMegabytes > 10) {
            console.error('Video file too large:', fileSizeInMegabytes, 'MB');
            res.status(400).json({ error: 'Video file too large. Max file size is 10MB.' });
            return;
          } 

          try {
            const createJobResponse = await axios.post(
              "https://api.cloudconvert.com/v2/jobs",
              {
                tasks: {
                  'import-1': {
                    operation: 'import/base64',
                    file: `${fs.readFileSync(videoFilePath, 'base64')}`,
                    filename: `${sanitizedVideoTitle}.mp4`,
                  },
                  'convert-1': {
                    operation: 'convert',
                    input: 'import-1',
                    input_format: 'mp4',
                    output_format: 'mp3',
                  },
                  'export-1': {
                    operation: 'export/url',
                    input: 'convert-1',
                  },
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  'Content-Type': 'application/json',
                },
              }
            )
            const jobId = createJobResponse.data.data.id;
            console.log(`Job created successfully! Job ID: ${jobId}`);

            while (true) {
              const jobStatusResponse = await axios.get(
                `https://api.cloudconvert.com/v2/jobs/${jobId}`,
                {
                  headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              const jobStatus = jobStatusResponse.data.data.status;
              if (jobStatus === 'finished') {
                console.log('Job completed successfully');
                break;
              } else if (jobStatus === 'error') {
                console.error('Job failed');
                res.status(500).json({ error: 'Internal Server Error' });
                return;
              } else {
                console.log('Job in progress');
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }  

            const jobResponse = await axios.get(  
              `https://api.cloudconvert.com/v2/jobs/${jobId}`,
              {
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  'Content-Type': 'application/json',
                },
              }
            );    
              
            const audioFileUrl = jobResponse.data.data.tasks.find(
              (task: {[key: string]: any}) => task.name === 'export-1'
            ).result.files[0].url;
            console.log(`Conversion successful! Audio file URL: ${audioFileUrl}`);

            try {
              
              const transcription = await transcribeAudio(audioFileUrl);
              const tpath = path.join(tmpDir, 'transcription.txt');

              const transcriptionString = JSON.stringify(transcription, null, 2);
              fs.writeFile(tpath, transcriptionString, (err) => {
                if (err) {
                  console.error('Error writing file:', err);
                } else {
                  console.log('Transcription saved to:', tpath);

                  
                  fs.unlink(videoFilePath, (audioUnlinkError) => {
                    if (audioUnlinkError) {
                      console.error('Error deleting audio file:', audioUnlinkError);
                    } else {
                      console.log('Video file deleted successfully');
                    }
                  });
                  res.status(200).json({ transcription: transcriptionString });
                }
              });
            } catch (writeError) {
              console.error('Error saving transcription to file:', writeError);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          } catch (error) {
            console.error('Error converting video to audio:', error );
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


async function transcribeAudio(audioFileUrl: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const tmpDir = os.tmpdir();
    const tempFilePath = path.join(tmpDir, 'temp.mp3');

        
    const response = await axios.get(audioFileUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });


    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    fs.unlinkSync(tempFilePath);

    return transcription;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}


