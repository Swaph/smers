import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Typography, Box, CircularProgress } from '@mui/material';

function CompletedMissionsTable({ completedMissions: propMissions }) {
    // State to hold the data fetched from the DB
    const [dbMissions, setDbMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch from Database on Mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // REPLACE with your actual backend endpoint
                const response = await fetch('http://localhost:5000/missions/completed');

                if (response.ok) {
                    const data = await response.json();
                    setDbMissions(data);
                } else {
                    console.error("Failed to fetch mission history");
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        if (propMissions && propMissions.length > 0) {
            setDbMissions(propMissions);
            setLoading(false);
        } else {
            fetchHistory();
        }
    }, [propMissions]);

    // 2. Loading State
    if (loading) {
        return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>;
    }

    // 3. Empty State Handling
    if (!dbMissions || dbMissions.length === 0) {
        return (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', bgcolor: '#fafafa', borderRadius: 1 }}>
                <Typography variant="body2" fontStyle="italic">
                    No completed missions found in the records.
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', maxHeight: 400 }}>
            <Table size="small" stickyHeader aria-label="completed missions table">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Patient</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Condition</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Responder</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dbMissions.map((mission) => (
                        <TableRow key={mission.id || Math.random()} hover>
                            {/* Patient Name */}
                            <TableCell>{mission.patient_name || "Unknown"}</TableCell>

                            {/* Condition / Symptoms */}
                            <TableCell>
                                <Typography variant="caption" sx={{ display: 'block', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {mission.symptoms || mission.patient_condition || "N/A"}
                                </Typography>
                            </TableCell>

                            {/* Responder ID/Name */}
                            <TableCell>
                                {mission.assigned_responder ? `Unit ${mission.assigned_responder}` : 'Unassigned'}
                            </TableCell>

                            {/* Status Chip */}
                            <TableCell>
                                <Chip
                                    label={mission.status || "Completed"}
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default CompletedMissionsTable;