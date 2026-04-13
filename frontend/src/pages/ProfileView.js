import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Avatar, List, ListItem,
    ListItemText, ListItemIcon, IconButton, TextField, Button,
    Divider, Menu, MenuItem, Switch, FormControlLabel, CircularProgress, Alert
} from '@mui/material';
import {
    PersonOutline, SettingsOutlined, NotificationsNoneOutlined,
    ExitToAppOutlined, KeyboardArrowRight, Close, LightModeOutlined,
    LanguageOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function ProfileView({ userProfile, onUpdateProfile, currentTheme, onToggleTheme }) {
    const navigate = useNavigate();
    const [openProfileDetails, setOpenProfileDetails] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [openNotificationsMenu, setOpenNotificationsMenu] = useState(null);
    const [notificationSetting, setNotificationSetting] = useState('Allow');
    const [language] = useState('Eng');

    // Loading/Error states
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Local state for editing
    const [editableName, setEditableName] = useState('');
    const [editableEmail, setEditableEmail] = useState('');
    const [editableMobile, setEditableMobile] = useState('');
    const [editableLocation, setEditableLocation] = useState('');

    // Sync local state if parent state changes
    useEffect(() => {
        if (userProfile) {
            setEditableName(userProfile.full_name || userProfile.name || '');
            setEditableEmail(userProfile.username || userProfile.email || '');
            setEditableMobile(userProfile.phone_number || userProfile.mobile || '');
            setEditableLocation(userProfile.location || '');
        }
    }, [userProfile]);

    const handleSaveProfileChanges = async () => {
        setError(null);
        setSaving(true);

        // Safety check for ID
        const userId = userProfile.id || userProfile.user_id;
        if (!userId) {
            setError("Cannot update: User ID is missing.");
            setSaving(false);
            return;
        }

        // Prepare Payload to match Database Columns
        const payload = {
            full_name: editableName,
            username: editableEmail,
            phone_number: editableMobile,
            location: editableLocation,
            role: userProfile.role || 'dispatcher', // Maintain existing role
            status: 'Active'
        };

        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const updatedUser = await response.json();

            // 1. Update Parent State (App.js) so UI updates immediately
            // We map back DB fields (full_name) to App fields (name) if necessary
            onUpdateProfile({
                ...updatedUser,
                name: updatedUser.full_name,
                email: updatedUser.username,
                mobile: updatedUser.phone_number,
                location: updatedUser.location
            });

            setOpenProfileDetails(false);
            alert("Profile updated successfully!");

        } catch (err) {
            console.error(err);
            setError("Failed to save changes to the server.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <Box
            sx={{
                p: 3,
                backgroundColor: 'background.default',
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                alignItems: 'flex-start',
            }}
        >
            {/* --- Main Profile Card (Left) --- */}
            <Card sx={{ width: 300, borderRadius: 3, boxShadow: 6 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                            {(userProfile?.name || userProfile?.full_name || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h6">{userProfile?.name || userProfile?.full_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {userProfile?.email || userProfile?.username}
                            </Typography>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <List disablePadding>
                        <ListItem button onClick={() => setOpenProfileDetails(true)}>
                            <ListItemIcon><PersonOutline /></ListItemIcon>
                            <ListItemText primary="My Profile" />
                            <KeyboardArrowRight />
                        </ListItem>
                        <ListItem button onClick={() => setOpenSettings(true)}>
                            <ListItemIcon><SettingsOutlined /></ListItemIcon>
                            <ListItemText primary="Settings" />
                            <KeyboardArrowRight />
                        </ListItem>
                        <ListItem
                            button
                            onClick={(event) => setOpenNotificationsMenu(event.currentTarget)}
                        >
                            <ListItemIcon><NotificationsNoneOutlined /></ListItemIcon>
                            <ListItemText primary="Notification" />
                            <Typography variant="body2" color="text.secondary">{notificationSetting}</Typography>
                            <KeyboardArrowRight />
                        </ListItem>
                        <Menu
                            anchorEl={openNotificationsMenu}
                            open={Boolean(openNotificationsMenu)}
                            onClose={() => setOpenNotificationsMenu(null)}
                            PaperProps={{ sx: { borderRadius: 2, boxShadow: 3 } }}
                        >
                            <MenuItem onClick={() => { setNotificationSetting('Allow'); setOpenNotificationsMenu(null); }}>Allow</MenuItem>
                            <MenuItem onClick={() => { setNotificationSetting('Mute'); setOpenNotificationsMenu(null); }}>Mute</MenuItem>
                        </Menu>
                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon><ExitToAppOutlined /></ListItemIcon>
                            <ListItemText primary="Log Out" />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* --- Profile Details Card (Right) --- */}
            {openProfileDetails && (
                <Card sx={{ width: { xs: '100%', sm: 450 }, borderRadius: 3, boxShadow: 6 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Edit Profile</Typography>
                            <IconButton onClick={() => setOpenProfileDetails(false)} size="small">
                                <Close />
                            </IconButton>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Divider sx={{ my: 2 }} />

                        <TextField fullWidth label="Full Name" value={editableName} onChange={(e) => setEditableName(e.target.value)} margin="normal" variant="outlined" />
                        <TextField fullWidth label="Email / Username" value={editableEmail} onChange={(e) => setEditableEmail(e.target.value)} margin="normal" variant="outlined" />
                        <TextField fullWidth label="Mobile Number" value={editableMobile} onChange={(e) => setEditableMobile(e.target.value)} margin="normal" variant="outlined" />
                        <TextField fullWidth label="Location" value={editableLocation} onChange={(e) => setEditableLocation(e.target.value)} margin="normal" variant="outlined" />

                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3 }}
                            onClick={handleSaveProfileChanges}
                            disabled={saving}
                        >
                            {saving ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* --- Settings Card (Right/Bottom) --- */}
            {openSettings && (
                <Card sx={{ width: 300, borderRadius: 3, boxShadow: 6 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Settings</Typography>
                            <IconButton onClick={() => setOpenSettings(false)} size="small">
                                <Close />
                            </IconButton>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <List disablePadding>
                            <ListItem>
                                <ListItemIcon><LightModeOutlined /></ListItemIcon>
                                <ListItemText primary="Theme" />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={currentTheme === 'dark'}
                                            onChange={onToggleTheme}
                                        />
                                    }
                                    label={currentTheme === 'light' ? 'Light' : 'Dark'}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><LanguageOutlined /></ListItemIcon>
                                <ListItemText primary="Language" />
                                <Typography variant="body2" color="text.secondary">{language}</Typography>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default ProfileView;