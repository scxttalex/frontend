"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/components/UserContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"; // Import Popover components

export default function MyBookingsPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const [bookings, setBookings] = useState([]);
  const [areas, setAreas] = useState([]);
  const [addons, setAddons] = useState([]);
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false); // Control popover visibility (corrected name)

  useEffect(() => {
    axios.get("http://localhost:8080/bookings", { withCredentials: true }).then(res => setBookings(res.data));
    axios.get("http://localhost:8080/areas", { withCredentials: true }).then(res => setAreas(res.data));
    axios.get("http://localhost:8080/addons", { withCredentials: true }).then(res => setAddons(res.data));
  }, []);

  if (!user) return <div className="p-6 text-center">Not logged in</div>;

  const areaMap = Object.fromEntries(areas.map(a => [a.id, a.areaName]));
  const addonMap = Object.fromEntries(addons.map(a => [a.id, a.name]));

  const now = new Date();
  const myBookings = bookings.filter(b => b.userID === user.id)
    .filter(b => {
      const bookingDate = new Date(`${b.date}T${b.endTime}`);
      return view === 'upcoming' ? bookingDate >= now : bookingDate < now;
    })
    .filter(b => {
      return (Array.isArray(b.purpose) ? b.purpose.join(' ').toLowerCase() : b.purpose).includes(searchQuery.toLowerCase()) ||
             b.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
             areaMap[b.areaID].toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleDelete = async (bookingId: string) => {
    try {
      // Perform the delete operation
      await axios.delete(`http://localhost:8080/bookings/${bookingId}`, { withCredentials: true });
      
      // Update state to remove the deleted booking
      setBookings(prev => prev.filter(book => book.id !== bookingId));
      setPopoverOpen(false); // Close the popover after deletion
    } catch (err) {
      console.error("Failed to cancel booking", err);
      alert("Something went wrong while cancelling the booking.");
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered w-full sm:w-72 border-2 rounded-lg px-4"
            placeholder="Search by area, purpose, or notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant={view === 'upcoming' ? 'default' : 'outline'} size="sm" onClick={() => setView('upcoming')}>Upcoming</Button>
          <Button variant={view === 'past' ? 'default' : 'outline'} size="sm" onClick={() => setView('past')}>Past</Button>
        </div>
      </div>
      {myBookings.length === 0 ? (
        <p className="text-muted-foreground">You have no bookings yet.</p>
      ) : (
        myBookings.map(b => (
          <Card key={b.id} className="border shadow-sm hover:shadow-md">
            <CardHeader className="relative">
              <CardTitle className="text-lg">{areaMap[b.areaID] || "Unknown Area"}</CardTitle>
              <p className="text-sm text-muted-foreground">{b.date} • {b.startTime} - {b.endTime}</p>
              <Badge 
                variant={b.paid ? 'success' : 'destructive'}
                className="absolute top-0 right-0 mt-2 mr-2"
              >
                {b.paid ? "Paid" : "Unpaid"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm">Purpose: {b.purpose?.join(", ") || "N/A"}</p>
              <p className="text-sm">Addons: {b.addons?.length ? b.addons.map(id => addonMap[id] || id).join(", ") : "None"}</p>
              <p className="text-sm">Notes: {b.notes || "—"}</p>
              <p className="text-sm font-medium">Total: £{b.totalPrice?.toFixed(2)}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/bookings/edit?id=${b.id}`)}>
                  Edit Booking
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-4">
                    <p>Are you sure you want to cancel this booking?</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(b.id)} // Delete handler
                      >
                        Confirm
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPopoverOpen(false)}>
                        Cancel
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
  );
}
