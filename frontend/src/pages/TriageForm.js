//TriageForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Container, Paper, CssBaseline, Chip, CircularProgress, Alert } from '@mui/material';

// Helper for suggestions
const assignPriority = (symptoms) => {
    const s = (symptoms || '').toLowerCase();
    if (s.includes('bleeding') || s.includes('unconscious') || s.includes('seizure')) return { level: 'CRITICAL', score: 5, color: 'error' };
    if (s.includes('labour') || s.includes('water broke')) return { level: 'HIGH', score: 4, color: 'warning' };
    return { level: 'MEDIUM', score: 3, color: 'info' };
};

function TriageForm({ addRequest }) { // addRequest is the function from App.js that syncs state
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [location, setLocation] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [priority, setPriority] = useState({ level: 'MEDIUM', score: 3, color: 'info' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isValidKenyanPhone = (value) => /^(?:\+254|0)7\d{8}$/.test((value || '').trim());

    useEffect(() => {
        setPriority(assignPriority(symptoms));
    }, [symptoms]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!isValidKenyanPhone(contactNumber)) {
            setError("Use a valid Kenyan mobile number, e.g. 07XXXXXXXX or +2547XXXXXXXX.");
            setLoading(false);
            return;
        }

        // Generate Nanyuki-area coordinate jitter for simulation realism
        const lat = 0.0166 + (Math.random() - 0.5) * 0.03;
        const lon = 37.0741 + (Math.random() - 0.5) * 0.03;

        // Construct object for DB (matching schema)

        const newRequest = {
            id: Date.now(), // Temp ID
            priority: priority.level,
            status: 'Pending',
            symptoms: symptoms,
            location: location,
            patient_name: `${firstName} ${lastName}`,
            contact_number: contactNumber,
            assigned_responder: null,
            created_at: new Date().toISOString(),
            position: [lat, lon],
        };

        try {
            await addRequest(newRequest); // Pass to App.js to handle API + State
            navigate('/app/dashboard/jobs');
        } catch (err) {
            console.error(err);
            setError("Failed to create alert.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />
            <Paper elevation={3} sx={{ mt: 4, p: 4, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                    New Emergency Triage
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField fullWidth label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        <TextField fullWidth label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </Box>
                    <TextField fullWidth label="Location Landmark" value={location} onChange={(e) => setLocation(e.target.value)} required margin="normal"/>
                    <TextField fullWidth label="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required margin="normal" type="tel" />
                    <TextField
                        fullWidth
                        label="Symptoms"
                        margin="normal"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        required
                        multiline
                        rows={3}
                        helperText="Priority is calculated automatically based on keywords."
                    />

                    <Box sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                        <Typography variant="subtitle2">AI Assessment:</Typography>
                        <Chip label={priority.level} color={priority.color} />
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="error"
                        size="large"
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Dispatch Alert"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default TriageForm;