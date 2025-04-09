import React from "react";
import GetUsers from "@/components/ui/get-users"; // Import the GetUsers component

const UsersPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>
      <GetUsers /> {/* This is where you display your users' table */}
    </div>
  );
};

export default UsersPage;
