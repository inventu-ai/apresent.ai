"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { cn, withRef } from "@udecode/cn";
import { findNode, type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";
import { useEditorRef } from "@udecode/plate-common/react";
import { setNodes } from "@udecode/plate-common";

import { ICON_ELEMENT } from "../lib";
import { IconPicker, getRandomFallbackIcon } from "@/components/ui/icon-picker";
import { useDebouncedSave } from "@/hooks/presentation/useDebouncedSave";
import { usePresentationState } from "@/states/presentation-state";

// Modificado para usar string literal "icon" em vez de typeof ICON_ELEMENT
export interface IconElement extends TElement {
  type: "icon";
  query: string;
  name: string;
}

// Componente de ícone memoizado para evitar re-renderizações desnecessárias
const MemoizedIconPicker = memo(IconPicker);

// Icon component that uses IconPicker
export const IconElementComponent = withRef<typeof PlateElement>(
  ({ element, className, ...props }, ref) => {
    const { query, name: initialName } = element as IconElement;
    const editor = useEditorRef();
    
    // Estado local para controlar a visualização do ícone
    const [currentIconName, setCurrentIconName] = useState<string>("");
    
    // Inicializar o estado local com o initialName na montagem do componente
    useEffect(() => {
      if (initialName && !currentIconName) {
        setCurrentIconName(initialName);
      }
    }, [initialName, currentIconName]);
    // Estado para controlar se o modal está aberto
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    // Estado para controlar se estamos salvando
    const [isSaving, setIsSaving] = useState<boolean>(false);
    // Estado para controlar se devemos ignorar atualizações externas
    const [ignoreExternalUpdates, setIgnoreExternalUpdates] = useState<boolean>(false);
    // Estado para armazenar o último ícone selecionado pelo usuário
    const [lastUserSelectedIcon, setLastUserSelectedIcon] = useState<string | null>(null);
    
    // Usar os hooks no nível superior do componente
    const { saveImmediately } = useDebouncedSave();
    const { slides, setSlides } = usePresentationState();

    // Atualizar o estado local quando o nome do ícone muda externamente
    useEffect(() => {
      // Se estamos ignorando atualizações externas, não fazer nada
      if (ignoreExternalUpdates) {
        return;
      }
      
      // Se o último ícone selecionado pelo usuário é diferente do initialName,
      // e não estamos salvando, atualizar o estado local
      if (initialName && initialName !== currentIconName && !isSaving) {
        // Se o usuário selecionou um ícone recentemente, não sobrescrever
        if (lastUserSelectedIcon && lastUserSelectedIcon === currentIconName) {
          return;
        }
        
        setCurrentIconName(initialName);
      }
    }, [initialName, currentIconName, isSaving, ignoreExternalUpdates, lastUserSelectedIcon]);

    // Função para atualizar o ícone no editor
    const updateIconInEditor = useCallback((iconName: string) => {
      const nodeWithPath = findNode(editor, { match: { id: element.id } });
      
      if (nodeWithPath) {
        const [, path] = nodeWithPath;
        setNodes<IconElement>(editor, { name: iconName }, { at: path });
        return true;
      }
      
      return false;
    }, [editor, element.id]);

    // Função para atualizar o ícone diretamente no estado
    const updateIconInState = useCallback((iconName: string) => {
      const updatedSlides = [...slides];
      let iconUpdated = false;
      
      // Percorrer todos os slides procurando o ícone com o ID correspondente
      for (const slide of updatedSlides) {
        if (!slide.content) continue;
        
        for (let i = 0; i < slide.content.length; i++) {
          const node = slide.content[i];
          if (node && node.type === "icon" && node.id === element.id) {
            // Encontrou o ícone, atualizar o nome
            slide.content[i] = {
              ...node,
              type: "icon", // Garantir que o tipo seja mantido
              query: (node as IconElement).query || "",
              name: iconName,
              children: node.children || [{ text: "" }] // Garantir que children exista
            } as IconElement;
            iconUpdated = true;
            break;
          }
          
          // Verificar também em nós filhos (para ícones dentro de outros elementos)
          if (node && 'children' in node && Array.isArray(node.children)) {
            const updateChildNodes = (children: any[]): boolean => {
              for (let j = 0; j < children.length; j++) {
                const child = children[j];
                if (child && child.type === "icon" && child.id === element.id) {
                  // Encontrou o ícone, atualizar o nome
                  children[j] = {
                    ...child,
                    type: "icon", // Garantir que o tipo seja mantido
                    query: (child as IconElement).query || "",
                    name: iconName,
                    children: child.children || [{ text: "" }] // Garantir que children exista
                  } as IconElement;
                  return true;
                }
                
                // Recursivamente verificar filhos deste nó
                if (child && 'children' in child && Array.isArray(child.children)) {
                  const found = updateChildNodes(child.children);
                  if (found) return true;
                }
              }
              return false;
            };
            
            iconUpdated = updateChildNodes(node.children);
            if (iconUpdated) break;
          }
        }
        
        if (iconUpdated) break;
      }
      
      if (iconUpdated) {
        // Atualizar o estado com os slides modificados
        setSlides(updatedSlides);
        return true;
      }
      
      return false;
    }, [slides, setSlides, element.id]);

    // Função para salvar o ícone no banco de dados
    const saveIconToDatabase = useCallback(() => {
      setIsSaving(true);
      
      // Forçar um salvamento imediato após um pequeno delay
      setTimeout(() => {
        try {
          saveImmediately();
          
          // Resetar o estado de salvamento após um delay
          setTimeout(() => {
            setIsSaving(false);
          }, 500);
        } catch (error) {
          setIsSaving(false);
        }
      }, 100);
    }, [saveImmediately]);

    // Handle icon selection
    const handleIconSelect = useCallback((iconName: string) => {
      // Fechar o modal imediatamente para evitar atualizações desnecessárias
      setIsModalOpen(false);
      
      // Ativar o bloqueio de atualizações externas
      setIgnoreExternalUpdates(true);
      
      // Usar um ícone de fallback aleatório se necessário
      const finalIconName = iconName || getRandomFallbackIcon(element.id as string);
      
      // Registrar este ícone como o último selecionado pelo usuário
      setLastUserSelectedIcon(finalIconName);
      
      // Atualizar o estado local imediatamente para refletir a mudança na interface
      setCurrentIconName(finalIconName);
      
      // Tentar atualizar o ícone no editor
      let updated = updateIconInEditor(finalIconName);
      
      // Se não conseguir atualizar no editor, tentar atualizar diretamente no estado
      if (!updated) {
        updated = updateIconInState(finalIconName);
      }
      
      // Em ambos os casos, forçar um salvamento imediato
      if (updated) {
        saveIconToDatabase();
        
        // Manter o bloqueio de atualizações externas por um tempo maior
        // para garantir que o salvamento seja concluído
        setTimeout(() => {
          setIgnoreExternalUpdates(false);
        }, 2000);
      } else {
        // Se não conseguiu atualizar, desativar o bloqueio após um tempo menor
        setTimeout(() => {
          setIgnoreExternalUpdates(false);
        }, 500);
      }
    }, [element.id, updateIconInEditor, updateIconInState, saveIconToDatabase]);

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn("inline-flex justify-center", className)}
        {...props}
      >
        <div className="mb-2 p-2">
          <MemoizedIconPicker
            defaultIcon={currentIconName || initialName}
            onIconSelect={handleIconSelect}
            contextId={element.id as string}
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        </div>
      </PlateElement>
    );
  },
);

// Create plugin for icon
export const IconPlugin = createPlatePlugin({
  key: ICON_ELEMENT,
  node: {
    isElement: true,
    type: ICON_ELEMENT,
    component: IconElementComponent,
  },
});
