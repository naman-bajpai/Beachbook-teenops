
import React, { useState } from "react";
import { Booking, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Check } from "lucide-react";
import { format, addDays } from "date-fns";

export default function BookingForm({ service, user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    booking_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    booking_time: "09:00",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      await User.loginWithRedirect(window.location.href);
      return;
    }

    setIsSubmitting(true);
    try {
      await Booking.create({
        service_id: service.id,
        customer_id: user.id,
        provider_id: service.provider_id,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        notes: formData.notes,
        total_price: service.price,
        status: "pending"
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating booking:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Select Date
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.booking_date}
          min={format(new Date(), 'yyyy-MM-dd')}
          onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
          required
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Preferred Time
        </Label>
        <Input
          id="time"
          type="time"
          value={formData.booking_time}
          onChange={(e) => setFormData({...formData, booking_time: e.target.value})}
          required
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any special requirements or questions?"
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
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Total</span>
          <span className="text-xl font-bold text-sky-600">${service.price}</span>
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
              "Booking..."
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {user ? "Book Now" : "Login to Book"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
