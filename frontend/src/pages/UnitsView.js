import React from 'react';
import { Typography, Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import KpiCard from '../components/KpiCard';
// MapDashboard removed

function UnitsView({ riders, allResponders }) {
    const totalUnits = allResponders.length;
    const engagedUnits = riders.length;
    const availableUnits = totalUnits - engagedUnits;

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
            {/* ====== MAIN CONTENT (LEFT) ====== */}
            <Box sx={{ flex: '1 1 70%' }}>
                <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Unit Roster
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: '75vh' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Unit ID</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Driver Name</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allResponders.map((unit) => {
                                // Check if this unit is currently in the 'riders' list (active)
                                const activeMission = riders.find(r => r.id === unit.id || r.responder_id === unit.id);
                                const status = activeMission ? activeMission.status : 'Available';

                                return (
                                    <TableRow key={unit.id} hover>
                                        <TableCell>{unit.id || unit.responder_id}</TableCell>
                                        <TableCell>{unit.type || unit.vehicle_type}</TableCell>
                                        <TableCell>{unit.name || unit.first_name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={status}
                                                color={status === 'Available' ? 'success' : 'warning'}
                                                size="small"
                                                variant={status === 'Available' ? 'outlined' : 'filled'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* ====== SIDEBAR (RIGHT) ====== */}
            <Box sx={{ flex: '1 1 30%', minWidth: 300 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12}><KpiCard title="Fleet Size" value={totalUnits} /></Grid>
                    <Grid item xs={6}><KpiCard title="Available" value={availableUnits} color="secondary.main" /></Grid>
                    <Grid item xs={6}><KpiCard title="Dispatched" value={engagedUnits} color="primary.main" /></Grid>
                </Grid>

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

export default UnitsView;