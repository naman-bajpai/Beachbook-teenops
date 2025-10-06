import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Zap } from "lucide-react";
import ServiceCard from "../services/ServiceCard";

export default function FeaturedServices({ services }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 mb-4">
          <Zap className="w-4 h-4 mr-2" />
          Featured Teen Services
        </Badge>
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Meet Teen Entrepreneurs Near You
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Discover incredible services from talented young entrepreneurs who are turning their passions into successful businesses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) =>
        <ServiceCard key={service.id} service={service} featured={true} />
        )}
      </div>
    </div>);
}