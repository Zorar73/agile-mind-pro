import React, { useState, useEffect, useContext } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Fab } from '@mui/material';
import { Menu as MenuIcon, BugReport } from '@mui/icons-material';
import Sidebar from './Sidebar';
import { UserContext } from '../../App';
import boardService from '../../services/board.service';
import NotificationCenter from '../Notifications/NotificationCenter';
import DebugConsole from '../DebugConsole';

const DRAWER_WIDTH = 260;

function MainLayout({ children, title, showAppBar = true }) {
  const { user } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [boards, setBoards] = useState([]);
  const [debugOpen, setDebugOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = boardService.subscribeToUserBoards(user.uid, (userBoards) => {
      setBoards(userBoards);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(!sidebarOpen)}
        boards={boards}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 64}px)` },
          transition: 'width 0.2s',
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        {showAppBar && (
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              
              {title && (
                <Typography variant="h6" noWrap component="div" fontWeight={600} sx={{ flexGrow: 1 }}>
                  {title}
                </Typography>
              )}

              <NotificationCenter />
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>

      {/* Debug Console FAB - плавающая кнопка */}
      <Fab
        color="error"
        size="small"
        sx={{
          position: 'fixed',
          bottom: 88, // Поднят над кнопкой "+"
          right: 24,
          zIndex: 2000,
          boxShadow: 3,
        }}
        onClick={() => setDebugOpen(true)}
        title="Открыть консоль отладки"
      >
        <BugReport fontSize="small" />
      </Fab>

      {/* Debug Console Drawer */}
      <DebugConsole open={debugOpen} onClose={() => setDebugOpen(false)} />
    </Box>
  );
}

export default MainLayout;
