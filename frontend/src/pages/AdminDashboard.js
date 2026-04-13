//AdminDashboard.js
import React, { useState } from 'react';
import { Typography, Box, Grid, Tabs, Tab } from '@mui/material';
import KpiCard from '../components/KpiCard';
import EmergencyQueue from '../components/EmergencyQueue';
import CompletedMissionsTable from '../components/CompletedMissionsTable';
import PaymentView from './PaymentView';
import UserManagementView from './UserManagementView';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function AdminDashboard({ requests = [], completedMissions = [], allResponders = [] }) {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // Analytics calculated from Live Data
    const totalRequests = requests.length + (completedMissions.length || 0);
    const totalUnits = allResponders.length;
    const openCases = requests.filter(r => r.status !== 'Completed').length;

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>

            {/* Main Content Area */}
            <Box sx={{ flex: '1 1 70%' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#192A56' }}>
                    Administrator Oversight
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label="Open Cases" />
                        <Tab label="Completed Missions" />
                        <Tab label="Financials" />
                        <Tab label="Users" />
                    </Tabs>
                </Box>

                {/* Tab 0: Open Cases (Live) */}
                <TabPanel value={currentTab} index={0}>
                    <Box sx={{
                        height: '70vh',
                        overflowY: 'auto',
                        pr: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1
                    }}>
                        <EmergencyQueue requests={requests} onDispatch={() => {}} />
                    </Box>
                </TabPanel>

                {/* Tab 1: History */}
                <TabPanel value={currentTab} index={1}>
                    {/* Passed 'completedMissions' so it matches the Dispatcher side */}
                    <CompletedMissionsTable completedMissions={completedMissions} />
                </TabPanel>

                {/* Tab 2: Payments */}
                <TabPanel value={currentTab} index={2}>
                    {/* NEW: Passed 'allResponders' so PaymentView can find names like 'Mwangi Kamau' */}
                    <PaymentView
                        completedMissions={completedMissions}
                        allResponders={allResponders}
                    />
                </TabPanel>

                {/* Tab 3: Users */}
                <TabPanel value={currentTab} index={3}>
                    <UserManagementView />
                </TabPanel>
            </Box>

            {/* Sidebar Analytics */}
            <Box sx={{ flex: '1 1 30%', minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>System-Wide Analytics</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}><KpiCard title="Total Traffic" value={totalRequests} /></Grid>
                    <Grid item xs={6}><KpiCard title="Active Cases" value={openCases} color="error.main" /></Grid>
                    <Grid item xs={6}><KpiCard title="Fleet Size" value={totalUnits} color="primary.main" /></Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default AdminDashboard;