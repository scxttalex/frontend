"use client";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { message } from "antd";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import TimePicker from "@/components/ui/time-picker";
import dayjs from "dayjs";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ui/image-upload"; 
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  areaName: z.string().min(3, "Name must be at least 3 characters"),
  openTime: z.string().min(1, "Opening Time is required"),
  closeTime: z.string().min(1, "Closing Time is required"),
  guestCapacity: z.string().min(1, "Capacity is required"),
  basePrice: z.string().min(1, "Price is required"),
  areaDescription: z.string().max(300, "Description must be under 300 characters"),
});

export default function AreaForm() {
  const router = useRouter(); 
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [token] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.token;
    }
    return "";
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      areaName: "",
      guestCapacity: "",
      basePrice: "",
      areaDescription: "",
      openTime: "",  
      closeTime: "", 
    },
  });

  // Upload image immediately after selecting
  const handleImageUpload = async (file: File) => {
    try {
      if (!token) {
        console.error("No authentication token found.");
        message.error("Authentication error: No token found.");
        return;
      }

      const authHeader = `Bearer ${token}`;
      console.log("Sending x-access-token:", authHeader);

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post("http://localhost:8080/s3/upload", formData, {
        withCredentials: true,
      });

      console.log("Upload Response Data:", data);
      setImageUrls((prev) => [...prev, data || ""]);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      toast.error("Error uploading image");
    }
  };

  // Handle form submission
  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      openTime: values.openTime,
      closeTime: values.closeTime,
      areaImages: imageUrls, // Include uploaded image URLs
    };
    console.log(payload);

    try {
      await axios.post("http://localhost:8080/areas/", payload, {
        withCredentials: true,
      });
      toast.success("Area created successfully, redirecting...");

      setTimeout(() => {
        router.push("/admin/areas");
      }, 1500); // Delay redirect by 1.5 seconds
    } catch (error) {
      console.error("Error creating area:", error);
      toast.error("Error creating area");
    }
  };

  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  // Convert selected time into hour and minute
  const getTimeParts = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return { hour, minute };
  };

  const handleOpenTimeChange = (time: string) => {
    setOpenTime(time);
  };

  const handleCloseTimeChange = (time: string) => {
    setCloseTime(time);
  };

  const handleReturn = () => {
    router.push("/admin/areas");
  };

  const { hour: openHour, minute: openMinute } = getTimeParts(openTime);

  return (

      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-lg mx-auto">
          <Button onClick={handleReturn} >
            <ArrowLeft/>
          </Button>
          <h2 className="text-xl font-semibold mb-4">Create a New Area</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="areaName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} placeholder="Whats the name of the area?" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-4">
              <FormField 
                name="openTime" 
                control={form.control} 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Time</FormLabel>
                    <FormControl>
                      <TimePicker 
                        value={openTime} 
                        onChange={(time: string) => {
                          setOpenTime(time);
                          field.onChange(time); // Update react-hook-form state
                        }} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField 
                name="closeTime" 
                control={form.control} 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closing Time</FormLabel>
                    <FormControl>
                      <TimePicker 
                        value={closeTime} 
                        onChange={(time: string) => {
                          setCloseTime(time);
                          field.onChange(time); 
                        }} 
                        minHour={openHour} // Only show hours >= the selected opening time hour
                        minMinute={openMinute} // Only show minutes >= the selected opening time minute  
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              </div>

              <div className="flex gap-4">
                <FormField name="guestCapacity" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Capacity</FormLabel>
                    <FormControl><Input {...field} placeholder="Capacity of people"/></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="basePrice" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input {...field} placeholder="Price per hour" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField name="areaDescription" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      maxLength={300} 
                      placeholder="Describe the area to everyone!"
                      className="resize-none" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Image Upload Component */}
              <ImageUpload onUpload={handleImageUpload}/>

              {/* Submit Button */}
              <Button type="submit" className="w-full my-5">Create</Button>
            </form>
          </Form>
        </div>
        <ToastContainer/>
      </div>
  );
    
    
    
}
