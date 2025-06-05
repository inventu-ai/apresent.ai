"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Check } from "lucide-react";

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

interface ImageDirectEditorProps {
  imageUrl?: string;
  initialPosition: ImagePosition;
  onPositionChange: (position: ImagePosition) => void;
  onEditComplete: () => void;
  className?: string; // Classe adicional para controle de estilo
  layoutType?: string; // Tipo de layout (vertical, left, right)
}

export function ImageDirectEditor({
  imageUrl,
  initialPosition,
  onPositionChange,
  onEditComplete,
  className,
  layoutType,
}: ImageDirectEditorProps) {
  // Estado para controlar a posição e escala da imagem
  const [position, setPosition] = useState<ImagePosition>(initialPosition);
  
  // Referências para o contêiner e a imagem
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Estado para controlar o arrasto
  const isDraggingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  
  // Função para aumentar o zoom
  const handleZoomIn = () => {
    setPosition(prev => ({
      ...prev,
      scale: Math.min(3, prev.scale + 0.1),
    }));
  };
  
  // Função para diminuir o zoom
  const handleZoomOut = () => {
    setPosition(prev => ({
      ...prev,
      scale: Math.max(1, prev.scale - 0.1),
    }));
  };
  
  // Função para centralizar a imagem
  const handleCenter = () => {
    setPosition(prev => ({
      ...prev,
      x: 50,
      y: 50,
    }));
  };
  
  // Função para resetar para os valores padrão
  const handleReset = () => {
    setPosition({
      x: 50,
      y: 50,
      scale: 1,
    });
  };
  
  // Função para aplicar as alterações
  const handleApply = () => {
    onPositionChange(position);
    onEditComplete();
  };
  
  // Funções para manipulação do arrasto da imagem
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    isDraggingRef.current = true;
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    
    // Prevenir comportamento padrão de arrastar imagem
    e.preventDefault();
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    // Calcular o deslocamento
    const deltaX = e.clientX - lastPositionRef.current.x;
    const deltaY = e.clientY - lastPositionRef.current.y;
    
    // Atualizar a última posição
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    
    // Calcular a nova posição em porcentagem
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Converter o deslocamento em pixels para porcentagem
    const deltaXPercent = (deltaX / containerWidth) * 100;
    const deltaYPercent = (deltaY / containerHeight) * 100;
    
    // Limitar a posição entre 0 e 100
    const newX = Math.max(0, Math.min(100, position.x - deltaXPercent));
    const newY = Math.max(0, Math.min(100, position.y - deltaYPercent));
    
    setPosition(prev => ({
      ...prev,
      x: newX,
      y: newY,
    }));
  };
  
  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };
  
  // Efeito para adicionar e remover os event listeners globais
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      
      // Calcular o deslocamento
      const deltaX = e.clientX - lastPositionRef.current.x;
      const deltaY = e.clientY - lastPositionRef.current.y;
      
      // Atualizar a última posição
      lastPositionRef.current = { x: e.clientX, y: e.clientY };
      
      // Calcular a nova posição em porcentagem
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Converter o deslocamento em pixels para porcentagem
      const deltaXPercent = (deltaX / containerWidth) * 100;
      const deltaYPercent = (deltaY / containerHeight) * 100;
      
      // Limitar a posição entre 0 e 100
      const newX = Math.max(0, Math.min(100, position.x - deltaXPercent));
      const newY = Math.max(0, Math.min(100, position.y - deltaYPercent));
      
      setPosition(prev => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    };
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [position.x, position.y]);
  
  // Efeito para aplicar as alterações quando a posição muda
  useEffect(() => {
    // Atualizar a posição da imagem em tempo real
    if (imageRef.current) {
      imageRef.current.style.objectPosition = `${position.x}% ${position.y}%`;
      imageRef.current.style.transform = `scale(${position.scale})`;
    }
  }, [position]);
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden", 
        layoutType === "vertical" ? "h-[300px]" : "h-full", 
        "w-full", 
        className
      )}
      style={{
        zIndex: layoutType === "vertical" ? 200 : 50
      }}
    >
      {/* Área de edição da imagem */}
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          zIndex: layoutType === "vertical" ? 200 : 50, // Garantir que fique acima de outros elementos
          height: layoutType === "vertical" ? "300px" : "100%",
          width: "100%",
        }}
      >
        {imageUrl ? (
          <>
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Imagem para ajuste"
              className="absolute h-full w-full cursor-move object-cover"
              style={{
                objectPosition: `${position.x}% ${position.y}%`,
                transform: `scale(${position.scale})`,
                transformOrigin: 'center',
                zIndex: 51, // Garantir que a imagem fique acima do contêiner
              }}
              draggable={false}
            />
            
            {/* Sobreposição com instruções */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10" style={{ zIndex: layoutType === "vertical" ? 202 : 52 }}>
              <div className="rounded-md bg-black/50 p-2 text-center text-white">
                <p>Arraste para ajustar a posição</p>
              </div>
            </div>
            
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Nenhuma imagem disponível</p>
          </div>
        )}
      </div>
      
      {/* Barra de ferramentas */}
      <div 
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 p-2"
        style={{ zIndex: layoutType === "vertical" ? 204 : 54 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          onClick={handleZoomOut}
          title="Diminuir zoom"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          onClick={handleZoomIn}
          title="Aumentar zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          onClick={handleCenter}
          title="Centralizar"
        >
          <Maximize className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-white/20"
          onClick={handleReset}
          title="Resetar"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <div className="mx-1 h-4 w-px bg-white/30" />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/40"
          onClick={handleApply}
          title="Concluído"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
