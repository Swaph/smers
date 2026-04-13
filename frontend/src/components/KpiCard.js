import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

function KpiCard({ title, value, color = 'primary.main' }) {
    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                textAlign: 'left', // Align text to left for a cleaner look
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s', // Smooth animation
                '&:hover': {
                    transform: 'translateY(-4px)', // Lifts up slightly on hover
                    boxShadow: 6, // Increases shadow intensity
                },
                // The colored accent bar on the left
                borderLeft: '6px solid',
                borderLeftColor: color,
            }}
        >
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                {title}
            </Typography>
        </Paper>
    );
}

export default KpiCard;