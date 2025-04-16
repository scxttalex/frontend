"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CameraOff, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import AreaImagesGrid from "@/components/ui/image-grid";
import ImageUpload from "@/components/ui/image-upload";

export default function AreaDashboard() {
  const [areas, setAreas] = useState<any[]>([]);
  const [tempImages, setTempImages] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const [tempList, setTempList] = useState<string[]>(selectedArea?.areaImages || []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/areas", { withCredentials: true })
      .then((response) => {
        setAreas(response.data);
        setLoading(false);
      });
  }, []);

  const filteredAreas = areas
    .filter((area) =>
      area.areaName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc" ? a.basePrice - b.basePrice : b.basePrice - a.basePrice
    );

  const handleDelete = async (areaId: string) => {
    try {
      await axios.delete(`http://localhost:8080/areas/${areaId}`, {
        withCredentials: true,
      });
      setAreas(areas.filter((area) => area.id !== areaId));
      setSelectedArea(null);
    } catch (error) {
      console.error("Error deleting area:", error);
    }
  };

  const form = useForm({
    defaultValues: {
      areaName: "",
      basePrice: "",
      guestCapacity: "",
      areaDescription: "",
    },
  });

  const openDrawer = (area: any) => {
    console.log(area.areaImages); // Check the value of areaImages
    setSelectedArea(area);
    setTempImages(area.areaImages && Array.isArray(area.areaImages) ? [...area.areaImages] : []);
    form.reset({
      areaName: area.areaName || "",
      basePrice: area.basePrice || "",
      guestCapacity: area.guestCapacity || "",
      areaDescription: area.areaDescription || "",
    });
  };

  const handleUpdate = async (values: any) => {
    try {
      await axios.put(`http://localhost:8080/areas/${selectedArea.id}`, {
        ...values,
        areaImages: tempImages, // Send only the updated images list
      }, { withCredentials: true });
  
      setAreas((prev) =>
        prev.map((area) =>
          area.id === selectedArea.id ? { ...area, ...values, areaImages: tempImages } : area
        )
      );
  
      setSelectedArea(null);
    } catch (error) {
      console.error("Error updating area:", error);
    }
  };

  const handleDeleteImage = (index: number) => {
    setTempImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  // Navigate to create area page
  const handleCreateArea = () => {
    router.push("/admin/areas/create"); // Redirects to the create area page
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const { data } = await axios.post("http://localhost:8080/s3/upload", formData, {
        withCredentials: true,
      });
  
      setTempImages((prev) => [...prev, data]); // Modify tempImages directly
    } catch (error) {
      console.error("Upload error:", error);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-center text-4xl font-extrabold tracking-tight lg:text-5xl pb-5">Area Management</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/3"
        />
        <Button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          Sort by Price ({sortOrder === "asc" ? "Low to High" : "High to Low"})
        </Button>
      </div>

      {/* Grid with areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card onClick={handleCreateArea} className="relative cursor-pointer border-dashed border-2 border-gray-400">
            <CardHeader className="flex items-center justify-center h-48">
              <span className="text-2xl text-gray-500">+ Create New Area</span>
            </CardHeader>
          </Card>
        {loading ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <div className="w-full h-64 rounded-xl bg-gray-200 animate-pulse"></div>
          </div>
        ) : (
          filteredAreas.map((area) => (
            <Card key={area.id} className="relative">
              <CardHeader>
                <div className="relative w-full h-48">
                  {area.areaImages?.[0] ? (
                    <Image
                      src={area.areaImages[0]}
                      alt={area.areaName}
                      width={300}
                      height={200}
                      className="rounded-xl object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                      <CameraOff name="ImageOff" className="text-3xl" />
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <CardTitle className="mt-2">{area.areaName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Price:</strong> £{area.basePrice}/h
                </p>
                <p>
                  <strong>Capacity:</strong> {area.guestCapacity}
                </p>
                <p className="truncate">{area.areaDescription}</p>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => openDrawer(area)}>
                    <Pencil />
                  </Button>
                    {/* Popover for deletion confirmation */}
                    <Popover>
                    <PopoverTrigger>
                      <Button variant="destructive" className="p-2">
                        <Trash2 className="text-white" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col items-center space-y-2 p-4">
                      <p>Are you sure you want to delete {area.areaName}?</p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedArea(null)} // Close popover
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleDelete(area.id); // Call handleDelete with the area ID
                            setSelectedArea(null); // Close popover after deletion
                          }}
                        >
                          Confirm
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Area Drawer */}
      <Drawer open={!!selectedArea} onOpenChange={() => setSelectedArea(null)}>
        <DrawerContent className="inset-0 w-full h-auto shadow-lg">
          <div className="max-w-5xl mx-auto w-full px-6">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-xl font-bold">Edit Area</DrawerTitle>
              <DrawerDescription className="text-muted-foreground">
                Modify area details and save changes.
              </DrawerDescription>
            </DrawerHeader>

            {selectedArea && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                  <FormField name="areaName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="basePrice" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (£/h)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="guestCapacity" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price (£/h)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="areaDescription" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} 
                          maxLength={300} 
                          placeholder="Describe the area to everyone!"
                          className="resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Area Images</h3>
                      <AreaImagesGrid images={tempImages} onDeleteImage={handleDeleteImage} />

                      <div className="mt-4">
                        <ImageUpload onUpload={handleImageUpload} />
                       </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <div className="flex gap-2">
                      <Button variant="outline" type="button" onClick={() => setSelectedArea(null)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
