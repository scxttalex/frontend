"use client"
import CalendarView from "@/components/booking-calendar"
import { useState, useEffect } from "react";
import axios from "axios";

// const dummyBookings = [
//     { id: "1", areaId: "a1", areaName: "Football Pitch 1", userName: "John Doe", date: "2025-04-10", time: "10:00", status: "confirmed" },
//     { id: "2", areaId: "a2", areaName: "Football Pitch 2", userName: "Jane Smith", date: "2025-04-10", time: "12:00", status: "pending" },
//     { id: "3", areaId: "a1", areaName: "Football Pitch 1", userName: "Alice Johnson", date: "2025-04-12", time: "14:00", status: "cancelled" },
//     { id: "4", areaId: "a1", areaName: "Football Pitch 1", userName: "Bob Brown", date: "2025-04-15", time: "09:00", status: "confirmed" },
//     { id: "5", areaId: "a2", areaName: "Football Pitch 2", userName: "Charlie Davis", date: "2025-04-20", time: "16:00", status: "pending" },
//     { id: "6", areaId: "a3", areaName: "Football Pitch 3", userName: "David Green", date: "2025-04-25", time: "18:00", status: "confirmed" },
//     { id: "7", areaId: "a1", areaName: "Football Pitch 1", userName: "Eva White", date: "2025-04-30", time: "11:00", status: "cancelled" },
//   ];
  
//   const dummyAreas = [
//     { id: "a1", name: "Football Pitch 1" },
//     { id: "a2", name: "Football Pitch 2" },
//     { id: "a3", name: "Football Pitch 3" },
//   ];

    const bookingCalendar = () => {
    const [bookings, setBookings] = useState([]);
    const [areas, setAreas] = useState([]);
    const [userMap, setUserMap] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
          const [bookingsRes, areasRes, usersRes] = await Promise.all([
            axios.get("http://localhost:8080/bookings", {withCredentials: true}), 
            axios.get("http://localhost:8080/areas", {withCredentials: true}),
            axios.get("http://localhost:8080/users", { withCredentials: true }),
          ]);

          //  Map bookings
        const mappedBookings = bookingsRes.data.map((b: any) => ({
            id: b.id,
            areaId: b.areaID,
            userID: b.userID || "Unknown User",
            date: b.date,
            time: b.startTime, 
            startTime: b.startTime,
            endTime: b.endTime,
            notes: b.notes,
            paid: b.paid,
          }));

          //  Map areas
        const mappedAreas = areasRes.data.map((a: any) => ({
            id: a.id,
            name: a.areaName,
          }));

          const mappedUserMap = usersRes.data.reduce((acc: Record<string, string>, user: any) => {
            acc[user.id] = user.username || "Unnamed";
            return acc;
          }, {});

          console.log("Bookings: ", mappedBookings)
          console.log("Areas: ", mappedAreas)
          setBookings(mappedBookings);
          setAreas(mappedAreas);
          setUserMap(mappedUserMap);
        };
    
        fetchData();
      }, []);

      const handleDeleteBooking = async (id: string) => {
        try {
          await axios.delete(`http://localhost:8080/bookings/${id}`, {withCredentials: true});
          setBookings(prev => prev.filter(b => b.id !== id));
        } catch (error) {
          console.error("Failed to delete booking", error);
        }
      };

    return (
        <div className="p-6">
            <CalendarView 
            bookings={bookings} 
            areas={areas}
            onDeleteBooking={handleDeleteBooking}
            userMap={userMap}
            >

            </CalendarView>
        </div>
    )
}

export default bookingCalendar