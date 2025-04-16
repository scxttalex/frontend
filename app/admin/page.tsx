"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, CalendarDays, BarChart, PlusSquare } from "lucide-react";

const cards = [
  {
    title: "Users",
    description: "Manage users, roles & access levels.",
    icon: <Users className="w-6 h-6 text-blue-600" />,
    href: "/admin/users",
  },
  {
    title: "Areas",
    description: "Control venue listings & availability.",
    icon: <MapPin className="w-6 h-6 text-green-600" />,
    href: "/admin/areas",
  },
  {
    title: "Add-ons",
    description: "Customise extras & pricing options.",
    icon: <PlusSquare className="w-6 h-6 text-purple-600" />,
    href: "/admin/addons",
  },
  {
    title: "Bookings",
    description: "Manage all bookings & schedules.",
    icon: <CalendarDays className="w-6 h-6 text-yellow-600" />,
    href: "/admin/bookings",
  },
  {
    title: "Analytics",
    description: "View trends & generate reports.",
    icon: <BarChart className="w-6 h-6 text-rose-600" />,
    href: "/admin/analytics",
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card
            key={card.title}
            onClick={() => router.push(card.href)}
            className="cursor-pointer hover:shadow-md transition rounded-2xl"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {card.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
