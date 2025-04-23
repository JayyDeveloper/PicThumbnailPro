import { useState, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Images, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ReferenceImagesPanelProps {
  onImageSelected: (imageUrl: string) => void;
  stockCategories: {
    id: number;
    name: string;
    imageCount: number;
  }[];
}

export default function ReferenceImagesPanel({ onImageSelected, stockCategories }: ReferenceImagesPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Fetch reference images based on selected category
  const { data: referenceImages = [] } = useQuery({
    queryKey: ["/api/reference-images", selectedCategory],
    enabled: selectedCategory !== null,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reference-images"] });
      onImageSelected(data.url);
      toast({
        title: "Upload Successful",
        description: "Your image has been uploaded.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5242880, // 5MB
  });

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Reference Images</h2>
      
      {/* Image Uploader */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Drag & drop reference images or</p>
        <Button variant="link" className="mt-2 text-primary font-medium text-sm">
          Browse Files
        </Button>
        <input {...getInputProps()} />
      </div>
      
      {/* Stock Categories */}
      <div className="mt-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Stock Categories</h3>
        
        {stockCategories.map(category => (
          <Button
            key={category.id}
            variant="outline"
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-left bg-gray-100 hover:bg-gray-200 rounded-md"
            onClick={() => handleCategoryClick(category.id)}
          >
            <span>{category.name}</span>
            <span className="text-gray-500">({category.imageCount})</span>
          </Button>
        ))}
      </div>
      
      {/* Reference Images Grid */}
      {referenceImages.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {referenceImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-auto rounded-md object-cover aspect-square cursor-pointer hover:opacity-80 transition"
                onClick={() => onImageSelected(image.url)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => onImageSelected(image.url)}
                >
                  <Plus className="h-4 w-4 text-primary" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedCategory && (
        <Button 
          variant="link" 
          className="text-primary text-sm font-medium mt-4 flex items-center"
          onClick={() => setSelectedCategory(null)}
        >
          <Images className="h-4 w-4 mr-1" /> View all reference images
        </Button>
      )}
    </div>
  );
}
