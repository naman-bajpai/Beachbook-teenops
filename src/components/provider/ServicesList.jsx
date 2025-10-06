import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MapPin, Clock, Eye } from "lucide-react";

export default function ServicesList({ services, onEdit }) {
  if (services.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-sky-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No services yet</h3>
          <p className="text-slate-600">Create your first service to start accepting bookings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {services.map((service) => (
        <Card key={service.id} className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <Badge variant={service.is_active ? "default" : "secondary"} className="ocean-gradient text-white">
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                    {service.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-slate-600">
                  {service.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{service.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} minutes</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-900">${service.price}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(service)}
                  className="hover:bg-sky-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{service.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}