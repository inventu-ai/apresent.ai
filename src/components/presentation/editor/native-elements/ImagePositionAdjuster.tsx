"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MoveHorizontal, MoveVertical, ZoomIn } from "lucide-react";

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

interface ImagePositionAdjusterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string;
  initialPosition?: ImagePosition;
  onPositionChange: (position: ImagePosition) => void;
}

const DEFAULT_POSITION: ImagePosition = {
  x: 50,
  y: 50,
  scale: 1,
};

export function ImagePositionAdjuster({
  open,
  onOpenChange,
  imageUrl,
  initialPosition = DEFAULT_POSITION,
  onPositionChange,
}: ImagePositionAdjusterProps) {
  // Estado para controlar a posição e escala da imagem
  const [position, setPosition] = useState<ImagePosition>(initialPosition);
  
  // Referência para o contêiner da imagem
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  
  // Resetar a posição para os valores iniciais quando o modal é aberto
  useEffect(() => {
    if (open) {
      setPosition(initialPosition);
    }
  }, [open, initialPosition]);
  
  // Função para aplicar as alterações
  const handleApply = () => {
    onPositionChange(position);
    onOpenChange(false);
  };
  
  // Função para resetar para os valores padrão
  const handleReset = () => {
    setPosition(DEFAULT_POSITION);
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
    
    if (open) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [open, position.x, position.y]);
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-xl overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Ajustar Imagem</SheetTitle>
          <SheetDescription>
            Arraste a imagem para ajustar a posição e use o controle deslizante para ajustar o zoom.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Área de visualização e ajuste da imagem */}
          <div 
            ref={containerRef}
            className="relative h-[300px] overflow-hidden rounded-md border border-border bg-muted"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {imageUrl ? (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Imagem para ajuste"
                className="absolute h-full w-full object-cover"
                style={{
                  transform: `scale(${position.scale}) translate(-${position.x}%, -${position.y}%)`,
                  transformOrigin: '0 0',
                  cursor: 'move',
                }}
                draggable={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Nenhuma imagem disponível</p>
              </div>
            )}
          </div>
          
          {/* Controles de ajuste */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="zoom-slider" className="flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Zoom
                </Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(position.scale * 100)}%
                </span>
              </div>
              <Slider
                id="zoom-slider"
                min={1}
                max={3}
                step={0.1}
                value={[position.scale]}
                onValueChange={(values) => {
                  const newScale = values[0];
                  if (typeof newScale === 'number') {
                    setPosition({
                      ...position,
                      scale: newScale,
                    });
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="horizontal-slider" className="flex items-center gap-2">
                  <MoveHorizontal className="h-4 w-4" />
                  Posição Horizontal
                </Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(position.x)}%
                </span>
              </div>
              <Slider
                id="horizontal-slider"
                min={0}
                max={100}
                step={1}
                value={[position.x]}
                onValueChange={(values) => {
                  const newX = values[0];
                  if (typeof newX === 'number') {
                    setPosition({
                      ...position,
                      x: newX,
                    });
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="vertical-slider" className="flex items-center gap-2">
                  <MoveVertical className="h-4 w-4" />
                  Posição Vertical
                </Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(position.y)}%
                </span>
              </div>
              <Slider
                id="vertical-slider"
                min={0}
                max={100}
                step={1}
                value={[position.y]}
                onValueChange={(values) => {
                  const newY = values[0];
                  if (typeof newY === 'number') {
                    setPosition({
                      ...position,
                      y: newY,
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={handleReset}>
            Resetar
          </Button>
          <Button onClick={handleApply}>
            Aplicar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
