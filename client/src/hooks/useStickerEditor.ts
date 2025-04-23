import { useState } from "react";

export interface StickerElement {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export default function useStickerEditor() {
  const [stickers, setStickers] = useState<StickerElement[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<StickerElement | null>(null);

  const addStickerElement = (imageUrl: string) => {
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      imageUrl,
      x: 50,
      y: 50,
      width: 150,
      height: 150,
      rotation: 0,
      scale: 1,
      zIndex: stickers.length + 1
    };

    setStickers([...stickers, newSticker]);
    setSelectedSticker(newSticker);
    return newSticker;
  };

  const updateStickerElement = (updatedSticker: StickerElement) => {
    setStickers(stickers.map(sticker => 
      sticker.id === updatedSticker.id ? updatedSticker : sticker
    ));
    setSelectedSticker(updatedSticker);
  };

  const deleteStickerElement = (id: string) => {
    setStickers(stickers.filter(sticker => sticker.id !== id));
    if (selectedSticker && selectedSticker.id === id) {
      setSelectedSticker(null);
    }
  };

  const selectStickerElement = (id: string | null) => {
    if (id === null) {
      setSelectedSticker(null);
      return;
    }
    const sticker = stickers.find(s => s.id === id);
    setSelectedSticker(sticker || null);
  };

  const bringToFront = (id: string) => {
    if (!id) return;
    
    const maxZIndex = Math.max(...stickers.map(s => s.zIndex), 0);
    const updatedStickers = stickers.map(sticker => 
      sticker.id === id ? { ...sticker, zIndex: maxZIndex + 1 } : sticker
    );
    
    setStickers(updatedStickers);
    
    const updatedSticker = updatedStickers.find(s => s.id === id);
    if (updatedSticker) {
      setSelectedSticker(updatedSticker);
    }
  };
  
  const sendToBack = (id: string) => {
    if (!id) return;
    
    const minZIndex = Math.min(...stickers.map(s => s.zIndex), 0);
    const updatedStickers = stickers.map(sticker => 
      sticker.id === id ? { ...sticker, zIndex: minZIndex - 1 } : sticker
    );
    
    setStickers(updatedStickers);
    
    const updatedSticker = updatedStickers.find(s => s.id === id);
    if (updatedSticker) {
      setSelectedSticker(updatedSticker);
    }
  };

  const resizeSticker = (id: string, width: number, height: number) => {
    const updatedStickers = stickers.map(sticker => 
      sticker.id === id ? { ...sticker, width, height } : sticker
    );
    
    setStickers(updatedStickers);
    
    const updatedSticker = updatedStickers.find(s => s.id === id);
    if (updatedSticker && selectedSticker && selectedSticker.id === id) {
      setSelectedSticker(updatedSticker);
    }
  };

  const rotateSticker = (id: string, rotation: number) => {
    const updatedStickers = stickers.map(sticker => 
      sticker.id === id ? { ...sticker, rotation } : sticker
    );
    
    setStickers(updatedStickers);
    
    const updatedSticker = updatedStickers.find(s => s.id === id);
    if (updatedSticker && selectedSticker && selectedSticker.id === id) {
      setSelectedSticker(updatedSticker);
    }
  };

  return {
    stickers,
    selectedSticker,
    addStickerElement,
    updateStickerElement,
    deleteStickerElement,
    selectStickerElement,
    bringToFront,
    sendToBack,
    resizeSticker,
    rotateSticker,
    setSelectedSticker
  };
}