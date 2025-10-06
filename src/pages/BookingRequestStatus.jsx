
import React, { useState, useEffect, useCallback } from "react";
import { BookingRequest, Service, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Phone, MessageCircle, CheckCircle, XCircle, Clock as ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BookingRequestStatusPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  
  const [request, setRequest] = useState(null);
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequestData = useCallback(async () => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }
    
    try {
      const requestData = await BookingRequest.filter({ id: requestId });
      if (requestData.length > 0) {
        const currentRequest = requestData[0];
        setRequest(currentRequest);
        
        const serviceData = await Service.filter({ id: currentRequest.service_id });
        if (serviceData.length > 0) {
          setService(serviceData[0]);
        }
      }
    } catch (error) {
      console.error("Error loading request data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequestData();
  }, [loadRequestData]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          title: 'Request Sent',
          description: 'Waiting for provider response'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          title: 'Request Accepted',
          description: 'Your booking has been confirmed!'
        };
      case 'declined':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          title: 'Request Declined',
          description: 'Provider is not available for these times'
        };
      case 'counter_offered':
        return {
          icon: MessageCircle,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          title: 'Alternative Time Suggested',
          description: 'Provider has suggested a different time'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          title: 'Unknown Status',
          description: ''
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!request || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto text-center pt-20">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Request Not Found</h1>
          <p className="text-slate-600 mb-8">The booking request you're looking for doesn't exist.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="ocean-gradient text-white">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(request.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Request Status</h1>
          <p className="text-slate-600">Track your booking request progress</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <StatusIcon className={`w-8 h-8 ${statusInfo.color.includes('amber') ? 'text-amber-600' : statusInfo.color.includes('green') ? 'text-green-600' : statusInfo.color.includes('red') ? 'text-red-600' : 'text-blue-600'}`} />
                  {statusInfo.title}
                </CardTitle>
                <Badge className={statusInfo.color}>
                  {request.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-slate-600">{statusInfo.description}</p>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-semibold text-lg">{service.title}</h3>
                <p className="text-slate-600">{service.description}</p>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{service.location}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Preferred Times</h4>
                  <div className="space-y-2">
                    {request.preferred_dates.map((dateOption, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(dateOption.date), 'EEEE, MMM d, yyyy')} at {dateOption.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-slate-600">{request.duration_hours} hour(s)</p>
                  </div>
                  <div>
                    <span className="font-medium">Estimated Price:</span>
                    <p className="text-slate-600">${request.total_estimated_price}</p>
                  </div>
                </div>

                {request.location_details && (
                  <div>
                    <span className="font-medium">Location:</span>
                    <p className="text-slate-600">{request.location_details}</p>
                  </div>
                )}

                {request.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="text-slate-600">{request.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{request.customer_phone}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {request.status === 'counter_offered' && request.counter_offer && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Provider's Alternative Suggestion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-lg">
                    {format(new Date(request.counter_offer.date), 'EEEE, MMM d, yyyy')} at {request.counter_offer.time}
                  </span>
                </div>
                {request.counter_offer.notes && (
                  <p className="text-blue-800">{request.counter_offer.notes}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <Button className="ocean-gradient text-white">Accept Alternative</Button>
                  <Button variant="outline">Decline & Send New Request</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {request.provider_response && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Provider Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{request.provider_response}</p>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-4">
              Request submitted on {format(new Date(request.created_date), 'MMM d, yyyy h:mm a')}
            </p>
            <Link to={createPageUrl("Bookings")}>
              <Button variant="outline">View All My Requests</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
