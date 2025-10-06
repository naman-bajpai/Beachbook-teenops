
import React, { useState } from "react";
import { BookingRequest, Conversation, Message, User } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, X, Send } from "lucide-react";
import { format, addDays } from "date-fns";
import { createPageUrl } from "@/utils";

export default function BookingRequestForm({ service, user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    preferredDates: [
      {
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: "09:00"
      }
    ],
    duration: 1,
    location: "",
    notes: "",
    phone: user?.phone || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const addDateOption = () => {
    if (formData.preferredDates.length < 3) {
      setFormData({
        ...formData,
        preferredDates: [
          ...formData.preferredDates,
          {
            date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
            time: "09:00"
          }
        ]
      });
    }
  };

  const removeDateOption = (index) => {
    if (formData.preferredDates.length > 1) {
      const newDates = formData.preferredDates.filter((_, i) => i !== index);
      setFormData({ ...formData, preferredDates: newDates });
    }
  };

  const updateDateOption = (index, field, value) => {
    const newDates = [...formData.preferredDates];
    newDates[index][field] = value;
    setFormData({ ...formData, preferredDates: newDates });
  };

  const calculateEstimatedPrice = () => {
    if (service.pricing_model === 'per_hour') {
      return service.price * formData.duration;
    }
    return service.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      await User.loginWithRedirect(window.location.href);
      return;
    }

    setIsSubmitting(true);
    setValidationError("");

    try {
      // Validate user profile information
      if (!user.full_name || !user.location || !user.phone) {
        setValidationError("Please complete your profile (full name, location, and phone number) before making a booking request.");
        window.location.href = createPageUrl(`Profile?required=true&return=${encodeURIComponent(window.location.href)}`);
        setIsSubmitting(false);
        return;
      }

      const estimatedPrice = calculateEstimatedPrice();
      
      const requestData = {
        service_id: service.id,
        customer_id: user.id,
        provider_id: service.provider_id,
        preferred_dates: formData.preferredDates,
        duration_hours: formData.duration,
        location_details: formData.location,
        notes: formData.notes,
        customer_phone: formData.phone,
        total_estimated_price: estimatedPrice,
        status: "pending"
      };

      const request = await BookingRequest.create(requestData);

      // Find or create a conversation
      let conversation;
      const existingConvos = await Conversation.filter({
          customer_id: user.id,
          provider_id: service.provider_id,
          service_id: service.id,
      });

      if (existingConvos.length > 0) {
          conversation = existingConvos[0];
          await Conversation.update(conversation.id, { booking_request_id: request.id }); // Update existing conversation
      } else {
          conversation = await Conversation.create({
              customer_id: user.id,
              provider_id: service.provider_id,
              service_id: service.id,
              booking_request_id: request.id, // Link to the new booking request
              // last_message_at, last_message_preview, unread_count will be handled by message creation
          });
      }

      // Create a system message to start the chat
      await Message.create({
          conversation_id: conversation.id,
          sender_id: user.id, // The customer is initiating the system message
          sender_type: 'customer',
          content: `Booking request sent for "${service.title}". Notes: ${formData.notes || 'No notes provided.'}`,
          message_type: 'text', // Changed to text to be more visible
      });

      // Send notification email to provider
      try {
        const providerData = await User.filter({ id: service.provider_id });
        if (providerData.length > 0) {
          const provider = providerData[0];
          await SendEmail({
            to: provider.email, // Use provider's email for notification
            subject: `New Booking Request for ${service.title}`,
            body: `
Hello ${provider.full_name || provider.business_name || 'Provider'},

You have a new booking request for your service "${service.title}".

Customer: ${user.full_name} (${user.email})
Phone: ${formData.phone}
Estimated Price: $${estimatedPrice}

Preferred Times:
${formData.preferredDates.map((d, i) => `${i + 1}. ${format(new Date(d.date), 'EEEE, MMM d, yyyy')} at ${d.time}`).join('\n')}

Duration: ${formData.duration} hour(s)
${formData.location ? `Location: ${formData.location}` : ''}
${formData.notes ? `Notes: ${formData.notes}` : ''}

Please log in to your TeenOp account to accept, decline, or propose an alternative time. You can also message the customer directly through the Messages section.

Best regards,
The TeenOp Team
            `
          });
        }
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }

      onSuccess(request.id);
    } catch (error) {
      console.error("Error creating booking request:", error);
      setValidationError("Failed to send booking request. Please try again.");
    }
    setIsSubmitting(false);
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Create Account to Book</h3>
          <p className="text-slate-600 mb-6">Join TeenOp to request bookings from local teen entrepreneurs</p>
          <Button
            onClick={() => User.loginWithRedirect(window.location.href)}
            className="ocean-gradient text-white w-full"
          >
            Create Account & Continue
          </Button>
          <p className="text-xs text-slate-500 mt-4">We'll ask for your name, neighborhood, and contact info</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Suggest a Booking
        </CardTitle>
        <p className="text-sm text-slate-600">
          Send your booking preferences to the provider. They'll respond with confirmation or alternative times.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {validationError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{validationError}</span>
            </div>
          )}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Preferred Times (up to 3 options)</Label>
            {formData.preferredDates.map((dateOption, index) => (
              <div key={index} className="flex items-end gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`date-${index}`} className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Option {index + 1} - Date
                  </Label>
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={dateOption.date}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => updateDateOption(index, 'date', e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`time-${index}`} className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time
                  </Label>
                  <Input
                    id={`time-${index}`}
                    type="time"
                    value={dateOption.time}
                    onChange={(e) => updateDateOption(index, 'time', e.target.value)}
                    required
                    className="bg-white"
                  />
                </div>
                {formData.preferredDates.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeDateOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {formData.preferredDates.length < 3 && (
              <Button
                type="button"
                variant="outline"
                onClick={addDateOption}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Time Option
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseFloat(e.target.value)})}
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Your Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 (555) 123-4567"
                required
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Specific Location/Address</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., 123 Oak Street, or specific location details"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements, preferences, or questions?"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="bg-white h-20"
              maxLength={300}
            />
            <p className="text-xs text-slate-500 text-right">
              {formData.notes.length}/300 characters
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4 p-4 bg-sky-50 rounded-lg">
              <span className="font-medium">Estimated Total</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-sky-600">${calculateEstimatedPrice()}</span>
                <p className="text-xs text-slate-500">
                  {service.pricing_model === 'per_hour' 
                    ? `$${service.price}/hour × ${formData.duration} hours`
                    : 'Per job pricing'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 ocean-gradient text-white"
              >
                {isSubmitting ? (
                  "Sending Request..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {"Send Booking Request"} 
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
