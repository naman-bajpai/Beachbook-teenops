
import React, { useState } from "react";
import { BookingRequest, Service, Conversation, Message } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, Phone, MapPin, MessageCircle, Check, X, Edit } from "lucide-react";
import { format } from "date-fns";

export default function BookingRequestsList({ requests, services, onRequestUpdate }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseType, setResponseType] = useState("");
  const [responseData, setResponseData] = useState({
    message: "",
    counterDate: "",
    counterTime: "",
    counterNotes: ""
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'counter_offered':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleResponse = async (request, type) => {
    setSelectedRequest(request);
    setResponseType(type);
    setResponseData({
      message: "",
      counterDate: "",
      counterTime: "",
      counterNotes: ""
    });
    setShowResponseDialog(true);
  };

  const submitResponse = async () => {
    if (!selectedRequest) return;

    try {
      let updateData = {
        provider_response: responseData.message
      };
      
      let messageContent = "";
      let statusText = "";

      if (responseType === 'accept') {
        updateData.status = 'accepted';
        statusText = 'accepted';
        messageContent = `I've accepted your booking request! ${responseData.message || "I look forward to it."}`;
      } else if (responseType === 'decline') {
        updateData.status = 'declined';
        statusText = 'declined';
        messageContent = `Unfortunately, I have to decline this request. ${responseData.message || "Sorry for the inconvenience."}`;
      } else if (responseType === 'counter') {
        updateData.status = 'counter_offered';
        statusText = 'updated with an alternative';
        updateData.counter_offer = {
          date: responseData.counterDate,
          time: responseData.counterTime,
          notes: responseData.counterNotes
        };
        messageContent = `I'd like to suggest an alternative time: ${format(new Date(responseData.counterDate), 'MMM d, yyyy')} at ${responseData.counterTime}. ${responseData.message || ""}`;
      }

      await BookingRequest.update(selectedRequest.id, updateData);

      // Post message to conversation
      const convos = await Conversation.filter({ booking_request_id: selectedRequest.id });
      if (convos.length > 0) {
        await Message.create({
          conversation_id: convos[0].id,
          sender_id: selectedRequest.provider_id,
          sender_type: 'provider',
          content: messageContent,
          message_type: 'text',
        });
      }

      // Send email notification to customer
      const service = services.find(s => s.id === selectedRequest.service_id);
      
      await SendEmail({
        to: selectedRequest.customer_id,
        subject: `Booking Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} - ${service?.title}`,
        body: `
Hello!

Your booking request for "${service?.title}" has been ${statusText}.

${responseType === 'counter' ? 
  `Alternative time suggested: ${format(new Date(responseData.counterDate), 'EEEE, MMM d, yyyy')} at ${responseData.counterTime}` : 
  ''}

Provider message: ${messageContent}

Log in to your TeenOp account to view the full details in your Messages.

Best regards,
TeenOp Team
        `
      });

      setShowResponseDialog(false);
      onRequestUpdate();
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  if (requests.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No booking requests yet</h3>
          <p className="text-slate-600">Booking requests from customers will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {requests.map((request) => {
          const service = services.find(s => s.id === request.service_id);
          return (
            <Card key={request.id} className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl">{service?.title || 'Service Request'}</CardTitle>
                    <div className="flex items-center gap-4 text-slate-600 mt-2">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Customer ID: {request.customer_id.substring(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{request.customer_phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-2xl font-bold text-slate-900">${request.total_estimated_price}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Customer's Preferred Times</h4>
                    <div className="space-y-2">
                      {request.preferred_dates.map((dateOption, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>Option {index + 1}: {format(new Date(dateOption.date), 'EEE, MMM d')} at {dateOption.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-900">Duration:</span>
                        <p className="text-slate-600">{request.duration_hours} hour(s)</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">Estimated:</span>
                        <p className="text-slate-600">${request.total_estimated_price}</p>
                      </div>
                    </div>
                    
                    {request.location_details && (
                      <div>
                        <span className="font-medium text-slate-900 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Location:
                        </span>
                        <p className="text-slate-600 text-sm">{request.location_details}</p>
                      </div>
                    )}
                    
                    {request.notes && (
                      <div>
                        <span className="font-medium text-slate-900">Notes:</span>
                        <p className="text-slate-600 text-sm">{request.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-slate-500 mt-4 pt-4 border-t">
                  Request received: {format(new Date(request.created_date), 'MMM d, yyyy h:mm a')}
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <Button 
                      onClick={() => handleResponse(request, 'accept')}
                      className="ocean-gradient text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button 
                      onClick={() => handleResponse(request, 'counter')}
                      variant="outline"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Suggest Different Time
                    </Button>
                    <Button 
                      onClick={() => handleResponse(request, 'decline')}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}

                {request.provider_response && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Your Response:</h5>
                    <p className="text-blue-800 text-sm">{request.provider_response}</p>
                    {request.counter_offer && (
                      <p className="text-blue-800 text-sm mt-2">
                        Suggested: {format(new Date(request.counter_offer.date), 'MMM d, yyyy')} at {request.counter_offer.time}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {responseType === 'accept' && 'Accept Booking Request'}
              {responseType === 'decline' && 'Decline Booking Request'}
              {responseType === 'counter' && 'Suggest Alternative Time'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {responseType === 'counter' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Suggested Date</Label>
                  <Input
                    type="date"
                    value={responseData.counterDate}
                    onChange={(e) => setResponseData({...responseData, counterDate: e.target.value})}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Suggested Time</Label>
                  <Input
                    type="time"
                    value={responseData.counterTime}
                    onChange={(e) => setResponseData({...responseData, counterTime: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Message to Customer</Label>
              <Textarea
                value={responseData.message}
                onChange={(e) => setResponseData({...responseData, message: e.target.value})}
                placeholder={
                  responseType === 'accept' ? "Thanks for choosing my service! I'll see you then." :
                  responseType === 'decline' ? "Sorry, I'm not available at those times." :
                  "I'm not available at those times, but I can do this alternative time instead."
                }
                className="h-24"
                maxLength={300}
              />
            </div>

            {responseType === 'counter' && (
              <div className="space-y-2">
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  value={responseData.counterNotes}
                  onChange={(e) => setResponseData({...responseData, counterNotes: e.target.value})}
                  placeholder="Any additional details about the suggested time..."
                  className="h-20"
                  maxLength={200}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitResponse}
                className={responseType === 'decline' ? 'bg-red-600 hover:bg-red-700 text-white' : 'ocean-gradient text-white'}
              >
                {responseType === 'accept' && 'Accept Request'}
                {responseType === 'decline' && 'Send Decline'}
                {responseType === 'counter' && 'Send Alternative'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
