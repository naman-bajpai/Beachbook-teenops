
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/api/entities";

const categories = [
  "pet_care", "yard_work", "tutoring", "home_help",
  "tech_help", "errands", "car_wash", "babysitting",
  "graphic_design", "social_media", "beauty",
  "event_work", "art_commissions", "photography"
];

export default function ServiceForm({ service, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: service?.title || "",
    description: service?.description || "",
    price: service?.price || "",
    pricing_model: service?.pricing_model || "per_job",
    duration: service?.duration || "",
    category: service?.category || "pet_care",
    location: service?.location || "",
    address: service?.address || "", // Added address field
    qualifications: service?.qualifications || "",
    education: service?.education || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateServiceData = async (data) => {
    setValidationError("");
    
    try {
      const currentUser = await User.me();
      if (!currentUser || !currentUser.id) {
        throw new Error("User not authenticated. Please log in.");
      }
      
      if (!data.title?.trim()) throw new Error("Service title is required.");
      if (!data.description?.trim()) throw new Error("Service description is required.");
      
      const parsedPrice = parseFloat(data.price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error("A valid price is required and must be greater than zero.");
      }
      
      const parsedDuration = parseInt(data.duration);
      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        throw new Error("A valid duration is required and must be greater than zero.");
      }

      if (data.description.length > 300) throw new Error("Description cannot exceed 300 characters.");
      if (data.qualifications.length > 300) throw new Error("Qualifications cannot exceed 300 characters.");
      if (data.education.length > 300) throw new Error("Education cannot exceed 300 characters.");

      return true;
    } catch (error) {
      setValidationError(error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationError("");

    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };
      
      const isValid = await validateServiceData(serviceData);
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }
      
      await onSave(serviceData);
    } catch (error) {
      console.error("Error saving service:", error);
      setValidationError("Failed to save service. Please try again. " + (error.message || ""));
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? "Edit Service" : "Add New Service"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {validationError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Dog Walking"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your service in detail..."
              className="h-24"
              maxLength={300}
              required
            />
            <p className="text-xs text-slate-500 text-right">
              {formData.description.length}/300 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications</Label>
            <Textarea
              id="qualifications"
              value={formData.qualifications}
              onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
              placeholder="e.g. CPR certified, 5 years of experience..."
              className="h-24"
              maxLength={300}
            />
            <p className="text-xs text-slate-500 text-right">
              {formData.qualifications.length}/300 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              value={formData.education}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
              placeholder="e.g. Springfield High School, Class of 2025"
              className="h-24"
              maxLength={300}
            />
            <p className="text-xs text-slate-500 text-right">
              {formData.education.length}/300 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="15.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing_model">Pricing Model</Label>
                <Select value={formData.pricing_model} onValueChange={(value) => setFormData({...formData, pricing_model: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_job">Per Job</SelectItem>
                    <SelectItem value="per_hour">Per Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                placeholder="30"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Neighborhood</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Oakwood"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Full Address (Service Location)</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="e.g. 123 Main St, Springfield"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="ocean-gradient text-white"
            >
              {isSubmitting ? "Saving..." : (service ? "Update Service" : "Create Service")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
