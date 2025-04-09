"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Save, Trash, Trash2 } from "lucide-react";
import { DatePickerForm } from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/time-picker";
import { toast } from "react-toastify";
import { useUser } from "@/components/UserContext";
import { Switch } from "@/components/ui/switch";

export default function EditBookingPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useUser();
  const isAdmin = user?.permissions.includes("admin");

  const form = useForm({
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      notes:"",
      paid: false
    },
  });

  useEffect(() => {
    if (bookingId) {
      axios
        .get(`http://localhost:8080/bookings/${bookingId}`, { withCredentials: true })
        .then((res) => {
          console.log("Fetched booking data:", res.data);
          setBookingData(res.data);
          form.reset({
            date: res.data.date,
            startTime: res.data.startTime,
            endTime: res.data.endTime,
            notes: res.data.notes || "",
            paid: res.data.paid || false
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch booking", err);
          setLoading(false);
        });
    }
  }, [bookingId, form]);

  const onSubmit = async (data: any) => {
    console.log("Submitted data:", data);
    setSaving(true);
    try {
      await axios.put(`http://localhost:8080/bookings/${bookingId}`, data, { withCredentials: true });
      toast.success("Booking updated successfully");
      router.push("/bookings");
    } catch (error) {
      console.error("Update failed", error);
      toast.error(`Failed to update booking: ${error.response?.data?.message || error.message}`);
    }finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`http://localhost:8080/bookings/${bookingId}`, { withCredentials: true });
        alert("Booking deleted");
        router.push("/bookings");
      } catch (error) {
        console.error("Failed to delete booking", error);
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Booking</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Summary Section */}
          {bookingData && (
            <div className="space-y-2 p-4 rounded border">
              <div>
                <label className="text-sm font-medium">Area ID</label>
                <Input value={bookingData.areaID} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input value={bookingData.userID} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Paid</label>
                <Input value={bookingData.paid ? "Yes" : "No"} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input value={bookingData.notes} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Purpose</label>
                <Input value={bookingData.purpose} disabled/>
              </div>
              <div>
                <label className="text-sm font-medium">Total Price</label>
                    <Input value={bookingData.totalPrice} disabled/>
              </div>
            </div>
          )}

          {/* Editable Fields */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePickerForm  {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex gap-6">

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <TimePicker {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <TimePicker {...field}/>
                </FormControl>
              </FormItem>
            )}
          />

          </div>
          

        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter notes"/>
                </FormControl>
              </FormItem>
            )}
          />

            {isAdmin && (
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mark as Paid</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

          <div className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2/>Cancel Booking
            </Button>

            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            
          </div>
        </form>
      </Form>
    </div>
  );
}