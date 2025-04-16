"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "antd";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DatePickerForm } from "@/components/ui/dateBirth-picker";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(15, "Username can't exceed 15 characters"),
  password: z.string().min(4, "Password must be at least 4 characters").max(20, "Password can't exceed 20 characters"),
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Invalid email address"),
  mobileNumber: z.string().min(10, "Mobile number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export default function RegisterForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      surname: "",
      email: "",
      mobileNumber: "",
      dateOfBirth: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const today = new Date().toISOString();

      const payload = {
        isGuest: false,
        username: values.username,
        password: values.password,
        permissions: ["user"],
        createdAt: today,
        details: {
          firstName: values.firstName,
          surname: values.surname,
          dateOfBirth: values.dateOfBirth,
          email: values.email,
          mobileNumber: values.mobileNumber,
        },
      };

      console.log(payload);

      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unknown error occurred");
      }

      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => router.replace("/login"), 3000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 shadow-lg rounded-lg">
        <h1 className="text-center text-4xl font-extrabold tracking-tight lg:text-5xl pb-5">
          Register
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {["firstName", "surname", "email", "mobileNumber", "username", "password"].map((fieldName) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName as keyof typeof formSchema.shape}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}</FormLabel>
                    <FormControl>
                      {fieldName === "password" ? (
                        <Input.Password placeholder={`Enter your ${fieldName}`} {...field} />
                      ) : (
                        <Input placeholder={`Enter your ${fieldName}`} {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <DatePickerForm
                      value={field.value} 
                      onChange={(date) => field.onChange(date)} 
                    />
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

        <p className="text-center pt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
}
