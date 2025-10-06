
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Waves, Zap, Star, Users, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HeroSection({ user }) {
  const handleScrollToServices = () => {
    const section = document.getElementById('services-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600">
      <div className="absolute inset-0">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdaf551e9ceb50988971b7/6b2835fb3_LargeDogwalkingPic.jpg"
          alt="Teen playing with a dalmatian dog"
          className="w-full h-full object-cover opacity-90" />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-slate-800/60"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Zap className="w-4 h-4 mr-2" />
                Your Neighborhood Helpers
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Hire Local Teens
                <span className="bg-clip-text text-[#ff7852] block from-amber-300 to-orange-300">For Your To-Do List

                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-sky-100 leading-relaxed">Teens offering services. Neighbors finding help. Communities growing together.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleScrollToServices}
                size="lg" className="bg-white text-[#ff7852] px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-11 hover:bg-sky-50 rounded-full shadow-xl cursor-pointer">

                Find Teen Services
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Link to={createPageUrl("Provider")}>
                <Button
                  size="lg"
                  variant="outline" className="bg-white/20 text-[#ff7852] px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border h-11 backdrop-blur-sm border-white hover:bg-white hover:text-sky-600 rounded-full shadow-xl">

                  Start Your Teen Hustle
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2 text-sky-100">
                <Users className="w-5 h-5" />
                <span className="font-medium">Trusted Local Teens</span>
              </div>
              <div className="flex items-center gap-2 text-sky-100">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Services In Your Neighborhood</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl transform rotate-6 scale-105"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Dog Walking Service</h3>
                      <p className="text-slate-600">Starting at $15/walk</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array(5).fill(0).map((_, i) =>
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      )}
                      <span className="ml-2 text-slate-600 text-sm">4.9 (82 reviews)</span>
                    </div>
                  </div>
                  
                  <Button className="w-full ocean-gradient text-white font-semibold rounded-xl">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-12">
          <path
            d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
            fill="rgb(248 250 252)" />
        </svg>
      </div>
    </div>);
}
