import Link from 'next/link';
export default function caption(){
    return (
        <>
        <div className="relative">
          <div className="absolute w-full"><video className="w-full  " autoPlay muted>
            <source src="/images/table.mp4" type="video/mp4" />
          </video></div>
          <div className="absolute left-[44%] top-[85vh] "> <Link href={"/caption/craft"}><button className="minecraft-btn mx-auto w-64 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200">Enchant</button></Link></div>
          
        </div>
        </>
    )
}