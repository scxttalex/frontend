"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "./textarea"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface Addon {
  id: string
  name: string
  price: string
  description: string
}

const AddonTable = ({ data, onDeleteAddon, onUpdateAddon }: { data: Addon[]; onDeleteAddon: (addonId : string) => void; onUpdateAddon: (addonData: any) => void  }) => {
  const [filteredData, setFilteredData] = useState<Addon[]>(data)
  const [searchText, setSearchText] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null)
  const pageSize = 10
  const router = useRouter();

  useEffect(() => {
    setFilteredData(data); 
  }, [data]);

  // React Hook Form setup
  const form = useForm({
    defaultValues: {
        id: "",
        name: "",
        description: "",
        price: "",
    },
  })

  // Handle search filtering
  const handleSearch = (value: string) => {
    setSearchText(value)
    const filtered = data.filter(
      (addon) =>
        addon.name.toLowerCase().includes(value.toLowerCase()) ||
        addon.description.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredData(filtered)
    setCurrentPage(1) // Reset to the first page after filtering
  }

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Get current page data
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const openDrawer = (addon: Addon) => {
    setSelectedAddon(addon);
  
    form.reset({
        id: addon.id || "", 
        name: addon.name || "", // Default to empty string if not set
        description: addon.description || "",
        price: addon.price || "",
      });
  };
  

  const onSubmit = (values: any) => {
    const formattedData = {
      id : values.id,
      name: values.name,
      price: values.price,
      description: values.description,
    };

    // Call parent method
    onUpdateAddon(formattedData);
    setSelectedAddon(null); // Reset selected user after deletion
  };

const handleDelete = async () => {
  if (selectedAddon && selectedAddon.id) {
    try {
      // Call delete function from parent
      onDeleteAddon(selectedAddon.id); 
      setSelectedAddon(null); // Reset selected user after deletion
    } catch (error) {
      console.error("Error deleting Addon:", error);
    }
  }
};

const handleRoute = () => {
    router.push("/admin/addons/create");
}

  
  return (
    <div>
        <div className="flex items-center justify-between mt-4 mb-4">
        <Input
        placeholder="Search by Name or Description"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        className=" w-64"
      />

      <Button onClick={handleRoute}>
        <Plus/> Create a new Addon
      </Button>

        </div>

      
      
      {/* Table */}
      <Table className="shadcn-table">
        <TableHeader>
          <tr>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Description</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {currentData.map((addon) => (
            <TableRow key={addon.id}>
              <TableCell>
                <a
                  href="#"
                  className="text-blue-500 hover:underline"
                  onClick={() => openDrawer(addon)}
                >
                  {addon.name}
                </a>
              </TableCell>
              <TableCell>£{addon.price}</TableCell>
              <TableCell>{addon.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </Button>
        <span>
          Page {currentPage} of {Math.ceil(filteredData.length / pageSize)}
        </span>
        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(filteredData.length / pageSize)}>
          Next
        </Button>
      </div>
      <Drawer open={!!selectedAddon} onOpenChange={() => setSelectedAddon(null)}>
    <DrawerContent className=" flex justify-center items-center p-4">
      <div className="w-full max-w-lg rounded-lg p-6"> 
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-xl font-bold">Edit Addon</DrawerTitle>
          <DrawerDescription className="text-muted-foreground">
            Update addon details and save changes.
          </DrawerDescription>
        </DrawerHeader>
  
        {selectedAddon && (
          <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField name="id" control={form.control} render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
  
                <FormField name="name" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
  
  
                <FormField name="price" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
                <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                        <Textarea {...field} value={field.value || ""}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )} 
                />
              <div className="flex justify-between mt-4">
                <div className= "flex justify-start"> 
                <Button
                      variant="destructive" 
                      type="button"
                      onClick={handleDelete} 
                    >
                      Delete
                    </Button>
                </div>
                <div className= "flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setSelectedAddon(null)}>
                    Cancel
                  </Button>

                  <Button type="submit">Save</Button>

                </div>
                
                
              </div>
            </form>
          </Form>
        )}
      </div>
  
      <DrawerClose asChild>
        <Button variant="ghost" className="absolute top-4 right-4">
          Close
        </Button>
      </DrawerClose>
    </DrawerContent>
  </Drawer>
    </div>
  )
}

export default AddonTable
