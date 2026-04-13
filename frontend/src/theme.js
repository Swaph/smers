import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#192A56',
        },
        secondary: {
            main: '#4CAF50',
        },
        error: {
            main: '#D32F2F',
        },
        background: {
            default: '#F4F6F8',
        },
    },
    // --- THIS IS THE UPDATE ---
    typography: {
        // Tell MUI to use the "Inter" font for all text
        fontFamily: [
            'Inter',
            'sans-serif',
        ].join(','),
        h4: {
            fontWeight: 700, // Make h4 bold
        },
        h5: {
            fontWeight: 700, // Make h5 bold
        }
    },
});

export default theme;