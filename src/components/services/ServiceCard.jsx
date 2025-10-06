import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Clock, ChevronRight, Star, Dog, Spade, BookOpen, Home, Laptop, 
  ShoppingBag, Car, Baby, Palette, ThumbsUp, Wand2, PartyPopper, Paintbrush, Camera 
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  pet_care: "bg-orange-100 text-orange-800 border-orange-200",
  yard_work: "bg-green-100 text-green-800 border-green-200",
  tutoring: "bg-indigo-100 text-indigo-800 border-indigo-200",
  home_help: "bg-blue-100 text-blue-800 border-blue-200",
  tech_help: "bg-slate-100 text-slate-800 border-slate-200",
  errands: "bg-purple-100 text-purple-800 border-purple-200",
  car_wash: "bg-cyan-100 text-cyan-800 border-cyan-200",
  babysitting: "bg-pink-100 text-pink-800 border-pink-200",
  graphic_design: "bg-rose-100 text-rose-800 border-rose-200",
  social_media: "bg-sky-100 text-sky-800 border-sky-200",
  beauty: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  event_work: "bg-amber-100 text-amber-800 border-amber-200",
  art_commissions: "bg-violet-100 text-violet-800 border-violet-200",
  photography: "bg-zinc-100 text-zinc-800 border-zinc-200",
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

export default function ServiceCard({ service, featured = false }) {
  try {
    if (!service || !service.id) {
      console.warn("Invalid service data:", service);
      return null;
    }
    
    const Icon = categoryIcons[service.category] || Dog;
    const iconBgColor = categoryColors[service.category]?.replace('text-','bg-').replace('-800','-100') || 'bg-slate-100';
    const iconColor = categoryColors[service.category]?.replace('bg-','text-').replace('-100','-800') || 'text-slate-800';

    return (
      <Card className={`group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm flex flex-col h-full ${
        featured ? 'ring-2 ring-amber-200' : ''
      }`}>
        <div className={`relative h-48 flex items-center justify-center rounded-t-2xl ${iconBgColor}`}>
          <Icon className={`w-20 h-20 ${iconColor}`} strokeWidth={1.5} />
          {featured && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-3 flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
              {service.title}
            </h3>
            <Badge className={`${categoryColors[service.category]} border shrink-0`}>
              {service.category?.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-slate-600 text-sm line-clamp-2 pt-1">
            {service.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 pt-2">
            {service.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{service.location}</span>
              </div>
            )}
            {service.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{service.duration}min</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 mt-auto">
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900">
                ${service.price}
              </span>
              <span className="text-xs text-slate-500">{service.pricing_model === 'per_hour' ? 'per hour' : 'per job'}</span>
            </div>

            <Link to={createPageUrl(`Service?id=${service.id}`)}>
              <Button className="ocean-gradient hover:from-sky-600 hover:to-cyan-600 text-white shadow-lg group-hover:shadow-xl transition-all">
                Request Booking
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error rendering service card:", error, service);
    return (
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-slate-500">
          <p>Unable to load service</p>
        </CardContent>
      </Card>
    );
  }
}