//AddUserForm.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Select, MenuItem, InputLabel, FormControl, Alert, CircularProgress } from '@mui/material';

function AddUserForm({ onUserAdd, onCancel }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Prepare data for Backend (Matches DB Schema)
        const userData = {
            full_name: `${firstName} ${lastName}`,
            username: username,
            role: role.toLowerCase() // Backend expects lowercase enum often
        };

        try {
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) throw new Error('Failed to create user');

            const newUser = await response.json();
            onUserAdd(newUser); // Callback to update parent list

        } catch (err) {
            console.error(err);
            setError("Error saving to database. Ensure Backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Create New User</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth label="First Name" margin="normal"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                />
                <TextField
                    fullWidth label="Last Name" margin="normal"
                    value={lastName} onChange={(e) => setLastName(e.target.value)} required
                />
                <TextField
                    fullWidth label="Username / Email" margin="normal"
                    value={username} onChange={(e) => setUsername(e.target.value)} required
                    helperText="This will be their login ID"
                />

                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Role</InputLabel>
                    <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                        <MenuItem value="dispatcher">Dispatcher</MenuItem>
                        <MenuItem value="admin">Administrator</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Create User"}
                    </Button>
                    <Button variant="outlined" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default AddUserForm;