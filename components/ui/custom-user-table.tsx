"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePickerForm } from "./dateBirth-picker"
import SimpleMultiSelect from "./user-multi-select"

interface User {
  id: string
  permissions: string
  details: {
    firstName: string
    surname: string
    email: string
    mobileNumber: string
    dateOfBirth: string
  }
  username: string
  isGuest: boolean
}

const UsersTable = ({ data, onDeleteUser, onUpdateUser }: { data: User[]; onDeleteUser: (userId : string) => void; onUpdateUser: (userData: any) => void  }) => {
  const [filteredData, setFilteredData] = useState<User[]>(data)
  const [searchText, setSearchText] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const pageSize = 10

  useEffect(() => {
    setFilteredData(data); 
  }, [data]);

  // React Hook Form setup
  const form = useForm({
    defaultValues: {
        id: "",
        firstName: "",
        surname: "",
        email: "",
        mobileNumber: "",
        username: "",
        permissions: [],
        dateOfBirth: ""
    },
  })

  // Handle search filtering
  const handleSearch = (value: string) => {
    setSearchText(value)
    const filtered = data.filter(
      (user) =>
        user.details.firstName.toLowerCase().includes(value.toLowerCase()) ||
        user.details.surname.toLowerCase().includes(value.toLowerCase()) ||
        user.details.email.toLowerCase().includes(value.toLowerCase())
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

  const openDrawer = (user: User) => {
    setSelectedUser(user);
  
    form.reset({
        id: user.id || "", 
        firstName: user.details.firstName || "", // Default to empty string if not set
        surname: user.details.surname || "",
        email: user.details.email || "",
        mobileNumber: user.details.mobileNumber || "",
        username: user.username || "", 
        permissions: user.permissions || [], // Default to an empty array if no permissions
        dateOfBirth: user.details.dateOfBirth || "", 
      });
  };
  
  const permissionOptions = ["admin", "user", "guest"]

  const onSubmit = (values: any) => {
    const formattedData = {
      details: {
        firstName: values.firstName || '',
        surname: values.surname || '',
        mobileNumber: values.mobileNumber || '',
        email: values.email || '',
        dateOfBirth: values.dateOfBirth || '',
      },
      id : values.id,
      username: values.username || '',
      permissions: values.permissions && values.permissions.length > 0 ? values.permissions : [],
      isGuest: selectedUser?.isGuest || false,
    };

    // Call the parent method
    onUpdateUser(formattedData);
    setSelectedUser(null); // Reset selected user after deletion
  };

const handleDelete = async () => {
  if (selectedUser && selectedUser.id) {
    try {
      
      onDeleteUser(selectedUser.id); 
      setSelectedUser(null); 
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
};
  
  return (
    <div>
      {/* Search Input */}
      <Input
        placeholder="Search by Name, Email"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4 w-64"
      />
      
      {/* ShadCN Table */}
      <Table className="shadcn-table">
        <TableHeader>
          <tr>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Is Guest?</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {currentData.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <a
                  href="#"
                  className="text-blue-500 hover:underline"
                  onClick={() => openDrawer(user)}
                >
                  {user.details.firstName} {user.details.surname}
                </a>
              </TableCell>
              <TableCell>{user.details.email}</TableCell>
              <TableCell>{user.details.mobileNumber}</TableCell>
              <TableCell>{user.details.dateOfBirth}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.isGuest ? "Yes" : "No"}</TableCell>
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
      <Drawer open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
    <DrawerContent className=" flex justify-center items-center p-4">
      <div className="w-full max-w-lg rounded-lg p-6"> 
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-xl font-bold">Edit User</DrawerTitle>
          <DrawerDescription className="text-muted-foreground">
            Update user details and save changes.
          </DrawerDescription>
        </DrawerHeader>
  
        {selectedUser && (
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
  
                <FormField name="username" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
  
                <FormField
                name="permissions"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                    <SimpleMultiSelect
                        label="Permissions"
                        options={permissionOptions}
                        value={field.value || []}
                        onChange={field.onChange}
                    />
                    <FormMessage />
                    </FormItem>
                )}
                />
  
                <FormField name="firstName" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
  
                <FormField name="surname" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surname</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
  
                <FormField name="email" control={form.control} render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
  
                <FormField name="mobileNumber" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
  
                <FormField name="dateOfBirth" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatePickerForm {...field} value={field.value || ""}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
  
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
                  <Button variant="outline" type="button" onClick={() => setSelectedUser(null)}>
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

export default UsersTable
