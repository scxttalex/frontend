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
          {value ? value : <span>Pick a date</span>} 
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={value ? new Date(value) : undefined} 
        onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")} 
        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
        initialFocus
      />


      </PopoverContent>
    </Popover>
  );
}


