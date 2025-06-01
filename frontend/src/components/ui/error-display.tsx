"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, X, Info, AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  type?: "error" | "warning" | "info";
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  retryLabel?: string;
  dismissible?: boolean;
}

export function ErrorDisplay({
  title,
  message,
  type = "error",
  onRetry,
  onDismiss,
  className,
  retryLabel = "Try Again",
  dismissible = true,
}: ErrorDisplayProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "warning":
        return {
          container: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
          icon: "text-yellow-600 dark:text-yellow-400",
          title: "text-yellow-800 dark:text-yellow-200",
          message: "text-yellow-700 dark:text-yellow-300",
          button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
        };
      case "info":
        return {
          container: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
          title: "text-blue-800 dark:text-blue-200",
          message: "text-blue-700 dark:text-blue-300",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        };
      default:
        return {
          container: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          title: "text-red-800 dark:text-red-200",
          message: "text-red-700 dark:text-red-300",
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={cn(
      "rounded-lg border p-4",
      styles.container,
      className
    )}>
      <div className="flex items-start">
        <div className={cn("flex-shrink-0", styles.icon)}>
          {getIcon()}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn("text-sm font-medium", styles.title)}>
              {title}
            </h3>
          )}
          <div className={cn(
            "text-sm",
            title ? "mt-1" : "",
            styles.message
          )}>
            <p>{message}</p>
          </div>
          
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className={cn(
                  "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
                  styles.button
                )}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryLabel}
              </button>
            </div>
          )}
        </div>
        
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={cn(
                  "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
                  styles.icon,
                  "hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10"
                )}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact error component for inline use
export function InlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm",
      className
    )}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Success message component
export function SuccessDisplay({
  title,
  message,
  onDismiss,
  className,
  dismissible = true,
}: {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
  dismissible?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-lg border p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-green-600 dark:text-green-400">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              {title}
            </h3>
          )}
          <div className={cn(
            "text-sm text-green-700 dark:text-green-300",
            title ? "mt-1" : ""
          )}>
            <p>{message}</p>
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex rounded-md p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}