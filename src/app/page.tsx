<link rel="stylesheet" media="screen"  type="text/css"/>
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="relative ">
        <div className="absolute  overflow-y-clip z-1">
          <video className="w-full  scale-[120%]" autoPlay loop muted>
            <source src="/images/bgvideo.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute left-[30%] top-20 z-10">
          
          
          <img src="/images/fontbolt.png" alt="Logo" />
          
        </div>
        
      </div>
      <div className="absolute left-[43%] top-[50%] z-5 ">
          <div className="flex flex-col gap-5">
        <Link href={"/caption"}><button className="minecraft-btn mx-auto w-64 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200" >Start</button></Link>
        <button className="minecraft-btn mx-auto w-64 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200">Sign Up</button>
        <button className="minecraft-btn mx-auto w-64 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200">Log In</button>
          </div>
        </div>


    </>
  );
}

