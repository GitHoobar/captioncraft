<link rel="stylesheet" media="screen"  type="text/css"/>
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div>
      <div className="relative h-auto" >
        <div className="absolute  overflow-y-clip desktop-only z-1">
          <video className="w-[100%] h-auto  scale-[120%]" autoPlay loop muted>
            <source src="/images/bgvideo.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute  overflow-y-clip tablet-only z-1">
          <img src="/images/tab.png" className=" w-100 h-auto scale-[100%]"></img>
        </div> 
        <div className="absolute  overflow-y-clip mobile-only z-1">
          <img src="/images/mob.png" className=" w-100 h-auto scale-[100%]"></img>
        </div> 
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          
          
          <img className="flex justify-center items-center pt-[10rem]" src="/images/fontbolt.png" alt="Logo" />
          
        </div>
        
      </div>
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5 ">
          <div className="flex flex-col gap-5">
        <Link href={"/caption"}>
        <button className="minecraft-btn  xl:w-64 lg:w-60 md:w-52 sm:w-44 w-40 h-7 sm:h-7 md:h-7 xl:h-8 lg:h-8 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200" >Start</button></Link>
        <button className="minecraft-btn  xl:w-64 lg:w-60 md:w-52 sm:w-44 w-40 h-7 sm:h-7 md:h-7 xl:h-8 lg:h-8 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200">Sign Up</button>
        <button className="minecraft-btn  xl:w-64 lg:w-60 md:w-52 sm:w-44 w-40 h-7 sm:h-7 md:h-7 xl:h-8 lg:h-8 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200">Log In</button>
          </div>
        </div>

    </div>

    
    </>
  );
}

