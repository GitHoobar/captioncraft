"use client"

import YouTubePlayer from "../../../../components/YoutubePlayer";
import React, { ChangeEvent, useState } from 'react';

export default function Craft(){
    const [url, setUrl] = useState<string>('');
    const [Videourl, setVideoUrl] = useState<string>('');
  
    const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value)
    }

    const buttonClck = async () => {
      try {
        const response = await fetch('/api/youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ youtubeLink: url }),
        });
        if (!response.ok) {
          throw new Error('Failed to download video');
        }
        const data = await response.json();
        console.log('Video downloaded:', data.filePath);
      } catch (error) {
        console.error('Error downloading video:', error);
      }
    };
    
    return(
        <><div className="h-[100%]">
        <div className="relative">
            <div className="absolute w-full z-1" ><img className="w-full" src="/images/dirtbgg.png" ></img></div>
            <div className="absolute left-[9vw] top-[5vh] z-10"><img src="/images/crafttab.png"></img>
            </div>
            <div className="absolute left-[9vw] top-[80vh] z-10"><img src="/images/crafttabflip.png"></img></div>
            <div className="absolute w-full top-[100vh] z-1" ><img className="w-full" src="/images/dirtbgg.png" ></img></div>
            
        </div>
        </div>
        <div className="z-20 relative h-[100vh]">
        <div className="absolute top-[20%] left-[17%] h-[100%] ">
                <input value={url} onChange={handle} placeholder="Paste URL here" type="text" className="w-[550%] h-[7%] bg-[#5E5E5E] border border-white text-white"></input>
                
        </div>
        <div className="absolute top-[20.5%] left-[75%]">
        <button onClick={buttonClck} className="minecraft-btn mx-auto w-16 h-16 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"><img  className="scale-[250%]" src="/images/go.png"></img></button>
        </div>
        
        
        
        <div className="absolute h-[70%] w-[65%] top-[35%] left-[17%] border border-white bg-[#5E5E5E]">
            
        </div>
        <div className="absolute top-[125%] left-[34%]"><img className="scale-[180%]" src="/images/transcript.png"></img></div>
        
        <div className="absolute left-[44%] top-[70%]">
            <button className="minecraft-btn mx-auto w-64 text-center text-white truncate p-2 border-2 border-b-4 hover:text-yellow-200">
                Generate Transcript
            </button>
        </div>
        <div className="absolute left-[35%] top-[31%] z-5 ">
          <div className="flex flex-col gap-5">
            <YouTubePlayer url={Videourl}/>
          </div>
        </div>
        </div>
        </>
    )
}