'use client'
import { Gravity, MatterBody } from "@/components/ui/gravity"

function GravityAnimation() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-white">
      <div className="w-full h-full min-h-[500px] flex flex-col relative">
        <div className="pt-20 text-6xl sm:text-7xl md:text-8xl text-black w-full text-center font-bold italic">
          Create
        </div>
        <p className="pt-4 text-base sm:text-xl md:text-2xl text-black w-full text-center">
          presentations with AI
        </p>
        <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full">
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="30%"
            y="10%"
          >
            <div className="text-xl sm:text-2xl md:text-3xl bg-[#0015ff] text-white rounded-full hover:cursor-pointer px-8 py-4">
              AI
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="30%"
            y="30%"
          >
            <div className="text-xl sm:text-2xl md:text-3xl bg-[#E794DA] text-white rounded-full hover:cursor-grab px-8 py-4">
              Design
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="40%"
            y="20%"
            angle={10}
          >
            <div className="text-xl sm:text-2xl md:text-3xl bg-[#1f464d] text-white rounded-full hover:cursor-grab px-8 py-4">
              Templates
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="75%"
            y="10%"
          >
            <div className="text-xl sm:text-2xl md:text-3xl bg-[#ff5941] text-white rounded-full hover:cursor-grab px-8 py-4">
              Creative
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="80%"
            y="20%"
          >
            <div className="text-xl sm:text-2xl md:text-3xl bg-orange-500 text-white rounded-full hover:cursor-grab px-8 py-4">
              Fast
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="50%"
            y="10%"
          >
            <div className="text-xl sm:text-2xl md:text-3xl bg-[#ffd726] text-black rounded-full hover:cursor-grab px-8 py-4">
              Smart
            </div>
          </MatterBody>
        </Gravity>
      </div>
    </div>
  );
}

export { GravityAnimation };
