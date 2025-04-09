import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Modify to accept derived min/max values
const generateTimeOptions = (minHour: number, minMinute: number) => {
  const hours = [];
  for (let h = minHour; h < 24; h++) {
    hours.push(String(h).padStart(2, "0"));
  }

  const minutes = ["00", "15", "30", "45"];
  const validMinutes = minutes.filter(min => parseInt(min) >= minMinute);

  return { hours, minutes: validMinutes };
};

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  minHour?: number;
  minMinute?: number;
  openTime?: string;  // "HH:mm"
  closeTime?: string; // (optional) for future enhancement
}

export default function TimePicker({
  value,
  onChange,
  minHour,
  minMinute,
  openTime,
  closeTime
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(value ? value.split(":")[0] : "00");
  const [selectedMinute, setSelectedMinute] = useState(value ? value.split(":")[1] : "00");

  // Derive min values from openTime if provided
  let derivedMinHour = minHour ?? 0;
  let derivedMinMinute = minMinute ?? 0;
  

  if (openTime) {
    const [h, m] = openTime.split(":").map(Number);
    derivedMinHour = h;
    derivedMinMinute = m;
  }

  const { hours, minutes } = generateTimeOptions(derivedMinHour, derivedMinMinute);

  const handleSelectTime = () => {
    const time = `${selectedHour}:${selectedMinute}`;
    onChange(time);
    setOpen(false);
  };

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    onChange(`${selectedHour}:${minute}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value || "Select Time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4">
        <div className="flex gap-6">
          {/* Hour Selection */}
          <div className="flex flex-col w-1/2">
            <h3 className="text-sm mb-2 font-semibold">Hour</h3>
            <ScrollArea className="h-32 border rounded-lg">
              {hours.map((hour) => (
                <button
                  key={hour}
                  className={`w-full text-left p-2 ${selectedHour === hour ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} dark:text-gray-100`}
                  onClick={() => handleHourSelect(hour)}
                >
                  {hour}
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Minute Selection */}
          <div className="flex flex-col w-1/2">
            <h3 className="text-sm mb-2 font-semibold">Minute</h3>
            <ScrollArea className="h-32 border rounded-lg">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  className={`w-full text-left p-2 ${selectedMinute === minute ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} dark:text-gray-100`}
                  onClick={() => handleMinuteSelect(minute)}
                >
                  {minute}
                </button>
              ))}
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
