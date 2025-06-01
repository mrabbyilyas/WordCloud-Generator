"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info" | "loading";

interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? (notification.type === "loading" ? 0 : 5000),
      persistent: notification.persistent ?? false,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (unless persistent or loading)
    if (newNotification.duration && newNotification.duration > 0 && !newNotification.persistent && newNotification.type !== "loading") {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(onRemove, 300); // Wait for exit animation
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case "success":
        return {
          container: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
          icon: "text-green-600 dark:text-green-400",
          title: "text-green-800 dark:text-green-200",
          message: "text-green-700 dark:text-green-300",
        };
      case "error":
        return {
          container: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          title: "text-red-800 dark:text-red-200",
          message: "text-red-700 dark:text-red-300",
        };
      case "warning":
        return {
          container: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
          icon: "text-yellow-600 dark:text-yellow-400",
          title: "text-yellow-800 dark:text-yellow-200",
          message: "text-yellow-700 dark:text-yellow-300",
        };
      case "info":
        return {
          container: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
          title: "text-blue-800 dark:text-blue-200",
          message: "text-blue-700 dark:text-blue-300",
        };
      case "loading":
        return {
          container: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
          icon: "text-gray-600 dark:text-gray-400",
          title: "text-gray-800 dark:text-gray-200",
          message: "text-gray-700 dark:text-gray-300",
        };
      default:
        return {
          container: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          icon: "text-gray-600 dark:text-gray-400",
          title: "text-gray-800 dark:text-gray-200",
          message: "text-gray-700 dark:text-gray-300",
        };
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-in-out",
        isVisible && !isRemoving
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95",
        "rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        styles.container
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className={cn("text-sm font-medium", styles.title)}>
              {notification.title}
            </h4>
          )}
          <p className={cn(
            "text-sm",
            notification.title ? "mt-1" : "",
            styles.message
          )}>
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={cn(
                "mt-2 text-sm font-medium underline hover:no-underline transition-colors",
                styles.title
              )}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        {notification.type !== "loading" && (
          <button
            onClick={handleRemove}
            className={cn(
              "flex-shrink-0 rounded-md p-1.5 transition-colors hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10",
              styles.icon
            )}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Convenience hooks for different notification types
export function useNotificationHelpers() {
  const { addNotification, removeNotification } = useNotifications();

  return {
    success: (message: string, options?: Partial<Omit<Notification, "id" | "type" | "message">>) =>
      addNotification({ type: "success", message, ...options }),
    
    error: (message: string, options?: Partial<Omit<Notification, "id" | "type" | "message">>) =>
      addNotification({ type: "error", message, ...options }),
    
    warning: (message: string, options?: Partial<Omit<Notification, "id" | "type" | "message">>) =>
      addNotification({ type: "warning", message, ...options }),
    
    info: (message: string, options?: Partial<Omit<Notification, "id" | "type" | "message">>) =>
      addNotification({ type: "info", message, ...options }),
    
    loading: (message: string, options?: Partial<Omit<Notification, "id" | "type" | "message">>) =>
      addNotification({ type: "loading", message, persistent: true, ...options }),
    
    remove: removeNotification,
  };
}

// Status Banner Component for full-width status messages
export function StatusBanner({
  type,
  title,
  message,
  onDismiss,
  action,
  className,
}: {
  type: NotificationType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
          icon: "text-green-600 dark:text-green-400",
          title: "text-green-800 dark:text-green-200",
          message: "text-green-700 dark:text-green-300",
          button: "text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800",
        };
      case "error":
        return {
          container: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          title: "text-red-800 dark:text-red-200",
          message: "text-red-700 dark:text-red-300",
          button: "text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800",
        };
      case "warning":
        return {
          container: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
          icon: "text-yellow-600 dark:text-yellow-400",
          title: "text-yellow-800 dark:text-yellow-200",
          message: "text-yellow-700 dark:text-yellow-300",
          button: "text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-800",
        };
      case "info":
        return {
          container: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
          title: "text-blue-800 dark:text-blue-200",
          message: "text-blue-700 dark:text-blue-300",
          button: "text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800",
        };
      case "loading":
        return {
          container: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
          icon: "text-gray-600 dark:text-gray-400",
          title: "text-gray-800 dark:text-gray-200",
          message: "text-gray-700 dark:text-gray-300",
          button: "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
        };
      default:
        return {
          container: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          icon: "text-gray-600 dark:text-gray-400",
          title: "text-gray-800 dark:text-gray-200",
          message: "text-gray-700 dark:text-gray-300",
          button: "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      default:
        return <Info className="h-5 w-5" />;
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
          
          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  styles.button
                )}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={cn(
                "inline-flex rounded-md p-1.5 transition-colors",
                styles.icon,
                "hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10"
              )}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}