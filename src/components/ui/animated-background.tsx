"use client";

import { Gravity, MatterBody } from "@/components/ui/gravity";
import { useMemo } from "react";

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  showTitle?: boolean;
}

export function AnimatedBackground({ children, showTitle = true }: AnimatedBackgroundProps) {
  // Arrays de cores e fontes para randomização (igual à página principal)
  const backgroundColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-lime-500', 'bg-emerald-500',
    'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500', 'bg-amber-500',
    'bg-sky-500', 'bg-slate-500', 'bg-gray-500', 'bg-zinc-500'
  ];

  const fontFamilies = [
    'font-sans', 'font-serif', 'font-mono',
    'font-bold', 'font-semibold', 'font-medium',
    'font-light', 'font-thin', 'font-normal',
    'font-extrabold', 'font-black', 'font-extralight',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
    'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl',
    'uppercase', 'lowercase', 'capitalize',
    'italic', 'not-italic',
    'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-wider', 'tracking-widest',
    'leading-tight', 'leading-normal', 'leading-relaxed', 'leading-loose'
  ];

  // Função para gerar estilo aleatório (igual à página principal)
  const getRandomStyle = () => {
    const bgColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
    const fontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
    const textColor = Math.random() > 0.5 ? 'text-white' : 'text-black';
    
    return `text-2xl sm:text-3xl md:text-4xl ${bgColor} ${textColor} ${fontFamily} rounded-full px-12 py-6`;
  };

  // Gerar estilos aleatórios para cada palavra (memoizado para não mudar a cada render)
  const wordStyles = useMemo(() => ({
    ai: getRandomStyle(),
    design: getRandomStyle(),
    templates: getRandomStyle(),
    creative: getRandomStyle(),
    fast: getRandomStyle(),
    smart: getRandomStyle(),
    slides: getRandomStyle(),
    charts: getRandomStyle(),
    visual: getRandomStyle(),
    graphics: getRandomStyle(),
    layout: getRandomStyle(),
    themes: getRandomStyle(),
    content: getRandomStyle(),
    animate: getRandomStyle()
  }), []);

  return (
    <>
      <div className="fixed inset-0 w-full h-full z-0 bg-black">
        <div className="w-full h-full min-h-[500px] flex flex-col relative">
          {showTitle && (
            <>
              <div className="pt-32 text-6xl sm:text-7xl md:text-8xl text-white w-full text-center font-normal">
                Create
              </div>
              <p className="pt-1 text-3xl sm:text-4xl md:text-5xl text-white w-full text-center font-serif italic">
                presentations with AI
              </p>
            </>
          )}
          
          <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full" resetOnResize={false}>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="30%"
              y="10%"
              isDraggable={true}
            >
              <div className={wordStyles.ai}>
                AI
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="30%"
              y="30%"
              isDraggable={true}
            >
              <div className={wordStyles.design}>
                Design
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="40%"
              y="20%"
              angle={10}
              isDraggable={true}
            >
              <div className={wordStyles.templates}>
                Templates
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="75%"
              y="10%"
              isDraggable={true}
            >
              <div className={wordStyles.creative}>
                Creative
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="80%"
              y="20%"
              isDraggable={true}
            >
              <div className={wordStyles.fast}>
                Fast
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="50%"
              y="10%"
              isDraggable={true}
            >
              <div className={wordStyles.smart}>
                Smart
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="20%"
              y="15%"
              isDraggable={true}
            >
              <div className={wordStyles.slides}>
                Slides
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="60%"
              y="25%"
              isDraggable={true}
            >
              <div className={wordStyles.charts}>
                Charts
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="85%"
              y="35%"
              angle={-15}
              isDraggable={true}
            >
              <div className={wordStyles.visual}>
                Visual
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="15%"
              y="40%"
              isDraggable={true}
            >
              <div className={wordStyles.graphics}>
                Graphics
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="45%"
              y="35%"
              angle={20}
              isDraggable={true}
            >
              <div className={wordStyles.layout}>
                Layout
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="70%"
              y="40%"
              isDraggable={true}
            >
              <div className={wordStyles.themes}>
                Themes
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="25%"
              y="50%"
              angle={-10}
              isDraggable={true}
            >
              <div className={wordStyles.content}>
                Content
              </div>
            </MatterBody>
            <MatterBody
              matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
              x="55%"
              y="50%"
              isDraggable={true}
            >
              <div className={wordStyles.animate}>
                Animate
              </div>
            </MatterBody>
          </Gravity>
        </div>
      </div>
      
      <div className="relative z-50">
        {children}
      </div>
    </>
  );
} 