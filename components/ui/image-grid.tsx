import React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function AreaImagesGrid({
  images,
  onDeleteImage, 
}: {
  images: string[];
  onDeleteImage: (index: number) => void; // Function to pass index to the parent
}) {
  return (
    <div>
      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="relative">
              {/* Image Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative w-full h-32 overflow-hidden rounded-lg cursor-pointer">
                    <Image
                      src={image}
                      alt={`Area image ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="flex justify-center items-center">
                  <Image
                    src={image}
                    alt={`Area image ${index + 1}`}
                    width={500}
                    height={500}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                </DialogContent>
              </Dialog>

              {/* Delete button (sends index to parent) */}
              <Button
                variant="destructive"
                className="absolute top-2 right-2 p-2"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the dialog from opening
                  onDeleteImage(index); // Send index to parent
                }}
              >
                <Trash2 className="text-white" />
              </Button>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-32 text-gray-500 border rounded-lg">
            No Images Available
          </div>
        )}
      </div>
    </div>
  );
}
