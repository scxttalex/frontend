import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addDays, addMonths } from "date-fns";
import { ArrowLeft, ArrowRight, Pencil, PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation"

interface Booking {
  id: string;
  areaId: string;
  areaName: string;
  userID: string;
  date: string;
  time: string;
  status: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  paid?: boolean;
}



interface CalendarProps {
  bookings: Booking[];
  areas: { id: string; name: string }[];
  onDeleteBooking?: (id: string) => void;
  userMap?: Record<string, string>;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getCurrentWeekDates = (offset = 0) => {
  const now = new Date();
  const monday = startOfWeek(addDays(now, offset * 7), { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, i) => addDays(monday, i));
};



const getCurrentMonthDates = (offset: number) => {
  const now = new Date();
  const currentMonthStart = startOfMonth(addMonths(now, offset));
  const currentMonthEnd = endOfMonth(currentMonthStart);
  const startOfGrid = startOfWeek(currentMonthStart, { weekStartsOn: 1 });
  const endOfGrid = endOfWeek(currentMonthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: startOfGrid, end: endOfGrid });
};

export default function CalendarView({ bookings, areas, onDeleteBooking, userMap }: CalendarProps) {
  const [selectedArea, setSelectedArea] = useState<string>(areas[0]?.id || "");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<"weekly" | "daily" | "monthly">("weekly");
  const [currentDay, setCurrentDay] = useState(new Date());

  const shiftWeek = (offset: number) => setWeekOffset(prev => prev + offset);
  const shiftMonth = (offset: number) => setMonthOffset(prev => prev + offset);
  const shiftDay = (offset: number) => setCurrentDay(prev => addDays(prev, offset));

  const weekDates = getCurrentWeekDates(weekOffset);
  const monthDates = getCurrentMonthDates(monthOffset);
  const displayedMonth = addMonths(new Date(), monthOffset).getMonth();

  const filteredBookings = bookings.filter(b => b.areaId === selectedArea);

  const router = useRouter();

  const getStatusColor = (paid: boolean | undefined) => {
    if (paid) return "bg-green-200 text-green-800";
    return "bg-red-200 text-red-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          {viewMode === "monthly" ? (
            <>
              <Button onClick={() => shiftMonth(-1)} variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-lg">
              {format(addMonths(new Date(), monthOffset), "MMMM yyyy")}
              </span>
              <Button onClick={() => shiftMonth(1)} variant="outline" size="icon">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : viewMode === "daily" ? (
            <>
              <Button onClick={() => shiftDay(-1)} variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-lg">
                {format(currentDay, "EEEE, MMMM d, yyyy")}
              </span>
              <Button onClick={() => shiftDay(1)} variant="outline" size="icon">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => shiftWeek(-1)} variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-lg">
                {format(weekDates[0], "MMM d")} - {format(weekDates[6], "MMM d")}
              </span>
              <Button onClick={() => shiftWeek(1)} variant="outline" size="icon">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map(area => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>


        <Button variant="outline" onClick={() => {
    setWeekOffset(0);
    setMonthOffset(0);
    setCurrentDay(new Date());
    }}>
    Today
    </Button>

        <Button variant="default" className="ml-auto" onClick={() => window.location.href = "/bookings/create"}>
          + Create Booking
        </Button>
      </div>

      {viewMode === "weekly" && (
        <div className="flex flex-col gap-2">
          {weekDates.map((date, index) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dailyBookings = filteredBookings.filter(b => b.date === dateStr);

            return (
              <Card key={index} className={`p-2 min-h-[150px] ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'ring-2 ring-blue-500' : ''}`}>
                <div className={`font-bold mb-2 ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-blue-600' : ''}`}>
                  {dayLabels[index]} <span className="text-sm text-gray-500">{format(date, "dd MMM")}</span>
                </div>
                {dailyBookings.length > 0 ? (
                  <ul className="space-y-1">
                    {dailyBookings.map(booking => (
                      <li
                          key={booking.id}
                          className={`text-sm px-2 py-1 rounded cursor-pointer ${getStatusColor(booking.paid)}`}
                          onClick={() => setSelectedBooking(booking)}
                        >
                      
                        <strong>{booking.time} - {booking.endTime}</strong> : {userMap?.[booking.userID] || "Unknown User"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No bookings</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === "daily" && (
        <Card className="p-4">
          <h2 className="font-bold text-lg mb-2">{format(currentDay, "EEEE, MMMM d")}</h2>
          <ul className="space-y-2">
            {filteredBookings.filter(b => b.date === format(currentDay, "yyyy-MM-dd")).map(b => (
              <li
                key={b.id}
                className={`text-sm px-2 py-1 rounded cursor-pointer ${getStatusColor(b.paid)}`}
                onClick={() => setSelectedBooking(b)}
              >
                <strong>{b.time} - {b.endTime}</strong> : {userMap?.[b.userID] || "Unknown User"}

              </li>
            )) || <p className="text-sm text-gray-400">No bookings</p>}
          </ul>
        </Card>
      )}

      {viewMode === "monthly" && (
        <div>
          <div className="hidden md:grid grid-cols-7 text-center font-bold">
  {dayLabels.map((day, index) => (
    <div key={index} className="p-2">{day}</div>
  ))}
</div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {monthDates.map((date, index) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const dailyBookings = filteredBookings.filter(b => b.date === dateStr);

              return (
                <Card
                  key={index}
                  className={`p-2 min-h-[150px] cursor-pointer ${date.getMonth() !== displayedMonth ? 'opacity-60' : ''} ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => {
                    setCurrentDay(date);
                    setViewMode("daily");
                  }}
                >
                  <div className={`font-bold mb-2 ${date.getMonth() !== displayedMonth ? 'text-gray-400' : ''} ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-blue-600' : ''}`}>{format(date, "d MMM")}</div>
                  {dailyBookings.length > 0 ? (
                    <ul className="space-y-1">
                      {dailyBookings.map(booking => (
                        <li
                          key={booking.id}
                          className={`text-sm px-2 py-1 rounded cursor-pointer ${getStatusColor(booking.paid)}`}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <strong>{booking.time} - {booking.endTime}</strong>
                          {/* - {booking.userName} */}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">No bookings</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-2 text-sm">
              <p><strong>User:</strong> {userMap?.[selectedBooking.userID] || "Unknown User"}</p>
              <p><strong>Date:</strong> {selectedBooking.date}</p>
              <p><strong>Time:</strong> {selectedBooking.time}</p>
              <p><strong>Paid:</strong> {selectedBooking.paid ? "Yes" : "No"}</p>
              <p><strong>Duration:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
              <p><strong>Notes:</strong> {selectedBooking.notes}</p>
              <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedBooking) {
                    router.push(`/bookings/edit?id=${selectedBooking.id}`);
                  }
                }}
              >
                  <PencilIcon />
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedBooking && onDeleteBooking) {
                      onDeleteBooking(selectedBooking.id);
                      setSelectedBooking(null);
                    }
                  }}
                >
                  Delete Booking
                </Button>
              </div>
              
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}
