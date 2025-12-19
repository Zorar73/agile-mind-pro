// src/components/Common/AIProcessingOverlay.jsx
// AI Processing visualization with progress and animation

import React from "react";
import {
  Backdrop,
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Fade,
  keyframes,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Pulsing animation for AI icon
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

// Glowing animation
const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(102, 126, 234, 0.8);
  }
`;

const AIIcon = styled(AutoAwesome)(({ theme }) => ({
  fontSize: 48,
  color: theme.palette.primary.main,
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const GlowBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: theme.palette.mode === "dark"
    ? "rgba(30, 30, 30, 0.95)"
    : "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  animation: `${glow} 2s ease-in-out infinite`,
  minWidth: 320,
  textAlign: "center",
}));

/**
 * AIProcessingOverlay Component
 *
 * @param {boolean} open - Show/hide overlay
 * @param {string} message - Status message (e.g., "Analyzing text...")
 * @param {number} progress - Progress percentage (0-100), null for indeterminate
 * @param {string} variant - "linear" or "circular" progress indicator
 */
function AIProcessingOverlay({
  open = false,
  message = "AI обрабатывает...",
  progress = null,
  variant = "linear"
}) {
  const hasProgress = progress !== null && progress !== undefined;

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
    >
      <Fade in={open} timeout={300}>
        <GlowBox>
          {/* AI Icon */}
          <Box sx={{ mb: 2 }}>
            <AIIcon />
          </Box>

          {/* Status Message */}
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 500,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {message}
          </Typography>

          {/* Progress Indicator */}
          {variant === "linear" ? (
            <Box sx={{ width: "100%", mb: hasProgress ? 1 : 0 }}>
              <LinearProgress
                variant={hasProgress ? "determinate" : "indeterminate"}
                value={hasProgress ? progress : undefined}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(102, 126, 234, 0.2)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              />
            </Box>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <CircularProgress
                variant={hasProgress ? "determinate" : "indeterminate"}
                value={hasProgress ? progress : undefined}
                size={60}
                thickness={4}
                sx={{
                  color: "#667eea",
                }}
              />
            </Box>
          )}

          {/* Progress Percentage */}
          {hasProgress && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {Math.round(progress)}%
            </Typography>
          )}

          {/* Hint Text */}
          {!hasProgress && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Это может занять несколько секунд...
            </Typography>
          )}
        </GlowBox>
      </Fade>
    </Backdrop>
  );
}

export default AIProcessingOverlay;
