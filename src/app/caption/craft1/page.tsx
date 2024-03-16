"use client";

import YouTubePlayer from "../../../../components/YoutubePlayer";
import React, { ChangeEvent, useState, useEffect } from "react";
import axios from "axios";

export default function Craft() {
  const [url, setUrl] = useState<string>("");
  const [Videourl, setVideoUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const buttonClick = async () => {
    try {
      const response = await axios.post("/api/youtube", { youtubeLink: url });
      const data = response.data.transcription
      setTranscript(data);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  const previewButton = () => {
    setVideoUrl(url);
  };

  return (
    <>
      <div className='bg-[url("/images/dirtbgg.png")]'>
        <div className="flex flex-col gap-12 ]">
          <div className="flex justify-center items-center mt-16 gap-4">
            <div className="w-[80%]  flex justif-center items-center ">
              <input
                value={url}
                onChange={handle}
                placeholder="Paste URL here"
                type="text"
                className=" h-12 w-[100%]  bg-[#5E5E5E] border border-white text-white"
              />
            </div>
            <div className="flex justify-center items-center">
              <button
                onClick={() => {
                  previewButton();
                }}
                className="flex justify-center items-center minecraft-btn w-12 h-12 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"
              >
                <img className="scale-[200%]" src="/images/go.png" alt="Go" />
              </button>
            </div>
          </div>
          <div className="w-[83%] mx-auto flex justify-center items-center">
            <div className="relative w-[100%] h-72 xl:h-[70vh] lg:h-[70vh] md:h-[60vh] border border-white bg-[#5E5E5E]"></div>
            {Videourl && (
              <div className="absolute left-[35%] top-[31%] z-5">
                <div className="flex flex-col gap-5">
                  <YouTubePlayer url={Videourl} />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center items-center">
            <button
              onClick={buttonClick}
              className="minecraft-btn h-8 w-32 text-center text-white text-[0.5rem] truncate p-2 border-2 border-b-4 hover:text-yellow-200"
            >
              Generate Transcript
            </button>
          </div>

          <div className="flex justify-center h-[40vh] w-[100%] xl:h-[120vh] lg:h-[90vh] lg:w-[98%] md:h-[80vh] md:w-[100vw] sm:h-[50vh] sm:w-[80vh] items-center ">
            <img
              src="/images/transcript.png"
              alt="Transcript"
              className="size-[80%]  xl:size-[80%] lg:size-[70%] md:size-[70%] sm:size-[70%]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center">
            <div className=" text-black text-4xl">
              Transcript:
              <div>
                {transcript}
              </div>
            </div>
          </div>

    </>
  );
}