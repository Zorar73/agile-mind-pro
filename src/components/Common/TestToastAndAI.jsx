// src/components/Common/TestToastAndAI.jsx
// Test component for Toast notifications and AI Processing Overlay

import React, { useState } from "react";
import { Box, Button, Typography, Paper, Grid, Divider } from "@mui/material";
import { useToast } from "../../contexts/ToastContext";
import AIProcessingOverlay from "./AIProcessingOverlay";
import {
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  AutoAwesome,
} from "@mui/icons-material";

function TestToastAndAI() {
  const toast = useToast();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiMessage, setAiMessage] = useState("AI обрабатывает...");

  // Test AI Processing with progress simulation
  const testAIProcessing = () => {
    setAiOpen(true);
    setAiProgress(0);
    setAiMessage("Анализирую текст задачи...");

    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAiMessage("Генерация завершена!");
          setTimeout(() => {
            setAiOpen(false);
            toast.success("AI успешно сгенерировал 3 задачи!");
          }, 1000);
          return 100;
        }

        // Update message based on progress
        if (prev >= 30 && prev < 60) {
          setAiMessage("Генерирую задачи...");
        } else if (prev >= 60 && prev < 90) {
          setAiMessage("Добавляю теги и приоритеты...");
        } else if (prev >= 90) {
          setAiMessage("Почти готово...");
        }

        return prev + 5;
      });
    }, 200);
  };

  // Test AI Processing without progress (indeterminate)
  const testAIIndeterminate = () => {
    setAiOpen(true);
    setAiMessage("Генерирую изображение...");
    setAiProgress(null);

    setTimeout(() => {
      setAiOpen(false);
      toast.success("Изображение сгенерировано!", {
        title: "Успешно",
      });
    }, 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          🧪 Тестирование новых компонентов
        </Typography>

        {/* Toast Notifications Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Info color="primary" /> Toast Уведомления
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Нажми на кнопки, чтобы увидеть уведомления в правом верхнем углу
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => toast.success("Операция выполнена успешно!")}
              >
                Success
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={<ErrorIcon />}
                onClick={() => toast.error("Произошла ошибка при сохранении")}
              >
                Error
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                startIcon={<Warning />}
                onClick={() => toast.warning("Проверьте введенные данные")}
              >
                Warning
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="info"
                startIcon={<Info />}
                onClick={() => toast.info("Это информационное сообщение")}
              >
                Info
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  toast.success("Задача создана успешно!", {
                    title: "Отлично!",
                    duration: 6000,
                    action: (
                      <Button size="small" color="inherit">
                        Открыть
                      </Button>
                    ),
                  })
                }
              >
                Toast с заголовком и действием
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  toast.info("Первое уведомление");
                  setTimeout(() => toast.success("Второе уведомление"), 500);
                  setTimeout(() => toast.warning("Третье уведомление"), 1000);
                }}
              >
                Несколько уведомлений сразу (Stack)
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* AI Processing Overlay Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesome sx={{ color: "#667eea" }} /> AI Processing Overlay
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Визуализация обработки AI запросов с прогресс-баром и анимацией
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #65408d 100%)",
                  },
                }}
                startIcon={<AutoAwesome />}
                onClick={testAIProcessing}
              >
                AI с прогрессом (Linear)
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: "#667eea",
                  color: "#667eea",
                  "&:hover": {
                    borderColor: "#764ba2",
                    backgroundColor: "rgba(102, 126, 234, 0.05)",
                  },
                }}
                startIcon={<AutoAwesome />}
                onClick={testAIIndeterminate}
              >
                AI без прогресса (Indeterminate)
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Подсказка:</strong> AI Processing Overlay блокирует взаимодействие
              с интерфейсом пока идёт обработка. Используется для генерации задач,
              изображений, анализа текста и других AI операций.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* AI Processing Overlay */}
      <AIProcessingOverlay
        open={aiOpen}
        message={aiMessage}
        progress={aiProgress}
        variant="linear"
      />
    </Box>
  );
}

export default TestToastAndAI;
