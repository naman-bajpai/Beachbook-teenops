import React, { useState, useEffect } from "react";
import { Booking, Service, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User as UserIcon, Phone } from "lucide-react";
import { format } from "date-fns";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const bookingsData = await Booking.filter({
        customer_id: userData.id
      }, "-created_date");
      
      setBookings(bookingsData);
      
      // Load service details
      const serviceIds = [...new Set(bookingsData.map(b => b.service_id))];
      const servicesData = await Service.list();
      const servicesMap = {};
      servicesData.forEach(service => {
        servicesMap[service.id] = service;
      });
      setServices(servicesMap);
      
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
    setIsLoading(false);
  };

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

  const filterBookings = (status) => {
    if (status === 'all') return bookings;
    return bookings.filter(booking => booking.status === status);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Please Login</h1>
          <p className="text-slate-600 mb-8">You need to be logged in to view your bookings.</p>
          <Button onClick={() => User.login()} className="ocean-gradient text-white">
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-600">Track your bookings with teen entrepreneurs</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterBookings('pending').length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({filterBookings('confirmed').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filterBookings('completed').length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({filterBookings('cancelled').length})</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="grid gap-6">
                {filterBookings(status).length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm">
                    <CardContent className="text-center py-12">
                      <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        No {status === 'all' ? '' : status} bookings
                      </h3>
                      <p className="text-slate-600">
                        {status === 'all' 
                          ? "You haven't made any bookings yet." 
                          : `No ${status} bookings found.`
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filterBookings(status).map((booking) => {
                    const service = services[booking.service_id];
                    return (
                      <Card key={booking.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <CardTitle className="text-xl">
                                {service?.title || 'Service'}
                              </CardTitle>
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
                              <span className="text-2xl font-bold text-slate-900">
                                ${booking.total_price}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2">Service Details</h4>
                              <div className="space-y-2 text-sm text-slate-600">
                                {service?.description && (
                                  <p>{service.description.substring(0, 100)}...</p>
                                )}
                                {service?.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{service.location}</span>
                                  </div>
                                )}
                                {service?.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{service.duration} minutes</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-slate-900 mb-2">Booking Info</h4>
                              <div className="space-y-2 text-sm text-slate-600">
                                <p>Booking ID: #{booking.id.substring(0, 8)}</p>
                                <p>Booked: {format(new Date(booking.created_date), 'MMM d, yyyy')}</p>
                                {booking.notes && (
                                  <p>Notes: {booking.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {booking.status === 'pending' && (
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                              <Button variant="outline" className="flex-1">
                                Modify Booking
                              </Button>
                              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                Cancel
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}