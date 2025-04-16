// Modified from Original Next.js homepage

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/components/UserContext";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const isAdmin = user?.permissions?.includes("admin");

  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [areaMap, setAreaMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          // Fetch bookings
          const bookingRes = await axios.get(
            `http://localhost:8080/bookings?userId=${user.id}`,
            { withCredentials: true }
          );
          const today = new Date();
          const future = bookingRes.data.filter(
            (b: any) => new Date(b.date) >= today
          );
          const sorted = future.sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setUpcomingBookings(sorted.slice(0, 3));

          // Fetch areas
          const areaRes = await axios.get("http://localhost:8080/areas", {
            withCredentials: true,
          });

          const map: { [key: string]: string } = {};
          areaRes.data.forEach((area: any) => {
            map[area.id] = area.areaName; 
          });
          setAreaMap(map);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Logo */}
      <div className="flex justify-center">
        <Image src="/logo.png" alt="QuickBook Logo" width={160} height={80} />
      </div>

      {/* Hero + CTA */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to QuickBook</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {user
            ? `Hi ${user.firstName}, ready to manage your bookings?`
            : "Book facilities easily as a registered user."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {user ? (
            <>
              <Button onClick={() => router.push("/bookings/create")}>Create Booking</Button>
              <Button onClick={() => router.push("/bookings")}>My Bookings</Button>
              <Button onClick={() => router.push("/account")} variant="outline">
                My Account
              </Button>
              {isAdmin && (
                <>
                  <Button onClick={() => router.push("/admin/areas")} variant="outline">
                    Manage Areas
                  </Button>
                  <Button onClick={() => router.push("/analytics")} variant="outline">
                    View Analytics
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button onClick={() => router.push("/login")} >
                Login
              </Button>
              <Button onClick={() => router.push("/signup")} variant="outline">
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Upcoming Bookings */}
      {user && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking._id} className="text-sm border-b pb-2">
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                    </p>
                    <p>
                      <strong>Area:</strong>{" "}
                      {areaMap[booking.areaID] || booking.areaID}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No upcoming bookings.</p>
              )}
              <Button
                variant="link"
                className="px-0"
                onClick={() => router.push("/bookings")}
              >
                View All Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
