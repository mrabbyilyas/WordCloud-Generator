"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Cloud, FileText, BarChart3 } from "lucide-react";

interface LoadingProps {
  message?: string;
  className?: string;
  variant?: "default" | "processing" | "uploading";
}

export function Loading({
  message = "Loading...",
  className,
  variant = "default",
}: LoadingProps) {
  const getVariantContent = () => {
    switch (variant) {
      case "processing":
        return {
          icon: <Cloud className="h-8 w-8 text-blue-500" />,
          title: "Generating Word Cloud",
          description: "Processing your text and creating visualizations...",
          steps: [
            { icon: <FileText className="h-4 w-4" />, text: "Analyzing text content", completed: true },
            { icon: <BarChart3 className="h-4 w-4" />, text: "Calculating word frequencies", completed: true },
            { icon: <Cloud className="h-4 w-4" />, text: "Generating word cloud", completed: false },
          ],
        };
      case "uploading":
        return {
          icon: <FileText className="h-8 w-8 text-green-500" />,
          title: "Uploading File",
          description: "Uploading and validating your text file...",
          steps: [
            { icon: <FileText className="h-4 w-4" />, text: "Uploading file", completed: false },
          ],
        };
      default:
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin" />,
          title: message,
          description: null,
          steps: [],
        };
    }
  };

  const content = getVariantContent();

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <div className="relative">
        {/* Animated background circle */}
        <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/20 animate-pulse" />
        
        {/* Icon */}
        <div className="relative z-10 p-4">
          {content.icon}
        </div>
      </div>
      
      {/* Title */}
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {content.title}
      </h3>
      
      {/* Description */}
      {content.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md">
          {content.description}
        </p>
      )}
      
      {/* Processing steps */}
      {content.steps.length > 0 && (
        <div className="mt-6 space-y-3 w-full max-w-sm">
          {content.steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors",
                step.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 dark:border-gray-600"
              )}>
                {step.completed ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <div className={cn(
                  "transition-colors",
                  step.completed ? "text-green-600 dark:text-green-400" : "text-gray-500"
                )}>
                  {step.icon}
                </div>
                <span className={cn(
                  "text-sm transition-colors",
                  step.completed
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {step.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Loading dots animation */}
      <div className="mt-4 flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// Simple spinner component for inline loading
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
  );
}