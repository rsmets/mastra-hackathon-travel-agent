'use client';

import { Bot } from 'lucide-react';

export function LoadingMessage() {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-xs lg:max-w-md">
        {/* Avatar */}
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <Bot className="w-4 h-4 text-gray-600" />
          </div>
        </div>

        {/* Loading Content */}
        <div className="px-4 py-2 bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              Finding the best options for you...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
