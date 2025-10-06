import React, { useState, useEffect, useCallback } from "react";
import { Service, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";

export default function ConversationsList({ conversations, user, selectedConversation, onConversationSelect }) {
  const [conversationsWithDetails, setConversationsWithDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversationDetails = useCallback(async () => {
    if (!conversations.length) {
      setConversationsWithDetails([]);
      setIsLoading(false);
      return;
    }

    try {
      const conversationsWithData = await Promise.all(
        conversations.map(async (conversation) => {
          try {
            // Get service details
            const services = await Service.filter({ id: conversation.service_id });
            const service = services[0] || null;

            // Get other participant details
            const otherUserId = conversation.customer_id === user.id 
              ? conversation.provider_id 
              : conversation.customer_id;
            
            const users = await User.filter({ id: otherUserId });
            const otherUser = users[0] || null;

            const isCustomerView = conversation.customer_id === user.id;
            const unreadCount = isCustomerView 
              ? conversation.customer_unread_count || 0
              : conversation.provider_unread_count || 0;

            return {
              ...conversation,
              service,
              otherUser,
              isCustomerView,
              unreadCount
            };
          } catch (error) {
            console.error("Error loading conversation details:", error);
            return {
              ...conversation,
              service: null,
              otherUser: null,
              isCustomerView: conversation.customer_id === user.id,
              unreadCount: 0
            };
          }
        })
      );

      setConversationsWithDetails(conversationsWithData);
    } catch (error) {
      console.error("Error loading conversation details:", error);
      setConversationsWithDetails([]);
    }
    setIsLoading(false);
  }, [conversations, user]);

  useEffect(() => {
    loadConversationDetails();
  }, [loadConversationDetails]);

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  if (conversationsWithDetails.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No conversations yet</h3>
            <p className="text-slate-600 text-sm">
              {user.user_type === 'customer' ? 
                "Send a booking request to start chatting with providers" :
                "Conversations will appear when customers send booking requests"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1 p-4 pt-0">
            {conversationsWithDetails.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-sky-50 border border-sky-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.otherUser?.profile_image} />
                    <AvatarFallback className="bg-sky-100 text-sky-600">
                      {conversation.otherUser?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-slate-900 truncate">
                        {conversation.otherUser?.full_name || conversation.otherUser?.email || 'Unknown User'}
                      </h4>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-1">
                      {conversation.service?.title || 'Service Inquiry'}
                    </p>
                    
                    {conversation.last_message_preview && (
                      <p className="text-sm text-slate-500 truncate">
                        {conversation.last_message_preview}
                      </p>
                    )}
                    
                    {conversation.last_message_at && (
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(conversation.last_message_at), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}