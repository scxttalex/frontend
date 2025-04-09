"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Input, message } from "antd";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/UserContext";
import { toast, ToastContainer } from "react-toastify";



const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(15, { message: "Username can't exceed 15 characters" }),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters" })
    .max(20, { message: "Password can't exceed 20 characters" }),
});

export default function LoginForm() {
  const router = useRouter(); // Initialize Next.js router
  const { setUserData } = useUser(); // Get the setUserData function from the context
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("password", values.password);

      // Make the API call to log in with FormData
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        body: formData, // Send data as FormData
      });

      // Check if the response is OK (status 200)
      if (!response.ok) {
        throw new Error("Login failed: " + (await response.text()));
      }

      const data = await response.json();

      // Set user data globally
      setUserData({
        id: data.user.id,
        token: data.token,
        firstName: data.user.details.firstName,
        surname: data.user.details.surname,
        email: data.user.details.email,
        permissions: data.user.permissions,
        avatar: data.user.profilePicture
      });

      const userToken = data.token;

      await fetch("/api/auth/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: userToken }), // Ensure JSON format
      });


      router.push("/");
    } catch (error) {
      console.error("Login error:", error.message);
      toast.error("Login failed. Please try again.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 shadow-lg rounded-lg">
        <h1 className="text-center text-4xl font-extrabold tracking-tight lg:text-5xl pb-5">
          Log In
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input.Password placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
        <ToastContainer/>

        <p className="text-center pt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Create an Account
          </a>
        </p>
      </div>
    </div>
  );
}
