"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { format, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";



const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-muted-foreground">
            {entry.name}: {entry.name === "revenue" ? `£${entry.value.toFixed(2)}` : typeof entry.value === "number" && entry.value < 1 ? `${(entry.value * 100).toFixed(0)}%` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [timeGrouping, setTimeGrouping] = useState("daily");
  const [showPiePercent, setShowPiePercent] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = 2;
  
  useEffect(() => {
    axios.get("http://localhost:8080/bookings", { withCredentials: true }).then(res => setBookings(res.data));
    axios.get("http://localhost:8080/users", { withCredentials: true }).then(res => setUsers(res.data));
    axios.get("http://localhost:8080/areas", { withCredentials: true }).then(res => setAreas(res.data));
    axios.get("http://localhost:8080/addons", { withCredentials: true }).then(res => setAddons(res.data));
  }, []);

  const isLoading = bookings.length === 0 || users.length === 0 || areas.length === 0;
  if (isLoading) return <div className="p-6 text-center">Loading analytics...</div>;

  const areaMap = Object.fromEntries(areas.map(a => [a.id, a.areaName]));
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const addonMap = Object.fromEntries(addons.map(a => [a.id, a.name]));

  const getTimeKey = (dateString: string) => {
    const date = new Date(dateString);
    switch (timeGrouping) {
      case "weekly": return format(startOfWeek(date), "yyyy-MM-dd");
      case "monthly": return format(startOfMonth(date), "yyyy-MM");
      case "yearly": return format(startOfYear(date), "yyyy");
      default: return format(date, "yyyy-MM-dd");
    }
  };

  const bookingsOverTime = bookings.reduce((acc, booking) => {
    const key = getTimeKey(booking.date);
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {});

  const bookingsOverTimeData = Object.entries(bookingsOverTime).map(([date, count]) => ({ date, count }));

  const filteredBookingsByCurrentGroup = bookings.filter(b => getTimeKey(b.date) === getTimeKey(new Date().toISOString()));

  const bookingsByArea = filteredBookingsByCurrentGroup.reduce((acc, booking) => {
    const areaName = areaMap[booking.areaID] || "Unknown Area";
    if (!acc[areaName]) acc[areaName] = 0;
    acc[areaName]++;
    return acc;
  }, {});

  const totalBookingsInGroup = Object.values(bookingsByArea).reduce((sum, count) => sum + count, 0);

  const bookingsByAreaData = Object.entries(bookingsByArea).map(([areaName, count]) => ({
    areaName,
    count,
    percent: totalBookingsInGroup ? count / totalBookingsInGroup : 0
  }));

  const userVsGuestCount = bookings.reduce((acc, booking) => {
    const user = userMap[booking.userID];
    const type = user?.isGuest ? "Guest" : "Registered User";
    if (!acc[type]) acc[type] = 0;
    acc[type]++;
    return acc;
  }, {});

  const userVsGuestData = Object.entries(userVsGuestCount).map(([type, count]) => ({ type, count }));

  const paidVsUnpaidData = bookings.reduce(
    (acc, b) => {
      b.paid ? acc.paid++ : acc.unpaid++;
      return acc;
    },
    { paid: 0, unpaid: 0 }
  );

  const paidVsUnpaidFiltered = filteredBookingsByCurrentGroup.reduce(
    (acc, b) => {
      b.paid ? acc.paid++ : acc.unpaid++;
      return acc;
    },
    { paid: 0, unpaid: 0 }
  );

  const pieData = [
    { name: 'Paid', value: paidVsUnpaidFiltered.paid },
    { name: 'Unpaid', value: paidVsUnpaidFiltered.unpaid },
  ];

  const revenueByDate = bookings.reduce((acc, booking) => {
    const key = getTimeKey(booking.date);
    const price = booking.totalPrice || 0;
    if (!acc[key]) acc[key] = 0;
    acc[key] += price;
    return acc;
  }, {});

  const revenueData = Object.entries(revenueByDate).map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }));

  const activityLog = [...bookings]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .map(b => {
      const user = userMap[b.userID];
      const username = user?.username || (user?.isGuest ? "Guest" : "Unknown User");
      const areaName = areaMap[b.areaID] || "Unknown Area";
      return {
        username,
        areaName,
        date: b.date,
      };
    });

  const filteredBookings = bookings.filter(
    b => selectedArea &&
      areaMap[b.areaID] === selectedArea &&
      getTimeKey(b.date) === getTimeKey(new Date().toISOString()) &&
      (paidFilter === 'all' || (paidFilter === 'paid' ? b.paid : !b.paid))
  );

  const paginatedBookings = filteredBookings.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Select value={timeGrouping} onValueChange={setTimeGrouping}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>Bookings Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingsOverTimeData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Paid vs Unpaid Bookings</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowPiePercent(prev => !prev)}>
              {showPiePercent ? "Show Count" : "Show %"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pieData.every(d => d.value === 0) ? (
            <div className="text-muted-foreground text-center py-8">
              No paid or unpaid bookings {timeGrouping === "daily" ? "today" : `this ${timeGrouping === "weekly" ? "week" : timeGrouping === "monthly" ? "month" : "year"}`}.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#8884d8"
                  label={({ name, percent, value }) => showPiePercent ? `${name}: ${(percent * 100).toFixed(0)}%` : `${name}: ${value}`}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Bookings Log */}
      <Card>
        <CardHeader><CardTitle>Recent Booking Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
              {activityLog.map((log, i) => (
              <div key={i} className="text-sm border-b pb-2">
                  <strong>{log.username}</strong> booked <strong>{log.areaName}</strong> on <strong>{log.date}</strong>
              </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Most Booked Areas ({timeGrouping})</CardTitle>
          </div>
        </CardHeader>
          <CardContent>
            {bookingsByAreaData.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No bookings {timeGrouping === "daily" ? "today" : `this ${timeGrouping}`}
              </div>
                    ) : (
                      
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bookingsByAreaData}>
                          <XAxis
                            dataKey="areaName"
                            interval={0}
                            height={70}
                            tickFormatter={(name) => name.length > 10 ? name.slice(0, 10) + '…' : name}
                          />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="count"
                            fill="#8884d8"
                            onClick={(data) => setSelectedArea(prev => prev === data.areaName ? null : data.areaName)}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                   )}
          </CardContent>
      </Card>
        {selectedArea && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Bookings for {selectedArea}</h2>
              <Select value={paidFilter} onValueChange={setPaidFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filteredBookings.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {`No ${paidFilter !== 'all' ? (paidFilter === 'paid' ? 'paid' : 'unpaid') + ' ' : ''}bookings ${timeGrouping === 'daily' ? 'today' : `this ${timeGrouping === 'weekly' ? 'week' : timeGrouping === 'monthly' ? 'month' : 'year'}`} for ${selectedArea}`}
              </div>
            ) : (
              <>
                {paginatedBookings.map(b => {
                  const user = userMap[b.userID];
                  const username = user?.username || (user?.isGuest ? "Guest" : "Unknown");
                  return (
                    <Card key={b.id} className="border p-4 shadow-sm transition hover:shadow-md bg-background">
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{username}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${b.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {b.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{b.date} • {b.startTime} - {b.endTime}</p>
                        <p className="text-sm">Purpose: {b.purpose?.join(', ') || 'N/A'}</p>
                        <p className="text-sm">Addons: {b.addons?.length ? b.addons.map(id => addonMap[id] || id).join(', ') : 'None'}</p>
                        <p className="text-sm">Notes: {b.notes || '—'}</p>
                        <p className="text-sm font-medium">Total: £{b.totalPrice?.toFixed(2)}</p>
                        <Button variant="outline" className="mt-2 w-full" onClick={() => router.push(`/bookings/edit?id=${b.id}`)}>Edit Booking</Button>
                      </CardContent>
                    </Card>
                  );
                })}
                <div className="flex flex-col items-center gap-2 pt-4">
                  <div className="flex gap-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(page + 1) * itemsPerPage >= filteredBookings.length}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                    
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {Math.ceil(filteredBookings.length / itemsPerPage)}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
    </div>
  );
}




























        









