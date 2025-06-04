'use client'
import { Gravity, MatterBody } from "@/components/ui/gravity"

function Preview() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-black">
      <div className="w-full h-full min-h-[500px] flex flex-col relative">
        <div className="pt-32 text-6xl sm:text-7xl md:text-8xl text-white w-full text-center font-normal">
          Create
        </div>
        <p className="pt-1 text-3xl sm:text-4xl md:text-5xl text-white w-full text-center font-serif italic">
          presentations with AI
        </p>
        <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full" resetOnResize={false}>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="30%"
            y="10%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#0015ff] text-white rounded-full hover:cursor-pointer px-12 py-6">
              AI
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="30%"
            y="30%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#E794DA] text-white rounded-full hover:cursor-grab px-12 py-6">
              Design
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="40%"
            y="20%"
            angle={10}
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#1f464d] text-white rounded-full hover:cursor-grab px-12 py-6">
              Templates
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="75%"
            y="10%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#ff5941] text-white rounded-full hover:cursor-grab px-12 py-6">
              Creative
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="80%"
            y="20%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-orange-500 text-white rounded-full hover:cursor-grab px-12 py-6">
              Fast
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="50%"
            y="10%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#ffd726] text-black rounded-full hover:cursor-grab px-12 py-6">
              Smart
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="20%"
            y="15%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#9c27b0] text-white rounded-full hover:cursor-grab px-12 py-6">
              Slides
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="60%"
            y="25%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#00bcd4] text-white rounded-full hover:cursor-grab px-12 py-6">
              Charts
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="85%"
            y="35%"
            angle={-15}
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#4caf50] text-white rounded-full hover:cursor-grab px-12 py-6">
              Visual
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="15%"
            y="40%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#ff9800] text-white rounded-full hover:cursor-grab px-12 py-6">
              Graphics
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="45%"
            y="35%"
            angle={20}
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#f44336] text-white rounded-full hover:cursor-grab px-12 py-6">
              Layout
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="70%"
            y="40%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#673ab7] text-white rounded-full hover:cursor-grab px-12 py-6">
              Themes
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="25%"
            y="50%"
            angle={-10}
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#795548] text-white rounded-full hover:cursor-grab px-12 py-6">
              Content
            </div>
          </MatterBody>
          <MatterBody
            matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
            x="55%"
            y="50%"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl bg-[#607d8b] text-white rounded-full hover:cursor-grab px-12 py-6">
              Animate
            </div>
          </MatterBody>
        </Gravity>
      </div>
    </div>
  );
}

export { Preview };
