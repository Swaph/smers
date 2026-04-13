import React from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import MapDashboard from '../components/MapDashboard';

// --- HELPER 1: Fix "1" vs "Critical" (Consistency) ---
const getPriorityLabel = (priority) => {
    const p = Number(priority);
    const numMap = { 5: 'CRITICAL', 4: 'HIGH', 3: 'MEDIUM', 2: 'LOW', 1: 'MINOR' };
    if (!isNaN(p) && numMap[p]) return numMap[p];
    if (typeof priority === 'string') return priority.toUpperCase();
    return 'MEDIUM';
};

// --- HELPER 2: Color Logic ---
const getPriorityColor = (label) => {
    switch (label) {
        case 'CRITICAL': return 'error';
        case 'HIGH':     return 'warning';
        case 'MEDIUM':   return 'primary';
        case 'LOW':      return 'success';
        default:         return 'default';
    }
};

function MainDashboardView({ requests, riders, allResponders }) {

    // 1. MAP FILTER: Only show markers if patient is waiting on the ground.
    const mapMarkers = (requests || []).filter(r =>
        r.status === 'Pending' || r.status === 'Dispatched'
    );

    // 2. FEED FILTER: Show everything except completed history
    const liveFeed = (requests || []).filter(r => r.status !== 'Completed');

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', width: '100%', position: 'relative', overflow: 'hidden', borderRadius: 2 }}>

            {/* 1. Map Background */}
            <MapDashboard
                requests={mapMarkers}
                riders={riders}
                allResponders={allResponders}
                showEmergencies={true}
                showUnits={true}
            />

            {/* 2. Glassmorphism Overlay */}
            <Paper
                elevation={6}
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    left: 24,
                    right: 24,
                    maxHeight: '35%',
                    overflow: 'hidden',
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                    zIndex: 1200,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Box sx={{ p: 1.5, bgcolor: 'rgba(25, 42, 86, 0.95)', color: 'white' }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ animation: 'pulse 2s infinite' }}>🚨</span> Live Operations Feed
                    </Typography>
                </Box>

                <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: 'rgba(255,255,255,0.95)', fontWeight: 'bold' }}>Patient</TableCell>
                                <TableCell sx={{ bgcolor: 'rgba(255,255,255,0.95)', fontWeight: 'bold' }}>Priority</TableCell>
                                <TableCell sx={{ bgcolor: 'rgba(255,255,255,0.95)', fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ bgcolor: 'rgba(255,255,255,0.95)', fontWeight: 'bold' }}>Location</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {liveFeed.length > 0 ? (
                                liveFeed.map(job => {
                                    const label = getPriorityLabel(job.priority || job.triage_score);
                                    const color = getPriorityColor(label);

                                    return (
                                        <TableRow key={job.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>{job.patient_name}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={label}
                                                    color={color}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', fontSize: '0.7rem', height: 24 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#192A56' }}>
                                                    {job.status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{job.location || job.location_landmark || "Unknown"}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ fontStyle: 'italic', color: 'text.secondary', py: 3 }}>
                                        System Standby. No active alerts.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}

export default MainDashboardView;