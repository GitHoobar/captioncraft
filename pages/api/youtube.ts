// pages/api/youtube.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
require('dotenv').config();


function sanitizeFileName(fileName: string): string {
  // Replace any character that is not a letter, number, or underscore with an empty string
  return fileName.replace(/[^a-zA-Z0-9_]/g, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method === 'POST') {
    const { youtubeLink } = req.body;
    if(!youtubeLink){
      return res.status(400).json({message: "Youtube Link Required"})
    }

    try {
      // Download the YouTube video locally
      const videoInfo = await ytdl.getInfo(youtubeLink);
      const videoTitle = videoInfo.videoDetails.title;
      const videoStream = ytdl(youtubeLink, {filter: 'audioandvideo', quality: 'highest'});
      const sanitizedVideoTitle = sanitizeFileName(videoTitle);

      const videoFilePath = `./${sanitizedVideoTitle}.mp4`;
      const writeStream = fs.createWriteStream(videoFilePath);

      videoStream.pipe(writeStream);

      writeStream.on('finish', async () => {
        console.log('Video downloaded successfully');

        // Convert video to audio using ffmpeg

        const audioFilePath = `./test.mp3`;
        const bitrate = '128k'
        const ffmpegCommand = `ffmpeg -i ${videoFilePath} -vn -acodec libmp3lame -b:a ${bitrate}  -y ${audioFilePath}`;

        exec(ffmpegCommand, async(error, stdout, stderr) => {
          console.log('Video converted to audio successfully');
          
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
            const tpath = path.join(__dirname, "../../../../" ,'transcription.txt');

            const transcriptionString = JSON.stringify(transcription, null, 2); // Pretty-print with 2 spaces indentation
            fs.writeFile(tpath, transcriptionString, (err) => {
              if (err) {
                  console.error('Error writing file:', err);
              } else {
                  console.log('Transcription saved to:', tpath);

                  // Delete the audio file
                  try {
                    fs.unlinkSync(audioFilePath);
                    console.log('Audio file deleted successfully');
                  } catch (audioUnlinkError) {
                    console.error('Error deleting audio file:', audioUnlinkError);
                  }
              }
            });

            // Send the audio file path and the transcription file path to the client
            res.status(200).json({transcription: transcriptionString });
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

    return transcription
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}
