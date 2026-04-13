import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    Typography
} from '@mui/material';

function EmergencyTable({ requests = [], onDispatch }) {

    const activeRequests = requests.filter(r => r.status !== 'Completed');

    if (activeRequests.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                <Typography variant="body1" color="text.secondary">
                    No active emergencies. System standing by.
                </Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 450, mt: 2, boxShadow: 2 }}>
            <Table stickyHeader size="small" aria-label="emergency table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }}>Priority</TableCell>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }}>Patient Details</TableCell>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }}>Location</TableCell>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ bgcolor: '#f4f6f8', fontWeight: 'bold' }} align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {activeRequests.map((req) => {
                        const p = req.priority || req.triage_score;
                        let color = 'success';
                        let label = 'MEDIUM';

                        if (typeof p === 'number') {
                            if (p >= 5) { color = 'error'; label = 'CRITICAL'; }
                            else if (p === 4) { color = 'warning'; label = 'HIGH'; }
                        } else if (typeof p === 'string') {
                            if (p.toUpperCase() === 'CRITICAL') { color = 'error'; label = 'CRITICAL'; }
                            else if (p.toUpperCase() === 'HIGH') { color = 'warning'; label = 'HIGH'; }
                        }

                        return (
                            <TableRow key={req.id} hover>
                                <TableCell>
                                    <Chip
                                        label={label}
                                        color={color}
                                        size="small"
                                        sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {req.patient_name || "Unknown Patient"}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        {req.symptoms || req.patient_condition}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {req.location || req.location_landmark || "GPS Location"}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={req.status}
                                        variant="outlined"
                                        size="small"
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {req.status === 'Pending' && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            onClick={() => onDispatch(req.id)}
                                            sx={{ textTransform: 'none' }}
                                        >
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

export default EmergencyTable;