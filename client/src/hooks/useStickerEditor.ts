import { useState } from 'react';

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

  // Add a new sticker element
  const addStickerElement = (imageUrl: string) => {
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      imageUrl,
      x: 50, // Default center position
      y: 50,
      width: 100, // Default size
      height: 100,
      rotation: 0,
      scale: 1,
      zIndex: stickers.length + 1 // Place on top of other stickers
    };

    setStickers([...stickers, newSticker]);
    setSelectedSticker(newSticker);
    
    return newSticker;
  };

  // Update a sticker element
  const updateStickerElement = (updatedSticker: StickerElement) => {
    const updatedStickers = stickers.map(sticker => 
      sticker.id === updatedSticker.id ? updatedSticker : sticker
    );
    
    setStickers(updatedStickers);
    
    if (selectedSticker?.id === updatedSticker.id) {
      setSelectedSticker(updatedSticker);
    }
  };

  // Delete a sticker element
  const deleteStickerElement = (id: string) => {
    setStickers(stickers.filter(sticker => sticker.id !== id));
    
    if (selectedSticker?.id === id) {
      setSelectedSticker(null);
    }
  };

  // Select a sticker
  const selectSticker = (id: string | null) => {
    if (id === null) {
      setSelectedSticker(null);
      return;
    }
    
    const sticker = stickers.find(s => s.id === id);
    setSelectedSticker(sticker || null);
  };

  // Bring selected sticker to front
  const bringToFront = (id: string) => {
    const maxZIndex = Math.max(...stickers.map(s => s.zIndex), 0);
    const updatedStickers = stickers.map(sticker => 
      sticker.id === id ? { ...sticker, zIndex: maxZIndex + 1 } : sticker
    );
    
    setStickers(updatedStickers);
    
    if (selectedSticker?.id === id) {
      const updatedSticker = updatedStickers.find(s => s.id === id);
      setSelectedSticker(updatedSticker || null);
    }
  };

  // Send selected sticker to back
  const sendToBack = (id: string) => {
    const minZIndex = Math.min(...stickers.map(s => s.zIndex), 0);
    const updatedStickers = stickers.map(sticker => 
      sticker.id === id ? { ...sticker, zIndex: minZIndex - 1 } : sticker
    );
    
    setStickers(updatedStickers);
    
    if (selectedSticker?.id === id) {
      const updatedSticker = updatedStickers.find(s => s.id === id);
      setSelectedSticker(updatedSticker || null);
    }
  };

  // Get all stickers sorted by z-index (for proper layering)
  const getSortedStickers = () => {
    return [...stickers].sort((a, b) => a.zIndex - b.zIndex);
  };

  return {
    stickers,
    selectedSticker,
    addStickerElement,
    updateStickerElement,
    deleteStickerElement,
    selectSticker,
    bringToFront,
    sendToBack,
    getSortedStickers
  };
}