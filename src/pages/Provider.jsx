
import React, { useState, useEffect, useCallback } from "react";
import { Service, Booking, BookingRequest, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, Calendar, Star, TrendingUp } from "lucide-react";

import ServiceForm from "../components/provider/ServiceForm";
import ServicesList from "../components/provider/ServicesList";
import BookingsList from "../components/provider/BookingsList";
import ProviderStats from "../components/provider/ProviderStats";
import BookingRequestsList from "../components/provider/BookingRequestsList";

export default function ProviderPage() {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateProviderServices = useCallback(async (servicesData, currentUserId) => {
    const validServices = [];
    const invalidServiceIds = [];
    
    for (const service of servicesData) {
      try {
        // Check if service belongs to current user
        if (service.provider_id !== currentUserId) {
          console.warn(`Service ${service.id} belongs to different provider: ${service.provider_id}`);
          invalidServiceIds.push(service.id);
          continue;
        }
        
        validServices.push(service);
      } catch (error) {
        console.error(`Error validating service ${service.id}:`, error);
        invalidServiceIds.push(service.id);
      }
    }
    
    if (invalidServiceIds.length > 0) {
      console.warn(`Found ${invalidServiceIds.length} invalid provider services:`, invalidServiceIds);
    }
    
    return validServices;
  }, []);

  const loadProviderData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Update user type to provider if not already set
      if (userData.user_type === 'customer') {
        await User.updateMyUserData({ user_type: 'both' });
        userData.user_type = 'both';
      }

      const [servicesData, bookingsData, requestsData] = await Promise.all([
        Service.filter({ provider_id: userData.id }, "-created_date"),
        Booking.filter({ provider_id: userData.id }, "-created_date"),
        BookingRequest.filter({ provider_id: userData.id }, "-created_date")
      ]);

      // Validate services belong to current user
      const validServices = await validateProviderServices(servicesData, userData.id);
      setServices(validServices);
      setBookings(bookingsData);
      setBookingRequests(requestsData);
    } catch (error) {
      console.error("Error loading provider data:", error);
      // Clear data on error to prevent displaying stale/incorrect information
      setServices([]); 
      setBookings([]);
      setBookingRequests([]);
    }
    setIsLoading(false);
  }, [validateProviderServices]);

  useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  const handleServiceSave = async (serviceData) => {
    try {
      // Validate user is authenticated
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Ensure provider_id is current user's ID
      const dataWithProvider = {
        ...serviceData,
        provider_id: user.id,
        is_active: true
      };
      
      if (editingService) {
        // Additional validation for editing: Ensure the service being edited belongs to the current user
        if (editingService.provider_id !== user.id) {
          throw new Error("Cannot edit service that doesn't belong to you");
        }
        await Service.update(editingService.id, dataWithProvider);
      } else {
        await Service.create(dataWithProvider);
      }
      
      setShowServiceForm(false);
      setEditingService(null);
      loadProviderData(); // Reload data after successful save
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service: " + error.message); // Provide user feedback
    }
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Join as a Provider</h1>
          <p className="text-slate-600 mb-8">Start offering your services on TeenOp</p>
          <Button onClick={() => User.login()} className="ocean-gradient text-white">
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Neighborhood Hustle</h1>
            <p className="text-slate-600">Manage your services and booking requests</p>
          </div>
          
          <Button 
            onClick={() => setShowServiceForm(true)}
            className="ocean-gradient text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Service
          </Button>
        </div>

        <ProviderStats services={services} bookings={bookings} />

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="requests">Booking Requests ({bookingRequests.length})</TabsTrigger>
            <TabsTrigger value="services">My Services ({services.length})</TabsTrigger>
            <TabsTrigger value="bookings">Confirmed Bookings ({bookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <BookingRequestsList 
              requests={bookingRequests}
              services={services}
              onRequestUpdate={loadProviderData}
            />
          </TabsContent>

          <TabsContent value="services">
            <ServicesList 
              services={services}
              onEdit={(service) => {
                setEditingService(service);
                setShowServiceForm(true);
              }}
            />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsList bookings={bookings} services={services} />
          </TabsContent>
        </Tabs>

        {showServiceForm && (
          <ServiceForm
            service={editingService}
            onSave={handleServiceSave}
            onCancel={() => {
              setShowServiceForm(false);
              setEditingService(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
