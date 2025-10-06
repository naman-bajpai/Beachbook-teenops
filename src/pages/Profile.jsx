
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon, MapPin, Phone, Save } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    user_type: "customer",
    bio: "",
    location: "",
    phone: "",
    business_name: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check if this is a required profile completion
  const urlParams = new URLSearchParams(window.location.search);
  const isRequired = urlParams.get('required') === 'true';
  const returnUrl = urlParams.get('return');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        user_type: userData.user_type || "customer",
        bio: userData.bio || "",
        location: userData.location || "",
        phone: userData.phone || "",
        business_name: userData.business_name || ""
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      // If there's an error loading user data (e.g., not logged in),
      // we still set isLoading to false to render the login/signup prompt.
    }
    setIsLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        user_type: formData.user_type,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        business_name: formData.business_name
      });
      
      // If this was a required profile completion, redirect back
      if (isRequired && returnUrl) {
        window.location.href = decodeURIComponent(returnUrl);
      } else {
        loadUserData(); // Reload to get updated data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setIsSaving(false);
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Create Your Account</h1>
          <p className="text-slate-600 mb-8">Join TeenOp to start booking services or offering your own.</p>
          <Button onClick={() => User.login()} className="ocean-gradient text-white">
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isRequired ? "Complete Your Profile" : "My Profile"}
          </h1>
          <p className="text-slate-600">
            {isRequired ? 
              "Please provide your details to continue with your booking request" : 
              "Manage your TeenOp account and business settings"
            }
          </p>
        </div>

        {isRequired && (!user.full_name || !user.location) && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 font-medium">Required Information Missing</p>
            <p className="text-amber-700 text-sm">Please complete the required fields below to proceed with your booking.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.profile_image} />
                  <AvatarFallback className="bg-sky-100 text-sky-600 text-2xl">
                    {user.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user.full_name || 'User'}</CardTitle>
                <p className="text-slate-600">{user.email}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <UserIcon className="w-4 h-4" />
                  <span className="capitalize">{user.user_type || 'customer'}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name {isRequired && <span className="text-red-500">*</span>}</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        disabled
                        className="bg-slate-100"
                      />
                      <p className="text-xs text-slate-500">Name cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        disabled
                        className="bg-slate-100"
                      />
                      <p className="text-xs text-slate-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_type">Account Type</Label>
                    <Select 
                      value={formData.user_type} 
                      onValueChange={(value) => setFormData({...formData, user_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer Only</SelectItem>
                        <SelectItem value="provider">Provider Only</SelectItem>
                        <SelectItem value="both">Both Customer & Provider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.user_type === 'provider' || formData.user_type === 'both') && (
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                        placeholder="Your business or professional name"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell others about yourself..."
                      className="h-24"
                      maxLength={300}
                    />
                    <p className="text-xs text-slate-500 text-right">
                      {formData.bio.length}/300 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Neighborhood {isRequired && <span className="text-red-500">*</span>}</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. Oakwood, Springfield"
                        required={isRequired}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number {isRequired && <span className="text-red-500">*</span>}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        required={isRequired}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="ocean-gradient text-white"
                    >
                      {isSaving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isRequired ? "Complete & Continue" : "Save Changes"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
