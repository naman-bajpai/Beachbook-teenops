
import React, { useState, useEffect, useCallback } from "react";
import { Service, User, Review, Booking } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, MapPin, Clock, Star, User as UserIcon, Calendar, Heart, Share2, Shield, BookOpen, BadgeCheck,
  Dog, Spade, Home, Laptop, ShoppingBag, Car, Baby, Palette, ThumbsUp, Wand2, PartyPopper, Paintbrush, Camera
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import BookingRequestForm from "../components/booking/BookingRequestForm";
import ReviewsList from "../components/reviews/ReviewsList";

const categoryColors = {
  pet_care: "bg-orange-100 text-orange-800",
  yard_work: "bg-green-100 text-green-800",
  tutoring: "bg-indigo-100 text-indigo-800",
  home_help: "bg-blue-100 text-blue-800",
  tech_help: "bg-slate-100 text-slate-800",
  errands: "bg-purple-100 text-purple-800",
  car_wash: "bg-cyan-100 text-cyan-800",
  babysitting: "bg-pink-100 text-pink-800",
  graphic_design: "bg-rose-100 text-rose-800",
  social_media: "bg-sky-100 text-sky-800",
  beauty: "bg-fuchsia-100 text-fuchsia-800",
  event_work: "bg-amber-100 text-amber-800",
  art_commissions: "bg-violet-100 text-violet-800",
  photography: "bg-zinc-100 text-zinc-800",
};

const categoryIcons = {
  pet_care: Dog,
  yard_work: Spade,
  tutoring: BookOpen,
  home_help: Home,
  tech_help: Laptop,
  errands: ShoppingBag,
  car_wash: Car,
  babysitting: Baby,
  graphic_design: Palette,
  social_media: ThumbsUp,
  beauty: Wand2,
  event_work: PartyPopper,
  art_commissions: Paintbrush,
  photography: Camera,
};

export default function ServicePage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id');
  
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [user, setUser] = useState(null);

  const loadServiceData = useCallback(async () => {
    if (!serviceId) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true); 
    
    try {
      // Load service data first
      const serviceData = await Service.filter({ id: serviceId });
      
      // Try to get user data but don't fail if user isn't logged in
      let userData = null;
      try {
        userData = await User.me();
      } catch (userError) {
        // User not logged in - that's okay for browsing
        userData = null;
      }

      if (serviceData.length > 0) {
        const currentService = serviceData[0];
        setService(currentService);
        setUser(userData);

        // Load provider info
        setProvider(null);
        if (currentService.provider_id) {
          try {
            const allUsers = await User.list();
            const matchingProvider = allUsers.find(user => user.id === currentService.provider_id);
            if (matchingProvider) {
              setProvider(matchingProvider);
            } else {
              console.warn("Provider not found for service:", currentService.id);
            }
          } catch (providerError) {
            console.error("Could not fetch provider:", providerError);
          }
        }

        // Load reviews
        try {
          const reviewsData = await Review.filter({ service_id: serviceId }, "-created_date");
          setReviews(reviewsData);
        } catch (reviewError) {
          console.error("Could not fetch reviews:", reviewError);
          setReviews([]);
        }

      } else {
        setService(null);
      }
    } catch (error) {
      console.error("Error loading service:", error);
      setService(null);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadServiceData();
  }, [loadServiceData]);

  const handleBookingRequestSuccess = (requestId) => {
    setShowBookingForm(false);
    navigate(createPageUrl(`BookingRequestStatus?id=${requestId}`));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Service not found</h2>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const Icon = categoryIcons[service.category] || Dog;
  const iconBgColorClass = categoryColors[service.category]?.replace('text-','bg-').replace('-800','-100') || 'bg-slate-100';
  const iconColorClass = categoryColors[service.category]?.replace('bg-','text-').replace('-100','-800') || 'text-slate-800';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className={`w-32 h-32 rounded-2xl flex-shrink-0 flex items-center justify-center ${iconBgColorClass}`}>
              <Icon className={`w-16 h-16 ${iconColorClass}`} strokeWidth={1.5}/>
            </div>
            <div className="flex-1">
              <Badge className={`${iconBgColorClass} ${iconColorClass} mb-3`}>
                {service.category.replace(/_/g, ' ')}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">{service.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600">
                {service.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{service.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} minutes</span>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>{averageRating.toFixed(1)} ({reviews.length} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 self-start">
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>About This Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>

            {(service.qualifications || service.education) && (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Qualifications & Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.qualifications && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                         <BadgeCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Qualifications</h4>
                        <p className="text-slate-700 whitespace-pre-wrap">{service.qualifications}</p>
                      </div>
                    </div>
                  )}
                  {service.education && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Education</h4>
                        <p className="text-slate-700 whitespace-pre-wrap">{service.education}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {provider ? (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Meet Your Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={provider.profile_image} />
                      <AvatarFallback className="bg-sky-100 text-sky-600">
                        {provider.full_name?.[0] || provider.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">
                        {provider.business_name || provider.full_name || 'Service Provider'}
                      </h3>
                      {provider.bio && (
                        <p className="text-slate-600">{provider.bio}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        {provider.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{provider.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          <span>Verified Provider</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <UserIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Provider Information Unavailable</h3>
                  <p className="text-slate-600">This service is temporarily unavailable.</p>
                </CardContent>
              </Card>
            )}

            <ReviewsList reviews={reviews} />
          </div>

          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    ${service.price}
                  </CardTitle>
                  <span className="text-slate-500">{service.pricing_model === 'per_hour' ? 'per hour' : 'per job'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showBookingForm ? (
                  <>
                    <Button 
                      className="w-full ocean-gradient text-white font-semibold text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                      onClick={() => {
                        if (!user) {
                          // Redirect to login if not logged in
                          User.loginWithRedirect(window.location.href);
                        } else if (!user.full_name || !user.location || !user.phone) {
                          // Redirect to profile page to complete information if logged in but profile is complete
                          window.location.href = createPageUrl(`Profile?required=true&return=${encodeURIComponent(window.location.href)}`);
                        } else {
                          // Show booking form if logged in and profile is complete
                          setShowBookingForm(true);
                        }
                      }}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Request Booking
                    </Button>
                    <p className="text-sm text-center text-slate-600">
                      {user ? 
                        "Send your preferred times to the provider" : 
                        "Create an account to send your booking request"
                      }
                    </p>
                  </>
                ) : (
                  <BookingRequestForm
                    service={service}
                    user={user}
                    onSuccess={handleBookingRequestSuccess}
                    onCancel={() => setShowBookingForm(false)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
