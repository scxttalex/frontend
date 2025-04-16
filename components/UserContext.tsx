'use client'
import React, { createContext, useEffect, useState, useContext, ReactNode } from "react";

// Create type for User
interface User {
    id: string;
  token: string;
  firstName: string;
  surname: string;
  email: string;
  permissions: string[];
  avatar: string;
}

// Create a Context
const UserContext = createContext<any>(null);

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set user context if data exists in localStorage
    }
  }, []);

  const setUserData = (data: User) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);    
  };

  const clearUserData = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUserData, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
};
