import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Star, TrendingUp } from "lucide-react";

export default function ProviderStats({ services, bookings }) {
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  const activeServices = services.filter(s => s.is_active).length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const thisMonthBookings = bookings.filter(b => {
    const bookingDate = new Date(b.created_date);
    const now = new Date();
    return bookingDate.getMonth() === now.getMonth() && 
           bookingDate.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Active Services",
      value: activeServices.toString(),
      icon: Star,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Pending Bookings",
      value: pendingBookings.toString(),
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    },
    {
      title: "This Month",
      value: `${thisMonthBookings} bookings`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}