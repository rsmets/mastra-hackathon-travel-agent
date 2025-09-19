'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '../../store/travel-store';
import { MessageBubble } from './MessageBubble';
import { LoadingMessage } from './LoadingMessage';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✈️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to plan your next adventure?
          </h3>
          <p className="text-gray-500">
            Tell me where you'd like to go or what you're looking for!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 chat-messages">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isLoading && <LoadingMessage />}
      
      <div ref={messagesEndRef} />
    </div>
  );
}
