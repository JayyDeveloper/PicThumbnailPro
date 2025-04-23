import { useState } from 'react';

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  filterName: string | null;
}

export default function useImageEditor() {
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    filterName: null,
  });

  // Updates a single filter property
  const updateFilter = (filterName: keyof ImageFilters, value: number | string | null) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Updates all filters at once
  const updateAllFilters = (newFilters: Partial<ImageFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Resets all filters to default values
  const resetFilters = () => {
    setFilters({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      filterName: null,
    });
  };

  // Applies a preset filter
  const applyPresetFilter = (presetName: string) => {
    switch (presetName) {
      case 'Normal':
        resetFilters();
        updateFilter('filterName', 'Normal');
        break;
      case 'Muted':
        updateAllFilters({
          brightness: 0,
          contrast: 0,
          saturation: -50,
          blur: 0,
          filterName: 'Muted',
        });
        break;
      case 'Vibrant':
        updateAllFilters({
          brightness: 10,
          contrast: 10,
          saturation: 50,
          blur: 0,
          filterName: 'Vibrant',
        });
        break;
      default:
        break;
    }
  };

  // Generate CSS filter string
  const generateFilterStyle = () => {
    return {
      filter: `brightness(${100 + filters.brightness}%) contrast(${100 + filters.contrast}%) saturate(${100 + filters.saturation}%) blur(${filters.blur}px)`,
    };
  };

  return {
    filters,
    updateFilter,
    updateAllFilters,
    resetFilters,
    applyPresetFilter,
    generateFilterStyle,
  };
}
