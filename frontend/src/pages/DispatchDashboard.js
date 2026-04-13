import React from 'react';
import { Typography, Button, Box, Grid, Paper } from '@mui/material';
import EmergencyQueue from '../components/EmergencyQueue';
import CompletedMissionsTable from '../components/CompletedMissionsTable';
import KpiCard from '../components/KpiCard';

function DispatchDashboard({
                               requests,
                               riders,
                               onDispatch,
                               handleGenerateAlert,
                               completedMissions,
                               showCompleted,
                               setShowCompleted
                           }) {
    // 1. Calculate Metrics
    const totalJobs = requests.filter(r => r.status !== 'Completed').length;
    const ongoingJobs = requests.filter(r => r.status === 'Dispatched' || r.status === 'Transporting to Hospital').length;
    const criticalJobs = requests.filter(r => (r.priority === 'Critical' || r.priority === 'High')).length;

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, height: 'calc(100vh - 100px)' }}>

            {/* ====== LEFT COLUMN (70%): OPERATIONS ====== */}
            <Box sx={{ flex: '1 1 70%', display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>

                {/* Header & Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="#192A56">
                        Active Operations ({totalJobs})
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleGenerateAlert}
                        sx={{ fontWeight: 'bold', boxShadow: 3 }}
                    >
                        + Simulate 911 Call
                    </Button>
                </Box>

                {/* SCROLLABLE QUEUE CONTAINER */}
                {/* The 'flex: 1' and 'overflowY: auto' ensures this box fills remaining space and scrolls internally */}
                <Paper elevation={3} sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 0, borderRadius: 2 }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#f8f9fa' }}>
                        <Typography variant="subtitle1" fontWeight="bold">Live Emergency Queue</Typography>
                    </Box>
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        <EmergencyQueue requests={requests} onDispatch={onDispatch} />
                    </Box>
                </Paper>

                {/* COMPLETED MISSIONS TOGGLE AREA */}
                <Box>
                    <Button
                        variant="outlined"
                        onClick={() => setShowCompleted(!showCompleted)}
                        sx={{ mb: 1, width: '100%', borderStyle: 'dashed' }}
                    >
                        {showCompleted ? '▲ Hide Mission History' : '▼ View Completed Missions Log'}
                    </Button>

                    {showCompleted && (
                        <Paper elevation={2} sx={{ p: 0, maxHeight: '250px', overflowY: 'auto', bgcolor: '#fff', border: '1px solid #eee' }}>
                            <CompletedMissionsTable completedMissions={completedMissions} />
                        </Paper>
                    )}
                </Box>
            </Box>

            {/* ====== RIGHT COLUMN (30%): METRICS ONLY ====== */}
            <Box sx={{ flex: '1 1 30%', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* KPI CARDS (Stacked) */}
                <KpiCard title="Active Queue" value={totalJobs} />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <KpiCard title="In Transit" value={ongoingJobs} color="primary.main" />
                    </Grid>
                    <Grid item xs={6}>
                        <KpiCard title="Critical" value={criticalJobs} color="error.main" />
                    </Grid>
                </Grid>

                {/* MAP PLACEHOLDER (Map Removed) */}
                <Paper sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #e0e0e0',
                    bgcolor: '#fafafa',
                    color: 'text.secondary',
                    borderRadius: 2,
                    p: 4
                }}>
                    <Box sx={{ textAlign: 'center', opacity: 0.6 }}>
                        <Typography variant="h3" sx={{ mb: 1 }}>🗺️</Typography>
                        <Typography variant="body1" fontWeight="bold">Map View Hidden</Typography>
                        <Typography variant="caption">
                            Switch to the main <b>Dashboard</b> tab<br/>to view live fleet tracking.
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default DispatchDashboard;