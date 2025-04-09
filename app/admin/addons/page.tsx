import React from "react";
import GetAddons from "@/components/ui/get-addons"; // Import the GetUsers component

const UsersPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Addon Management</h1>
      <GetAddons /> {/* This is where you display your users' table */}
    </div>
  );
};

export default UsersPage;
