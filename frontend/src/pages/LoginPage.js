//LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Paper, Link, Avatar, CssBaseline } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import medicalIllustration from '../assets/medical-illustration.jpg';

function LoginPage({ onLogin }) { // Receives onLogin prop
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (username === 'dispatcher' && password === 'pass') {
            onLogin('dispatcher'); // Update App.js state
            navigate('/app/dashboard');
        } else if (username === 'admin' && password === 'pass') {
            onLogin('admin'); // Update App.js state
            navigate('/app/admin');
        } else {
            setError('Invalid username or password. (Hint: dispatcher/pass or admin/pass)');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <CssBaseline />
            <Paper
                elevation={12}
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    width: { xs: '100%', sm: 800, md: 960 },
                    maxWidth: '1000px',
                    borderRadius: 4,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        width: { xs: '100%', md: '45%' },
                        p: { xs: 3, sm: 4, md: 6 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                                <HealthAndSafetyIcon />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                SMERS Login
                            </Typography>
                        </Box>
                        <Box component="form" noValidate onSubmit={handleLogin}>
                            <TextField fullWidth label="Username" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
                            <TextField fullWidth label="Password" margin="normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            {error && (
                                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                    {error}
                                </Typography>
                            )}
                            <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                                Sign In
                            </Button>
                            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                                Can't log in?{' '}
                                <Link href="#" underline="hover">
                                    Contact an administrator
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box
                    sx={{
                        width: { xs: '100%', md: '55%' },
                        display: { xs: 'none', md: 'block' },
                        backgroundImage: `url(${medicalIllustration})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                    }}
                />
            </Paper>
        </Box>
    );
}

export default LoginPage;