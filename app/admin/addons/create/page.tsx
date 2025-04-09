"use client";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
});

export default function AddonForm() {
  const router = useRouter(); // Initialize Next.js router
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
      name: "",
      description: "",
      price: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
    };
    console.log(payload);

    try {
      await axios.post("http://localhost:8080/addons", payload, {
        withCredentials: true,
      });
      toast.success("Addon created successfully, redirecting...");

      setTimeout(() => {
        handleReturn();
      }, 1500); // Delay redirect by 1.5 seconds
    } catch (error) {
      console.error("Error creating addon:", error);
      toast.error("Error creating addon");
    }
  };


  const handleReturn = () => {
    router.push("/admin/addons");
  };

  return (

      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-lg mx-auto">
          <Button onClick={handleReturn} >
            <ArrowLeft/>
          </Button>
          <h2 className="text-xl font-semibold mb-4">Create a New Addon</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} placeholder="Whats the name of the addon?" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />


              <div className="flex gap-4">
                <FormField name="price" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input {...field} placeholder="Price per hour" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      maxLength={300} 
                      placeholder="Describe the addon to everyone!"
                      className="resize-none" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />


              {/* Submit Button */}
              <Button type="submit" className="w-full my-5">Create</Button>
            </form>
          </Form>
        </div>
        <ToastContainer/>
      </div>
  );  
}
