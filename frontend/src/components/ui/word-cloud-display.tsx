"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Download, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";

interface WordCloudDisplayProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  onDownload?: () => void;
}

export function WordCloudDisplay({
  imageUrl,
  alt = "Word Cloud",
  className,
  onDownload,
}: WordCloudDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async () => {
    if (!onDownload) {
      // Default download behavior
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "wordcloud.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download failed:", error);
      }
    } else {
      onDownload();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (imageError) {
    return (
      <div className={cn(
        "flex items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg",
        className
      )}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Failed to load word cloud image
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        "relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",
        className
      )}>
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        
        {/* Image */}
        <div className="relative">
          <Image
            src={imageUrl}
            alt={alt}
            width={800}
            height={600}
            className={cn(
              "w-full h-auto transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            priority
          />
          
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Download image"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <Image
              src={imageUrl}
              alt={alt}
              width={1200}
              height={900}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
          <div
            className="absolute inset-0 -z-10"
            onClick={toggleFullscreen}
          />
        </div>
      )}
    </>
  );
}