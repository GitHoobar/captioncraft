// pages/api/youtube.ts
import { NextApiRequest, NextApiResponse } from 'next';
import ytdl from 'ytdl-core';
import fs from 'fs';
import { exec } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { youtubeLink } = req.body;

    try {
      // Download the YouTube video locally
      const videoInfo = await ytdl.getInfo(youtubeLink);
      const videoTitle = videoInfo.videoDetails.title;
      const videoStream = ytdl(youtubeLink);

      const videoFilePath = `./${videoTitle}.mp4`;
      const writeStream = fs.createWriteStream(videoFilePath);

      videoStream.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log('Video downloaded successfully');
        // Convert video to audio using ffmpeg
        const audioFilePath = `./${videoTitle}.mp3`;
        const ffmpegCommand = `ffmpeg -i ${videoFilePath} -vn -acodec libmp3lame -y ${audioFilePath}`;
        exec(ffmpegCommand, (error, stdout, stderr) => {
          if (error) {
            console.error('Error converting video to audio:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }
          if (stderr) {
            console.error('ffmpeg stderr:', stderr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }
          console.log('Video converted to audio successfully');
          // Delete the original video file
          fs.unlinkSync(videoFilePath);
          // Send the audio file path to the client
          res.status(200).json({ success: true, audioFilePath });
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
