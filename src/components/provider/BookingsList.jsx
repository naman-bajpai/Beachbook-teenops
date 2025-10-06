import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function BookingsList({ bookings, services }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (bookings.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No bookings yet</h3>
          <p className="text-slate-600">Your bookings will appear here once customers start booking your services</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {bookings.map((booking) => {
        const service = services.find(s => s.id === booking.service_id);
        return (
          <Card key={booking.id} className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">{service?.title || 'Service'}</CardTitle>
                  <div className="flex items-center gap-4 text-slate-600 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(booking.booking_date), 'EEEE, MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{booking.booking_time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <span className="text-2xl font-bold text-slate-900">${booking.total_price}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  <span>Customer ID: {booking.customer_id.substring(0, 8)}</span>
                </div>
                {booking.notes && (
                  <div>
                    <span className="font-medium text-slate-900">Notes: </span>
                    <span className="text-slate-700">{booking.notes}</span>
                  </div>
                )}
                <div className="text-sm text-slate-500">
                  Booking created: {format(new Date(booking.created_date), 'MMM d, yyyy h:mm a')}
                </div>
                
                {booking.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button className="ocean-gradient text-white">
                      Confirm Booking
                    </Button>
                    <Button variant="outline">
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}