import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../Charts/data/fetchDashboardData';
import fetchEquipmentData from '../Charts/data/fetchEquipmentData';
import EquipmentTypePieChart from '../Charts/EquipmentTypePieChart';
import StatusBarChart from '../Charts/StatusBarChart';
import RequesterBarChart from '../Charts/RequesterBarChart';
import RequestsChart from '../Charts/RequestsChart';
import DashboardCards from '../DashboardCards/DashboardCards';
import EquipmentMap from '../EquipmentMap/EquipmentMapPage';
import { Box, Typography, Paper, Grid, Snackbar, Alert } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const DashboardPage = () => {
    const [defaultChartData, setDefaultChartData] = useState({});
    const [chartData, setChartData] = useState({});
    const [statusData, setStatusData] = useState({});
    const [requesterData, setRequesterData] = useState({});
    const [selectedType, setSelectedType] = useState(null); // selected equipment type
    const [selectedSites, setSelectedSites] = useState([]); // selected sites on map
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const fetchInitialData = async () => {
        const dashboardData = await fetchDashboardData();
        const equipmentData = await fetchEquipmentData();

        setDefaultChartData(equipmentData);
        setChartData(equipmentData);
        setStatusData(dashboardData.statusCounts);
        setRequesterData(dashboardData.requesterCounts);
    };

    // Fetch filtered data based on the selected type and selected sites
    const fetchFilteredData = async (type) => {
        const filteredEquipmentData = {};
        const filteredStatusData = {};
        const filteredRequesterData = {};

        // Fetch equipment data from Firestore
        const equipmentCollection = await getDocs(collection(db, 'equipment'));
        const equipmentRequests = await getDocs(collection(db, 'equipmentRequests'));

        equipmentCollection.forEach((doc) => {
            const data = doc.data();
            const site = data.site || 'Unknown';
            const equipmentType = data.type || 'Unknown';

            // Check if the equipment matches the selected sites and type
            const isSiteMatch = selectedSites.length === 0 || selectedSites.includes(site);
            const isTypeMatch = !type || equipmentType === type;

            // Only include equipment if site and type match (if selected)
            if (isSiteMatch && isTypeMatch) {
                filteredEquipmentData[equipmentType] = (filteredEquipmentData[equipmentType] || 0) + 1;
            }
        });

        // Filtering equipment requests for status and requester data
        equipmentRequests.forEach((doc) => {
            const data = doc.data();
            const site = data.site || 'Unknown';
            const equipmentType = data.equipmentType || 'Unknown';
            const status = data.status || 'Unknown';
            const requester = data.requester || 'Unknown';

            const isSiteMatch = selectedSites.length === 0 || selectedSites.includes(site);
            const isTypeMatch = !type || equipmentType === type;

            if (isSiteMatch && isTypeMatch) {
                // Aggregating data for status
                filteredStatusData[status] = (filteredStatusData[status] || 0) + 1;
                // Aggregating data for requester
                filteredRequesterData[requester] = (filteredRequesterData[requester] || 0) + 1;
            }
        });

        // Update the state with the filtered data
        setChartData(filteredEquipmentData);
        setStatusData(filteredStatusData);
        setRequesterData(filteredRequesterData);
    };

    // Effect to fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Effect to fetch filtered data when either selectedType or selectedSites change
    useEffect(() => {
        fetchFilteredData(selectedType);
    }, [selectedType, selectedSites]);

    const handleCloseNotification = () => {
        setShowNotification(false);
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Admin Dashboard
            </Typography>

            {/* Notification Snackbar */}
            <Snackbar
                open={showNotification}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
                    {notificationMessage}
                </Alert>
            </Snackbar>

            {/* Dashboard Cards */}
            <Box mb={10}>
                <DashboardCards />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2, height: 350 }}>
                        <Typography variant="h6">Equipment Types</Typography>
                        <EquipmentTypePieChart
                            data={chartData}
                            onSectionTapped={(type) => setSelectedType(type)} 
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2, height: 350 }}>
                        <Typography variant="h6">Equipment Status</Typography>
                        <StatusBarChart data={statusData} />
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2, height: 350 }}>
                        <RequesterBarChart data={requesterData} />
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper >
                        <RequestsChart selectedType={selectedType} /> {/* Pass selectedType */}
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Equipment Location Map</Typography>
                        <Box sx={{ height: '500px', width: '100%' }}>
                            <EquipmentMap
                                onSiteSelection={(sites) => setSelectedSites(sites)}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
