"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePickerForm } from "@/components/ui/date-picker";
import MultiSelect from "@/components/ui/multi-select";
import TimePicker from "@/components/ui/time-picker";
import SimpleMultiSelect from "@/components/ui/user-multi-select";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import { useUser } from "@/components/UserContext";

const purposeOptions = ["Hockey", "Social", "Training", "Private Event", "Football", "Formal", "Rugby", "Recovery", "Other"];


const GetBookings = () => {
    const {user} = useUser();
    const isAdmin = user?.permissions.includes("admin");
    const [areaOptions, setAreaOptions] = useState([]);
    const [addonOptions, setAddonOptions] = useState([]);
    const [loadingAreas, setLoadingAreas] = useState(true);
    const [loadingAddons, setLoadingAddons] = useState(true);
    const [selectedArea, setSelectedArea] = useState(null);

    const router = useRouter();
    
  
    const [addons, setAddons] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    
    const fetchAreas = async () => {
      setLoadingAreas(true);
      try {
        const response = await axios.get("http://localhost:8080/areas", {
          withCredentials: true,
        });
        const fetchedAreas = response.data.map((area: any) => ({
          value: area.id,
          label: area.areaName,
          price: area.basePrice, // Ensure price is fetched
          images: area.areaImages,
          description: area.areaDescription,
          openTime: area.openTime,
          closeTime: area.closeTime
        }));
        setAreaOptions(fetchedAreas);
        console.log(fetchedAreas);
      } catch (error) {
        toast.error("Failed to fetch areas");
        setAreaOptions([]); // Ensure no stale data
      } finally {
        setLoadingAreas(false);
      }
    };
    
  
    const fetchAddons = async () => {
      setLoadingAddons(true);
      try {
        const response = await axios.get("http://localhost:8080/addons", {
          withCredentials: true,
        });
    
        const fetchedAddons = response.data.map((addon: any) => ({
          value: String(addon.id), 
          label: addon.name, 
          price: addon.price, // Ensure price is fetched
        }));
    
        setAddonOptions(fetchedAddons);
      } catch (error) {
        toast.error("Failed to fetch addons");
        console.error("API Fetch Error:", error);
      } finally {
        setLoadingAddons(false);
      }
    };
  
  
    useEffect(() => {
      fetchAreas();
      fetchAddons();
    }, [setAddonOptions]); // Ensures re-fetching if state updates
  
    useEffect(() => {
      console.log("Updated Addon Options:", addonOptions);
    }, [addonOptions]); // Log addonOptions whenever it updates
  
    const form = useForm({
      defaultValues: {
        areaID: "", 
        userID: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: [],
        addons: [],
        notes: "",
        inhouseBooking: "",
        totalPrice: 0,
        paid: false,
      },
    });
  
  
    const onSubmit = async (data: any) => {
        
        const duration = getDurationInHours(data.startTime, data.endTime);
        const areaPrice = selectedArea ? selectedArea.price : 0;
        const addonCost = addons.reduce((sum, addon) => sum + addon.price * duration, 0);
        const userID = user?.id
        let total = areaPrice * duration + addonCost;
      
        if (data.inhouseBooking) {
          total = total / 2; // Apply discount
        }
      
        // Ensure totalPrice is set
        data.totalPrice = parseFloat(total.toFixed(2));
        data.userID = userID;
      
        console.log("Final Booking Data:", data);
      
        try {
          await axios.post("http://localhost:8080/bookings", data, {
            withCredentials: true,
          });
          toast.success("Booking created successfully!");
          router.push("/bookings")
        } catch (error) {
          toast.error("Failed to create booking.");
          console.error("Booking Error:", error);
        }
      };
  
      const handleAreaChange = (areaID: string) => {
        const area = areaOptions.find((a) => a.value === areaID);
      
        if (area) {
          setSelectedArea(area);

            // Get the open and close time from the area
            const openTime = area.openTime;  // e.g., "08:00"
            const closeTime = area.closeTime; // e.g., "22:00"
      
          // Calculate duration
          const duration = getDurationInHours(form.watch("startTime"), form.watch("endTime"));
          const areaCost = area.price * duration;
      
          // Update total cost
          setTotalCost(areaCost);
          form.setValue("totalPrice", areaCost);  // Set totalPrice in form
        }
    };
      
  
    const handleAddonChange = (selectedAddons: string[]) => {
        const selectedAddonPrices = addonOptions.filter(addon => selectedAddons.includes(addon.value));
        const addonTotal = selectedAddonPrices.reduce((sum, addon) => sum + addon.price, 0);
        
        setAddons(selectedAddonPrices);
        
        const areaPrice = selectedArea ? selectedArea.price : 0;
        const duration = getDurationInHours(form.watch("startTime"), form.watch("endTime"));
        const newTotalCost = (areaPrice * duration) + addonTotal;
        setTotalCost(newTotalCost);
        form.setValue("totalPrice", newTotalCost);  // Set totalPrice in form
    };
  
    const getDurationInHours = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return 0;
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);
        const start = startHour + startMinute / 60;
        const end = endHour + endMinute / 60;
        return Math.max(0, end - start);
      };

    return (
        <div className=" mx-auto p-6 rounded-lg h-[90%]">
            <ResizablePanelGroup direction="vertical" >
                <ResizablePanel>
                    <div className="w-full mx-auto bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">Create a Booking</h2>
                        {/* Area Selection */}
                        <FormField
                            name="areaID"
                            control={form.control}
                            rules={{ required: "Please select an area" }}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Select Area</FormLabel>
                                <FormControl>
                                    <Select
                                    value={field.value || ""}
                                    onValueChange={(value) => {
                                        field.onChange(value); // ✅ This updates react-hook-form state
                                        handleAreaChange(value); // ✅ This updates local state
                                    }}
                                    >
                                    <SelectTrigger className="w-[350px]">
                                        <SelectValue placeholder={loadingAreas ? "Loading..." : "Select an Area"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {areaOptions.length > 0 ? (
                                        areaOptions.map((area) => (
                                            <SelectItem key={area.value} value={area.value}>
                                                {area.label}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem disabled value="unavailable">
                                            No areas available
                                        </SelectItem>
                                    )}

                                    </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />



                        {/* Date Picker */}
                        <FormField name="date" control={form.control} rules={{ required: "Date is required" }}  render={({ field }) => (
                            <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <DatePickerForm value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />

                        {/* Start & End Time */}
                        <div className="flex gap-4">
                            <FormField name="startTime" control={form.control} rules={{ required: "Select a starting time" }}render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                <TimePicker 
                                value={field.value} 
                                onChange={field.onChange} 
                                openTime={selectedArea?.openTime} 
                                closeTime={selectedArea?.closeTime} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )} />

                            <FormField name="endTime" control={form.control} rules={{ required: "Select a finishing time" }} render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                <TimePicker 
                                value={field.value}
                                onChange={field.onChange} 
                                openTime={selectedArea?.openTime} 
                                closeTime={selectedArea?.closeTime} 
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )} />
                            
                        </div>

                        {/* Purpose MultiSelect */}
                        <FormField name="purpose" control={form.control} rules={{ required: "A purpose is required" }}render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <SimpleMultiSelect
                                value={Array.isArray(field.value) ? field.value : []} 
                                onChange={field.onChange} 
                                label="Purpose" 
                                options={purposeOptions} 
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />

                        <FormField name="addons" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormControl>
                            <MultiSelect
                                value={field.value || []}
                                onChange={(value) => {
                                field.onChange(value); // ✅ keeps form state in sync
                                handleAddonChange(value); // ✅ updates addon pricing
                                }}
                                label="Addons"
                                options={addonOptions.map((addon) => ({
                                label: `${addon.label} (£${addon.price})`,
                                value: addon.value.toString(),
                                }))}
                                
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )} />

                            <FormField name="notes" control={form.control} render={({ field }) => (
                            <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                    maxLength={300} 
                                    placeholder="!"
                                    className="resize-none h-40" 
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                            )} 
                            />

                            {isAdmin && (
                                <FormField name="inhouseBooking" control={form.control} render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Inhouse Booking?</FormLabel>
                                    <FormControl>
                                        <Switch value={field.value}  onCheckedChange={field.onChange}  />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            )}

                            

                        
                            <Button className="w-full" type="submit">Create Booking</Button>
                            </form>
                        </Form>
                    </div>
                </ResizablePanel>

                <ResizableHandle className="border-7" withHandle/>

                <ResizablePanel className="overflow-hidden" defaultSize={20}>
                    <div className="flex flex-col lg:flex-row gap-6 p-6">
                        {/* Carousel */}
                        <div className="w-full lg:w-1/2">
                            {selectedArea?.images?.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {selectedArea.images.map((imgUrl: string, idx: number) => (
                                            <CarouselItem key={idx}>
                                                <img
                                                    src={imgUrl}
                                                    alt={`Area image ${idx + 1}`}
                                                    className="rounded-lg object-cover w-full h-64"
                                                />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                            ) : (
                                <p className="text-white">No images available for this area.</p>
                            )}
                        </div>

                        {/* Booking Breakdown */}
                        <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
                            {selectedArea && (
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Booking Breakdown</h3>
                                    <p><span className="font-medium">Duration:</span> {getDurationInHours(form.watch("startTime"), form.watch("endTime"))} hour(s)</p>
                                    <p>
                                        <span className="font-medium">Area Price:</span> £{selectedArea.price} × {getDurationInHours(form.watch("startTime"), form.watch("endTime"))}h = £
                                        {selectedArea.price * getDurationInHours(form.watch("startTime"), form.watch("endTime"))}
                                    </p>

                                    {addons.length > 0 && (
                                        <div className="mt-2">
                                            <p className="font-medium text-md underline">Addons:</p>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                {addons.map((addon: any) => {
                                                    const hours = getDurationInHours(form.watch("startTime"), form.watch("endTime"));
                                                    const addonTotal = addon.price * hours;
                                                    return (
                                                        <li key={addon.value}>
                                                            {addon.label}: £{addon.price} × {hours}h = <span className="font-semibold">£{addonTotal.toFixed(2)}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            <p className="mt-2 font-semibold text-sm">
                                                Addon Subtotal: £
                                                {addons
                                                    .reduce((sum, addon) => sum + addon.price * getDurationInHours(form.watch("startTime"), form.watch("endTime")), 0)
                                                    .toFixed(2)}
                                            </p>
                                        </div>
                                    )}

                                    <p><span className="font-medium">Subtotal:</span> £
                                        {(() => {
                                            const hours = getDurationInHours(form.watch("startTime"), form.watch("endTime"));
                                            const areaCost = selectedArea.price * hours;
                                            const addonCost = addons.reduce((sum, addon) => sum + addon.price * hours, 0);
                                            return (areaCost + addonCost).toFixed(2);
                                        })()}
                                    </p>

                                    {form.watch("inhouseBooking") && (
                                        <p className="text-green-400 font-medium">Inhouse Discount Applied: 50%</p>
                                    )}

                                    <p className="text-xl font-bold mt-2">
                                        Total: £
                                        {(() => {
                                            const hours = getDurationInHours(form.watch("startTime"), form.watch("endTime"));
                                            const areaCost = selectedArea.price * hours;
                                            const addonCost = addons.reduce((sum, addon) => sum + addon.price * hours, 0);
                                            const subtotal = areaCost + addonCost;
                                            return form.watch("inhouseBooking") ? (subtotal / 2).toFixed(2) : subtotal.toFixed(2);
                                        })()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
            <ToastContainer/>
        </div>
    );
};

export default GetBookings;
