import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';

// Fallback rate if simulation doesn't provide one
const DEFAULT_RATE = 2500;

function PaymentView({ completedMissions = [], allResponders = [] }) {
    const [dbPayments, setDbPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- HELPER 1: Normalize Database Data

    const normalizePaymentData = (data) => {
        return data.map(item => ({
            ...item,
            // Postgres returns keys in lowercase (amount_kes). We check that first.
            amount_final: parseFloat(item.amount_kes || item.amount_KES || item.amount || 0),

            // Map SQL 'first_name' to our display name
            responder_final: item.first_name || item.responder_name || `Unit ${item.responder_id}`,

            // Map SQL 'phone_number'
            phone_final: item.phone_number || item.phone || 'N/A'
        }));
    };

    // --- HELPER 2: Look up Names for Live Data ---
    //
    const getLiveResponderDetails = (id) => {
        // Ensure we compare strings to avoid type mismatches (47 vs "47")
        const responder = allResponders.find(r => String(r.id) === String(id));

        return {
            // The DB/App uses 'first_name', but we check 'name' just in case
            name: responder ? (responder.first_name || responder.name) : `Unit ${id}`,
            phone: responder ? (responder.phone_number || responder.phone) : '07XX-XXX-XXX'
        };
    };

    // --- EFFECT: Fetch Historical Data ---
    useEffect(() => {
        fetch('http://localhost:5000/api/payments')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch payments');
                return res.json();
            })
            .then(data => {
                // Normalize data immediately to fix 0 amounts
                setDbPayments(normalizePaymentData(data));
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching payments:", err);
                setError("Could not load historical records. Showing live session data only.");
                setLoading(false);
            });
    }, []);

    // --- GENERATE LIVE ROW DATA ---
    const pendingPayments = completedMissions.map((mission, index) => {
        const details = getLiveResponderDetails(mission.assigned_responder);
        return {
            payment_id: `pending-${mission.id || index}`,
            transaction_date: new Date().toISOString(),
            responder_final: details.name,
            phone_final: details.phone,
            // Use the cost calculated in App.js (450), otherwise default
            amount_final: mission.cost || DEFAULT_RATE,
            status: 'Pending'
        };
    });

    // Combine Live (Pending) + DB (Confirmed)
    const allTransactions = [...pendingPayments, ...dbPayments];

    if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#192A56' }}>
                M-Pesa Disbursement Log
            </Typography>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={2} sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                    <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                        <TableRow>
                            <TableCell><strong>Transaction Date</strong></TableCell>
                            <TableCell><strong>Responder</strong></TableCell>
                            <TableCell><strong>Phone Number</strong></TableCell>
                            <TableCell><strong>Amount (KES)</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3, fontStyle: 'italic' }}>
                                    No payments recorded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            allTransactions.map((p) => (
                                <TableRow key={p.payment_id} hover>
                                    <TableCell>
                                        {p.transaction_date ? new Date(p.transaction_date).toLocaleString() : 'Just Now'}
                                    </TableCell>

                                    {/* Name (Mapped from ID) */}
                                    <TableCell>{p.responder_final}</TableCell>

                                    {/* Phone (Mapped from ID) */}
                                    <TableCell>{p.phone_final}</TableCell>

                                    {/* Amount (Normalized Float) */}
                                    <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                        {p.amount_final.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <Chip
                                            label={p.status}
                                            color={
                                                p.status === 'Confirmed' || p.status === 'Paid' ? 'success' :
                                                    p.status === 'Pending' ? 'warning' : 'default'
                                            }
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default PaymentView;