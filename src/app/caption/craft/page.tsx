export default function craft(){
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
                <input placeholder="Paste URL here" type="text" className="w-[550%] h-[7%] bg-[#5E5E5E] border border-white text-white"></input>
                
        </div>
        <div className="absolute top-[20.5%] left-[75%]">
        <button className="minecraft-btn mx-auto w-16 h-16 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"><img  className="scale-[250%]" src="/images/go.png"></img></button>
        </div>
        
        
        
        <div className="absolute h-[70%] w-[65%] top-[35%] left-[17%] border border-white bg-[#5E5E5E]"></div>
        <div className="absolute top-[125%] left-[34%]"><img className="scale-[180%]" src="/images/transcript.png"></img></div>
        

        </div>
        </>
    )
}