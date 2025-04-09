"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerFormProps {
  value: string | undefined;
  onChange: (date: string) => void;
}

export function DatePickerForm({ value, onChange }: DatePickerFormProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] pl-3 text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value ? value : <span>Pick a date</span>} {/* Display the formatted value */}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={value ? new Date(value) : undefined} // Use 'undefined' instead of 'null'
        onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")} // Handle 'undefined' correctly
        disabled={(date) => date < new Date()}
        initialFocus
      />


      </PopoverContent>
    </Popover>
  );
}


