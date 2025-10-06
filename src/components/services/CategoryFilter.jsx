
import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Dog,
  Spade,
  BookOpen,
  Home,
  Laptop,
  ShoppingBag,
  Car,
  Baby,
  Sparkles,
  Palette,
  ThumbsUp,
  Wand2,
  PartyPopper,
  Paintbrush,
  Camera
} from "lucide-react";

const categories = [
  { id: "all", label: "All Services", icon: Sparkles },
  { id: "pet_care", label: "Pet Care", icon: Dog },
  { id: "yard_work", label: "Yard Work", icon: Spade },
  { id: "tutoring", label: "Tutoring", icon: BookOpen },
  { id: "babysitting", label: "Babysitting", icon: Baby },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "graphic_design", label: "Graphic Design", icon: Palette },
  { id: "art_commissions", label: "Art Commissions", icon: Paintbrush },
  { id: "social_media", label: "Social Media", icon: ThumbsUp },
  { id: "beauty", label: "Beauty", icon: Wand2 },
  { id: "event_work", label: "Event Work", icon: PartyPopper },
  { id: "home_help", label: "Home Help", icon: Home },
  { id: "tech_help", label: "Tech Help", icon: Laptop },
  { id: "errands", label: "Errands", icon: ShoppingBag },
  { id: "car_wash", label: "Car Wash", icon: Car },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <Badge
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer transition-all duration-200 px-4 py-2 ${
              isSelected
                ? "ocean-gradient text-white shadow-lg hover:shadow-xl"
                : "bg-white/80 text-slate-600 border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
            }`}
            onClick={() => onCategoryChange(category.id)}
          >
            <Icon className="w-4 h-4 mr-2" />
            {category.label}
          </Badge>
        );
      })}
    </div>
  );
}
