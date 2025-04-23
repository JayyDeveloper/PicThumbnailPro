import { useState } from 'react';

export interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number;
  alignment: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export default function useTextEditor() {
  const [elements, setElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<TextElement | null>(null);

  // Create a new text element
  const addTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      content: 'YOUR TEXT HERE',
      x: 50, // Center of the canvas
      y: 50, // Center of the canvas
      fontSize: 36,
      fontFamily: 'Inter',
      fontWeight: 'Bold',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      backgroundOpacity: 50,
      alignment: 'center',
      bold: true,
      italic: false,
      underline: false,
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
    return newElement;
  };

  // Update an existing text element
  const updateTextElement = (updatedElement: TextElement) => {
    setElements(prev => 
      prev.map(el => (el.id === updatedElement.id ? updatedElement : el))
    );
    
    if (selectedElement?.id === updatedElement.id) {
      setSelectedElement(updatedElement);
    }
  };

  // Delete a text element
  const deleteTextElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  // Select a text element
  const selectElement = (element: TextElement | null) => {
    setSelectedElement(element);
  };

  // Clear all text elements
  const clearAllElements = () => {
    setElements([]);
    setSelectedElement(null);
  };

  return {
    elements,
    selectedElement,
    addTextElement,
    updateTextElement,
    deleteTextElement,
    selectElement,
    clearAllElements,
  };
}
