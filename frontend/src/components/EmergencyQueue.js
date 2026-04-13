import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Typography
    // Removed 'Box' from here
} from '@mui/material';

// --- THE TRANSLATOR: Fixes the "1" vs "Critical" bug ---
const getPriorityLabel = (priority) => {
    const numMap = { 5: 'CRITICAL', 4: 'HIGH', 3: 'MEDIUM', 2: 'LOW', 1: 'MINOR' };

    // If DB sends a number (1), return "MINOR"
    if (typeof priority === 'number') return numMap[priority] || 'MEDIUM';

    // If Simulation sends "Critical", ensure it's uppercase
    if (typeof priority === 'string') return priority.toUpperCase();

    return 'MEDIUM';
};

// --- THE STYLER: Assigns colors ---
const getPriorityColor = (label) => {
    switch (label) {
        case 'CRITICAL': return 'error';      // Red
        case 'HIGH':     return 'warning';    // Orange
        case 'MEDIUM':   return 'primary';    // Blue
        case 'LOW':      return 'success';    // Green
        default:         return 'default';    // Grey
    }
};

function EmergencyQueue({ requests = [], onDispatch }) {
    // Filter out completed items so the list doesn't get huge
    const activeRequests = requests.filter(r => r.status !== 'Completed');

    if (activeRequests.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9', border: '1px dashed #ccc' }}>
                <Typography variant="body1" color="text.secondary">
                    No active emergencies. System standing by.
                </Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: '100%', border: '1px solid #eee' }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }}>Priority</TableCell>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }}>Patient</TableCell>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }}>Location</TableCell>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }} align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {activeRequests.map((req) => {
                        const label = getPriorityLabel(req.priority || req.triage_score);
                        const color = getPriorityColor(label);

                        return (
                            <TableRow key={req.id} hover>
                                <TableCell>
                                    <Chip label={label} color={color} size="small" sx={{ fontWeight: 'bold', fontSize: '0.75rem', minWidth: 80 }} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold">{req.patient_name || "Unknown"}</Typography>
                                    <Typography variant="caption" color="text.secondary">{req.symptoms}</Typography>
                                </TableCell>
                                <TableCell>{req.location || req.location_landmark}</TableCell>
                                <TableCell>
                                    <Chip label={req.status} variant="outlined" size="small" color="primary" />
                                </TableCell>
                                <TableCell align="right">
                                    {req.status === 'Pending' && onDispatch && (
                                        <Button variant="contained" size="small" onClick={() => onDispatch(req.id)}>
                                            Dispatch
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default EmergencyQueue;