import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  value: string[] // An array of selected option ids
  onChange: (value: string[]) => void
  options: Option[] // Array of addon options with `value` as the `id` and `label` as the `name`
  label: string
}

const MultiSelect = ({ value, onChange, options, label }: MultiSelectProps) => {
  const [open, setOpen] = useState(false)

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((p) => p !== option)
      : [...value, option]
    onChange(newValue)
  }

  const displaySelected = () => {
    const selectedLabels = options.filter(option => value.includes(option.value)).map(option => option.label)
    
    if (selectedLabels.length === 0) {
      return `Select ${label}`
    }

    // Limit the number of displayed selected items 
    const maxDisplay = 3
    const truncatedLabels = selectedLabels.slice(0, maxDisplay)
    const remainingCount = selectedLabels.length - maxDisplay

    return (
      <>
        {truncatedLabels.join(", ")}
        {remainingCount > 0 && ` +${remainingCount} more`}
      </>
    )
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            <div className="flex flex-wrap gap-1 max-w-[250px] overflow-hidden text-ellipsis">
              {displaySelected()}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} onSelect={() => toggleOption(option.value)}>
                  <Check
                    className={`mr-2 h-4 w-4 ${value.includes(option.value) ? "opacity-100" : "opacity-0"}`}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default MultiSelect
