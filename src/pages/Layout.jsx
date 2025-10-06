

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  Home,
  User as UserIcon,
  Calendar,
  Plus,
  Settings,
  Waves,
  Zap,
  MessageCircle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const allNavigationItems = [
  {
    title: "Neighborhood",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "My Requests",
    url: createPageUrl("Bookings"),
    icon: Calendar,
  },
  {
    title: "Messages",
    url: createPageUrl("Messages"),
    icon: MessageCircle,
  },
  {
    title: "My Teen Hustle",
    url: createPageUrl("Provider"),
    icon: Plus,
    requiresProvider: true, // Only show for providers and both
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: UserIcon,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        // User not logged in - that's okay
        setUser(null);
      }
    };
    loadUser();
  }, []);

  // Filter navigation items based on user type
  const navigationItems = allNavigationItems.filter(item => {
    if (item.requiresProvider && user) {
      return user.user_type === 'provider' || user.user_type === 'both';
    }
    return true;
  });

  return (
    <>
      <style>
        {`
          :root {
            --ocean-blue: #0EA5E9;
            --deep-blue: #0369A1;
            --turquoise: #06B6D4;
            --seafoam: #67E8F9;
            --sand: #FEF3C7;
            --coral: #FB7185;
            --sunset: #F97316;
          }

          .ocean-gradient {
            background: linear-gradient(135deg, var(--ocean-blue) 0%, var(--turquoise) 100%);
          }

          .beach-gradient {
            background: linear-gradient(135deg, var(--seafoam) 0%, var(--sand) 100%);
          }

          .sunset-gradient {
            background: linear-gradient(135deg, var(--coral) 0%, var(--sunset) 100%);
          }

          .wave-pattern::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,60 C300,120 900,0 1200,60 L1200,0 L0,0 Z' fill='%2306B6D4' opacity='0.1'/%3E%3C/svg%3E");
            background-size: cover;
            z-index: -1;
          }
        `}
      </style>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-sky-50 to-blue-50">
          <Sidebar className="border-r border-sky-200 bg-white/80 backdrop-blur-sm">
            <SidebarHeader className="border-b border-sky-200 p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdaf551e9ceb50988971b7/ecec62dc4_NewTeenOpLogo1.png"
                    alt="TeenOp Logo"
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-xl bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                    TeenOp
                  </h2>
                  <p className="text-xs text-sky-600">Teen Opportunity</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-2">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-sky-700 uppercase tracking-wider px-2 py-2">
                  Menu
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-sky-100 hover:text-sky-700 transition-all duration-200 rounded-lg mb-1 ${
                            location.pathname === item.url ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-slate-600'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sky-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.full_name?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {user?.full_name || 'Welcome'}
                  </p>
                  <p className="text-xs text-sky-600 truncate">
                    {user?.user_type === 'provider' ? 'Teen Entrepreneur' : 
                     user?.user_type === 'both' ? 'Customer & Provider' : 
                     'Start your neighborhood hustle'}
                  </p>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/70 backdrop-blur-sm border-b border-sky-200 px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-sky-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  TeenOp
                </h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto relative wave-pattern">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}

