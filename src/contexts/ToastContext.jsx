// src/contexts/ToastContext.jsx
// Global Toast notification system

import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, AlertTitle, IconButton, Box } from "@mui/material";
import { Close, CheckCircle, Error, Warning, Info } from "@mui/icons-material";
import soundNotifications from "../utils/soundNotifications";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

const TOAST_DURATION = 4000; // 4 seconds

const iconMap = {
  success: CheckCircle,
  error: Error,
  warning: Warning,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const {
      severity = "info",
      title = null,
      duration = TOAST_DURATION,
      action = null,
    } = options;

    const id = Date.now() + Math.random();

    const toast = {
      id,
      message,
      severity,
      title,
      duration,
      action,
      open: true,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        handleClose(id);
      }, duration);
    }

    return id;
  }, []);

  const handleClose = useCallback((id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast
      )
    );

    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  }, []);

  // Convenience methods
  const success = useCallback(
    (message, options = {}) => {
      soundNotifications.success();
      return showToast(message, { ...options, severity: "success" });
    },
    [showToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      soundNotifications.error();
      return showToast(message, { ...options, severity: "error", duration: 6000 });
    },
    [showToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      soundNotifications.warning();
      return showToast(message, { ...options, severity: "warning" });
    },
    [showToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      soundNotifications.info();
      return showToast(message, { ...options, severity: "info" });
    },
    [showToast]
  );

  const value = {
    showToast,
    success,
    error,
    warning,
    info,
    close: handleClose,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Render all active toasts */}
      <Box
        sx={{
          position: "fixed",
          top: 80,
          right: 16,
          zIndex: (theme) => theme.zIndex.snackbar,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxWidth: 400,
        }}
      >
        {toasts.map((toast) => (
          <Snackbar
            key={toast.id}
            open={toast.open}
            autoHideDuration={null} // We handle duration manually
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{
              position: "relative",
              top: 0,
              right: 0,
              transform: "none",
            }}
          >
            <Alert
              severity={toast.severity}
              icon={React.createElement(iconMap[toast.severity], {
                fontSize: "small",
              })}
              action={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {toast.action}
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={() => handleClose(toast.id)}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{
                width: "100%",
                boxShadow: 3,
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              {toast.title && (
                <AlertTitle sx={{ fontWeight: 600 }}>{toast.title}</AlertTitle>
              )}
              {toast.message}
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </ToastContext.Provider>
  );
}

export default ToastContext;
