"use client";

import React, { type ReactNode } from "react";
import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PlateElement } from "@/components/text-editor/plate-ui/plate-element";

// Import StairItem and constants
import { StairItem } from "./staircase-item";
import { STAIR_ITEM_ELEMENT, STAIRCASE_ELEMENT } from "../lib";

export interface StaircaseElement extends TElement {
  type: typeof STAIRCASE_ELEMENT;
  hasLongText?: boolean; // Propriedade para indicar que tem texto longo
}

export interface StairItemElement extends TElement {
  type: typeof STAIR_ITEM_ELEMENT;
  spacer?: boolean; // Propriedade para identificar que é um espaçador
}

// Main staircase component with withRef pattern
export const StaircaseElement = withRef<typeof PlateElement>(
  ({ element, children, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children as ReactNode);
    const items = element.children;
    
    // Filtrar itens que são espaçadores para calcular o número real de itens
    const realItems = items.filter(item => !(item as StairItemElement).spacer);
    const totalItems = realItems.length;
    
    // Manter um contador para a numeração correta, ignorando espaçadores
    let realIndex = 0;

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn("my-8", className)}
        {...props}
      >
        <div>
          {childrenArray.map((child, index) => {
            const isItemSpacer = (items[index] as StairItemElement).spacer === true;
            
            // Só incrementar o índice real se não for um espaçador
            const currentRealIndex = isItemSpacer ? -1 : realIndex++;
            
            return (
              <StairItem
                key={index}
                index={currentRealIndex}
                totalItems={totalItems}
                element={items[index] as TElement}
              >
                {child}
              </StairItem>
            );
          })}
        </div>
      </PlateElement>
    );
  },
);

// Create plugin for staircase
export const StaircasePlugin = createPlatePlugin({
  key: STAIRCASE_ELEMENT,
  node: {
    isElement: true,
    type: STAIRCASE_ELEMENT,
    component: StaircaseElement,
  },
});

// Create plugin for stair item
export const StairItemPlugin = createPlatePlugin({
  key: STAIR_ITEM_ELEMENT,
  node: {
    isElement: true,
    type: STAIR_ITEM_ELEMENT,
  },
});
