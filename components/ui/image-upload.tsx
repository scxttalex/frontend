import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { useTheme } from 'next-themes';

interface ImageUploadProps {
  onUpload: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const { theme, setTheme } = useTheme(); 
  const [isMounted, setIsMounted] = useState(false); // Track if client-side is mounted
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    // This ensures application only applies theme-dependent styles once the client is mounted
    setIsMounted(true);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onUpload(file);
    }
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFileName(file.name);
      onUpload(file);
    }
    e.preventDefault();
  };

  if (!isMounted) {
    return null; // Return null during SSR to avoid hydration mismatch
  }

  return (
    <div
      className={`border-2 p-6 rounded-lg transition-all ${
        dragging
          ? "border-blue-500 bg-gray-700" // Dark mode when dragging (darker background)
          : theme === "dark"
          ? "bg-gray-800 border-gray-600" // Dark mode default background and border for subtle look
          : "bg-gray-50 border-gray-300" // Light mode background and border
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Cloud Upload Icon */}
        <CloudUpload
          className={`w-12 h-12 mb-4 ${
            theme === "dark" ? "text-gray-200" : "text-gray-600"
          }`} 
        />
        <p
          className={`text-center text-lg font-semibold mt-4 ${
            theme === "dark" ? "text-gray-100" : "text-gray-700"
          }`} 
        >
          {fileName ? `Selected: ${fileName}` : "Click or drag files here to upload"}
        </p>
        <div className="mt-4">
          <Button
            variant="outline"
            type="button" // Prevent form submission
            onClick={() => document.getElementById("fileInput")?.click()}
            className={`${
              theme === "dark"
                ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
          >
            Choose File
          </Button>
        </div>
        <input
          id="fileInput"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
