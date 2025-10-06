import React, { useState, useEffect, useRef, useCallback } from "react";
import { Message, Service, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User as UserIcon } from "lucide-react";
import { format } from "date-fns";

export default function ChatWindow({ conversation, user, onNewMessage }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!conversation) return;
    
    setIsLoading(true);
    try {
      const conversationMessages = await Message.filter(
        { conversation_id: conversation.id }, 
        "created_date"
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
    setIsLoading(false);
  }, [conversation]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        conversation_id: conversation.id,
        sender_id: user.id,
        sender_type: conversation.customer_id === user.id ? 'customer' : 'provider',
        content: newMessage.trim(),
        message_type: 'text'
      };

      const sentMessage = await Message.create(messageData);
      setMessages(prev => [...prev, sentMessage]);
      
      onNewMessage(conversation.id, sentMessage);
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsSending(false);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  const otherUser = conversation.otherUser;

  return (
    <Card className="bg-white/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser?.profile_image} />
            <AvatarFallback className="bg-sky-100 text-sky-600">
              {otherUser?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">
              {otherUser?.full_name || otherUser?.email || 'Unknown User'}
            </CardTitle>
            <p className="text-sm text-slate-600">
              {conversation.service?.title || 'Service Inquiry'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isOwnMessage
                          ? 'ocean-gradient text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-sky-100' : 'text-slate-500'
                        }`}
                      >
                        {format(new Date(message.created_date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-slate-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isSending}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || isSending}
              className="ocean-gradient text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}