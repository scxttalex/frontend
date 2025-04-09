"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/ui/loader";
import CustomTable from "@/components/ui/custom-user-table";
import { toast, ToastContainer } from "react-toastify";

interface User {
  id: string;
  details: {
    firstName: string;
    surname: string;
    mobileNumber: string;
    email: string;
    dateOfBirth: string;
  };
  username: string;
  password: string;
  permissions: string[];
  isGuest: boolean;
}

const GetUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/users", {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (userData: any) => {
    try {
      const response = await axios.put(`http://localhost:8080/users/${userData.id}`, userData, {
        withCredentials: true,
      });
      // Update the user list in the parent component after the update
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userData.id ? response.data : user)));
      toast.success('User updated successfully!');
    } catch (error) {
      toast.error('Failed to update user, please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`http://localhost:8080/users/${userId}`, {
        withCredentials: true,
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      ;
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    fetchUsers(); // This will refetch the users and update the state
  };

  return (
    <div className="container mx-auto p-4">
      

      
      {loading ? (
        <Loader /> // Show the loader while data is being fetched
      ) : (
        <CustomTable data={users} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} /> // Pass the handleDeleteUser function down to CustomTable
      )}
      <ToastContainer/>
      
    </div>
  );
};

export default GetUsers;
