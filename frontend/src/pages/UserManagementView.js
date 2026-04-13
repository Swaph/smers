import React, { useState, useEffect } from 'react';
import {
    Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Paper, TextField, InputAdornment, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Avatar, IconButton, Chip, CircularProgress,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
    InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import {
    PeopleOutline,
    PersonAddAlt,
    Search,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import AddUserForm from './AddUserForm';

const API_URL = 'http://localhost:5000/api';

function UserManagementView() {
    const [view, setView] = useState('list');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchTerm, setSearchTerm] = useState("");

    // Edit Dialog State
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editError, setEditError] = useState(null);

    // --- FETCH USERS ---
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        fetch(`${API_URL}/users`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load users", err);
                setLoading(false);
            });
    };

    // --- HELPER: Get ID Safely ---
    // Fixes the issue where ID might be 'id' or 'user_id'
    const getUserId = (user) => user.id || user.user_id;

    // --- SEARCH LOGIC ---
    const filteredUsers = users.filter((user) => {
        const term = searchTerm.toLowerCase();
        const name = (user.full_name || user.name || '').toLowerCase();
        const email = (user.username || user.email || '').toLowerCase();
        const role = (user.role || '').toLowerCase();
        return name.includes(term) || email.includes(term) || role.includes(term);
    });

    // --- HANDLERS ---

    const handleUserAdd = (newUser) => {
        setUsers(prev => [...prev, newUser]);
        setView('list');
        // Ideally, re-fetch from server to get the real ID
        setTimeout(fetchUsers, 1000);
    };

    // --- DELETE HANDLER (FIXED) ---
    const handleDelete = async (user) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

        const id = getUserId(user);

        // 1. Optimistic Update (Remove from UI immediately)
        setUsers(prev => prev.filter(u => getUserId(u) !== id));

        try {
            console.log(`Deleting user with ID: ${id}`); // Debug Log

            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            console.log("Delete successful");

        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Failed to delete user on server. They may reappear on refresh.");
            // Revert UI change if failed
            fetchUsers();
        }
    };

    // --- EDIT HANDLER (FIXED) ---
    const handleEditClick = (user) => {
        setEditingUser({
            ...user,
            // Normalize fields for the FORM input
            name: user.full_name || user.name,
            email: user.email || user.username
        });
        setEditError(null);
        setOpenEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!editingUser.name || !editingUser.email) {
            setEditError("Name and Email are required.");
            return;
        }

        const id = getUserId(editingUser);

        // PREPARE PAYLOAD (Critical Fix)
        // We ensure we send 'full_name' if the DB expects it, based on what we received
        const payload = {
            ...editingUser,
            full_name: editingUser.name, // Explicitly map 'name' form field to 'full_name'
            username: editingUser.email  // Explicitly map 'email' form field to 'username' if needed
        };

        // 1. Optimistic Update
        setUsers(prev => prev.map(u => getUserId(u) === id ? { ...u, ...payload } : u));
        setOpenEditDialog(false);

        try {
            console.log(`Updating user ID: ${id}`, payload); // Debug Log

            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Update failed");
            }
            console.log("Update successful");

        } catch (err) {
            console.error("Error updating user:", err);
            alert(`Failed to save changes: ${err.message}`);
            // Revert changes if failed
            fetchUsers();
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* LEFT SIDEBAR */}
            <Paper elevation={2} sx={{ width: { xs: '100%', md: 240 }, p: 2, height: 'fit-content' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#192A56' }}>User Settings</Typography>
                <List component="nav">
                    <ListItem disablePadding>
                        <ListItemButton selected={view === 'list'} onClick={() => setView('list')}>
                            <ListItemIcon><PeopleOutline color={view === 'list' ? 'primary' : 'inherit'} /></ListItemIcon>
                            <ListItemText primary="Manage Users" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton selected={view === 'add'} onClick={() => setView('add')}>
                            <ListItemIcon><PersonAddAlt color={view === 'add' ? 'primary' : 'inherit'} /></ListItemIcon>
                            <ListItemText primary="Add New User" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Paper>

            {/* RIGHT CONTENT */}
            <Paper elevation={2} sx={{ flex: 1, p: 3 }}>
                {view === 'list' && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" fontWeight="bold" color="#192A56">Authorized Users</Typography>

                            <TextField
                                size="small"
                                placeholder="Search by name, email or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>), }}
                                sx={{ width: 300 }}
                            />
                        </Box>

                        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> : (
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                                        <TableRow>
                                            <TableCell><strong>User</strong></TableCell>
                                            <TableCell><strong>Role</strong></TableCell>
                                            <TableCell><strong>Username/Email</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                            <TableCell align="right"><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                    No users found matching "{searchTerm}"
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <TableRow key={getUserId(user)} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main', fontSize: 14 }}>
                                                                {(user.full_name || user.name || 'U').charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            {user.full_name || user.name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={(user.role || user.title || 'User').toUpperCase()}
                                                            size="small"
                                                            color={user.role === 'admin' ? 'primary' : 'default'}
                                                            variant={user.role === 'admin' ? 'filled' : 'outlined'}
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{user.username || user.email}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={user.status || "Active"}
                                                            color={user.status === 'Inactive' ? 'error' : 'success'}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>

                                                    <TableCell align="right">
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleEditClick(user)}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDelete(user)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
                )}

                {view === 'add' && (
                    <AddUserForm onUserAdd={handleUserAdd} onCancel={() => setView('list')} />
                )}
            </Paper>

            {/* EDIT DIALOG */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Edit User Details</DialogTitle>
                <DialogContent dividers>
                    {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}

                    {editingUser && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                value={editingUser.name || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            />
                            <TextField
                                label="Email / Username"
                                fullWidth
                                value={editingUser.email || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={editingUser.role || 'dispatcher'}
                                    label="Role"
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                >
                                    <MenuItem value="admin">Administrator</MenuItem>
                                    <MenuItem value="dispatcher">Dispatcher</MenuItem>
                                    <MenuItem value="auditor">Auditor</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={editingUser.status || 'Active'}
                                    label="Status"
                                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenEditDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default UserManagementView;