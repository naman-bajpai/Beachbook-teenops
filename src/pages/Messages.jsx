import React, { useState, useEffect, useCallback } from "react";
import { Conversation, Message, Service, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, User as UserIcon, Calendar } from "lucide-react";
import { format } from "date-fns";

import ConversationsList from "../components/messages/ConversationsList";
import ChatWindow from "../components/messages/ChatWindow";

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async (currentUser) => {
    if (!currentUser) return;

    try {
      let userConversations = [];
      
      if (currentUser.user_type === 'customer') {
        userConversations = await Conversation.filter({ customer_id: currentUser.id }, "-last_message_at");
      } else if (currentUser.user_type === 'provider') {
        userConversations = await Conversation.filter({ provider_id: currentUser.id }, "-last_message_at");
      } else if (currentUser.user_type === 'both') {
        const asCustomer = await Conversation.filter({ customer_id: currentUser.id }, "-last_message_at");
        const asProvider = await Conversation.filter({ provider_id: currentUser.id }, "-last_message_at");
        userConversations = [...asCustomer, ...asProvider];
        
        // Remove duplicates and sort by last message
        const uniqueConversations = userConversations.filter((conv, index, self) => 
          index === self.findIndex(c => c.id === conv.id)
        );
        userConversations = uniqueConversations.sort((a, b) => 
          new Date(b.last_message_at || b.created_date) - new Date(a.last_message_at || a.created_date)
        );
      }

      setConversations(userConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    }
  }, []);

  const loadUserAndConversations = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      await loadConversations(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
      setUser(null);
    }
    setIsLoading(false);
  }, [loadConversations]);

  useEffect(() => {
    loadUserAndConversations();
  }, [loadUserAndConversations]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewMessage = (conversationId, message) => {
    // Update conversation list with new message info
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            last_message_at: new Date().toISOString(),
            last_message_preview: message.content.substring(0, 50)
          }
        : conv
    ));
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
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Please Login</h1>
          <p className="text-slate-600 mb-8">You need to be logged in to access messages.</p>
          <Button onClick={() => User.login()} className="ocean-gradient text-white">
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Chat with customers and providers</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-1">
            <ConversationsList
              conversations={conversations}
              user={user}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
            />
          </div>

          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                user={user}
                onNewMessage={handleNewMessage}
              />
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a conversation</h3>
                    <p className="text-slate-600">Choose a conversation from the list to start chatting</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}