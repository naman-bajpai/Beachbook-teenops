
import React, { useState, useEffect, useCallback } from "react";
import { Service, User } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MapPin, Clock, Star, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ServiceCard from "../components/services/ServiceCard";
import CategoryFilter from "../components/services/CategoryFilter";
import HeroSection from "../components/home/HeroSection";
import FeaturedServices from "../components/home/FeaturedServices";

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const servicesData = await Service.filter({ is_active: true }, "-created_date", 50);
      
      let userData = null;
      try {
        userData = await User.me();
      } catch (userError) {
        userData = null;
      }
      
      const validServices = servicesData.filter(service => {
        return service.id && service.title && service.description && service.price;
      });
      
      setServices(validServices);
      setUser(userData);
    } catch (error) {
      console.error("Error loading data:", error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterServices = useCallback(() => {
    let filtered = services;
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterServices();
  }, [filterServices]);

  const featuredServices = services.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
      <HeroSection user={user} />
      
      {featuredServices.length > 0 && (
        <FeaturedServices services={featuredServices} />
      )}

      <div id="services-section" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Find Help in Your Neighborhood
            </h2>
            <p className="text-slate-600">
              Discover services offered by talented teens near you
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search dog walking, mowing..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 border-sky-200 focus:border-sky-400"
              />
            </div>
            <Link to={createPageUrl("Provider")}>
              <Button className="ocean-gradient hover:from-sky-600 hover:to-cyan-600 text-white shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Your Teen Hustle
              </Button>
            </Link>
          </div>
        </div>

        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
              </p>
              {selectedCategory !== "all" && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCategory("all")}
                  className="text-sky-600 hover:text-sky-800"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-sky-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No services found
                </h3>
                <p className="text-slate-600 mb-6">
                  Try adjusting your search or browse different categories
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="border-sky-200 text-sky-600 hover:bg-sky-50"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
