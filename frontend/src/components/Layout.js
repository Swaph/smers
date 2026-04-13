import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppBar, Box, Toolbar, Typography, Tabs, Tab, Avatar, Fab, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const pulseAnimation = {
    '@keyframes pulse': {
        '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.7)' },
        '70%': { boxShadow: '0 0 0 15px rgba(211, 47, 47, 0)' },
        '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' },
    },
};

function Layout({ newCallAlert, clearCallAlert }) {
    const navigate = useNavigate();
    const location = useLocation();

    const currentTab = location.pathname.split('/')[3] || 'dashboard';

    const handleTabChange = (event, newValue) => {
        const path = newValue === 'dashboard' ? '/app/dashboard' : `/app/dashboard/${newValue}`;
        navigate(path);
    };

    const handleNewTriageClick = () => {
        clearCallAlert();
        navigate('/app/triage-form');
    };

    const handleProfileClick = () => {
        navigate('/app/dashboard/profile');
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <HealthAndSafetyIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        SMERS Dispatch
                    </Typography>
                    <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary">
                        <Tab label="Dashboard" value="dashboard" />
                        <Tab label="Jobs" value="jobs" />
                        <Tab label="Units" value="units" />
                    </Tabs>
                    <IconButton onClick={handleProfileClick} sx={{ ml: 2 }}>
                        <Avatar sx={{ bgcolor: 'error.main' }}>D</Avatar>
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Outlet />
            </Box>

            <Fab
                color="error"
                aria-label="add"
                onClick={handleNewTriageClick}
                sx={{
                    position: 'fixed',
                    bottom: 40,
                    right: 40,
                    animation: newCallAlert ? 'pulse 2s infinite' : 'none',
                    ...pulseAnimation,
                }}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
}

export default Layout;