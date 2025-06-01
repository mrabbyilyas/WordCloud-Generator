"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Download, Maximize2, Minimize2, Loader2 } from "lucide-react";
import Image from "next/image";

interface WordCloudDisplayProps {
  imageData?: string; // Can be base64 string or URL
  imageUrl?: string; // Deprecated: use imageData instead
  alt?: string;
  className?: string;
  onDownload?: () => void;
  isLoading?: boolean;
}

export function WordCloudDisplay({
  imageData,
  imageUrl, // Backward compatibility
  alt = "Word Cloud",
  className,
  onDownload,
  isLoading = false,
}: WordCloudDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [processedImageSrc, setProcessedImageSrc] = useState<string>("");

  // Process image data (base64 or URL)
  useEffect(() => {
    const imageSrc = imageData || imageUrl;
    if (!imageSrc) {
      setProcessedImageSrc("");
      return;
    }

    // Check if it's base64 data
    if (imageSrc.startsWith('data:image/')) {
      setProcessedImageSrc(imageSrc);
    } else if (imageSrc.includes('base64,')) {
      // Handle base64 without data URL prefix
      setProcessedImageSrc(`data:image/png;base64,${imageSrc.split('base64,')[1]}`);
    } else {
      // Assume it's a URL
      setProcessedImageSrc(imageSrc);
    }
  }, [imageData, imageUrl]);

  const handleDownload = async () => {
    if (!onDownload && processedImageSrc) {
      // Default download behavior
      try {
        let blob: Blob;
        
        if (processedImageSrc.startsWith('data:image/')) {
          // Handle base64 data
          const response = await fetch(processedImageSrc);
          blob = await response.blob();
        } else {
          // Handle URL
          const response = await fetch(processedImageSrc);
          blob = await response.blob();
        }
        
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
    } else if (onDownload) {
      onDownload();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800",
        className
      )}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generating word cloud...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (imageError || (!processedImageSrc && !isLoading)) {
    return (
      <div className={cn(
        "flex items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg",
        className
      )}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {imageError ? "Failed to load word cloud image" : "No word cloud to display"}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if no image source
  if (!processedImageSrc) {
    return null;
  }

  return (
    <>
      <div className={cn(
        "relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",
        className
      )}>
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        
        {/* Image */}
        <div className="relative">
          <Image
            src={processedImageSrc}
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
            unoptimized={processedImageSrc.startsWith('data:image/')}
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
              src={processedImageSrc}
              alt={alt}
              width={1200}
              height={900}
              className="max-w-full max-h-full object-contain"
              unoptimized={processedImageSrc.startsWith('data:image/')}
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