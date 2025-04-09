"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/ui/loader";
import CustomTable from "@/components/ui/custom-addon-table";
import { toast, ToastContainer } from "react-toastify";

interface Addon {
  id: string;
  name: string;
  price: string;
  description: string;
}

const GetAddons = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAddons = async () => {
    try {
      const response = await axios.get("http://localhost:8080/addons", {
        withCredentials: true,
      });
      setAddons(response.data);
    } catch (error) {
      console.error("Failed to fetch Addons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleUpdateAddon = async (addonData: any) => {
    try {

        console.log(addonData)
      const response = await axios.put(`http://localhost:8080/addons/${addonData.id}`, addonData, {
        withCredentials: true,
      });
      // Update the user list in the parent component after the update
      setAddons((prevAddons) => prevAddons.map((addon) => (addon.id === addonData.id ? response.data : addon)));
      fetchAddons();
      toast.success('Addon updated successfully!');
    } catch (error) {
      toast.error('Failed to update addon, please try again.');
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    try {
      await axios.delete(`http://localhost:8080/addons/${addonId}`, {
        withCredentials: true,
      });
      setAddons((prevAddons) => prevAddons.filter((addon) => addon.id !== addonId));
      ;
    } catch (error) {
      console.error("Error deleting addons:", error);
    }
    fetchAddons(); // This will refetch the users and update the state
  };

  return (
    <div className="container mx-auto p-4">
      

      
      {loading ? (
        <Loader /> // Show the loader while data is being fetched
      ) : (
        <CustomTable data={addons} onDeleteAddon={handleDeleteAddon} onUpdateAddon={handleUpdateAddon} /> // Pass the handleDeleteUser function down to CustomTable
      )}
      <ToastContainer/>
      
    </div>
  );
};

export default GetAddons;
