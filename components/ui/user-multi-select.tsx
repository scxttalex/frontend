"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

interface MultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  options: string[]
  label: string
}

const SimpleMultiSelect = ({ value, onChange, options, label }: MultiSelectProps) => {
  const [open, setOpen] = useState(false)

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((p) => p !== option)
      : [...value, option]
    onChange(newValue)
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            {value.length ? value.join(", ") : `Select ${label}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option} onSelect={() => toggleOption(option)}>
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value.includes(option) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default SimpleMultiSelect
