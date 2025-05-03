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
  const { data: referenceImages = [] } = useQuery<any[]>({
    queryKey: ["/api/reference-images", selectedCategory],
    enabled: selectedCategory !== null,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
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
    <div>
      {/* Main Image Uploader */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
          isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
        }`}
      >
        <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Drag & Drop Your Image Here</h3>
        <p className="text-gray-500 mb-4">Upload a reference image to transform into a YouTube thumbnail</p>
        <Button className="mb-2">
          <Upload className="h-4 w-4 mr-2" /> Browse Files
        </Button>
        <input {...getInputProps()} />
        <p className="text-xs text-gray-400 mt-2">Max size: 5MB - Supported formats: JPEG, PNG, GIF</p>
      </div>
      
      {/* Stock Categories */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Stock Categories</h3>
          {selectedCategory && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary text-sm flex items-center"
              onClick={() => setSelectedCategory(null)}
            >
              <Images className="h-4 w-4 mr-1" /> View All
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stockCategories.map(category => (
            <Button
              key={category.id}
              variant="outline"
              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 h-auto"
              onClick={() => handleCategoryClick(category.id)}
            >
              <span>{category.name}</span>
              <span className="text-gray-500 text-xs ml-1">({category.imageCount})</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Reference Images Grid */}
      {referenceImages.length > 0 ? (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Choose a Template</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {referenceImages.map((image) => (
              <div key={image.id} className="relative group overflow-hidden rounded-lg">
                <img
                  src={image.url}
                  alt={image.alt || "Reference image"}
                  className="w-full h-auto object-cover aspect-video rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => onImageSelected(image.url)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button 
                    size="sm"
                    variant="secondary" 
                    className="rounded-md"
                    onClick={() => onImageSelected(image.url)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // If no category is selected, show a message
        !selectedCategory && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Images className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Choose a Category</h3>
            <p className="text-gray-500">Select a category to browse stock images</p>
          </div>
        )
      )}
    </div>
  );
}
