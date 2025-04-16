import React from "react";
import GetUsers from "@/components/ui/get-users";

const UsersPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>
      <GetUsers /> {/* users table */}
    </div>
  );
};

export default UsersPage;
