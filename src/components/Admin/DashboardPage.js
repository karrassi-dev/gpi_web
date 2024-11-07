import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../Charts/data/fetchDashboardData';
import fetchEquipmentData from '../Charts/data/fetchEquipmentData';
import fetchStatusData from '../Charts/data/fetchStatusData';
import EquipmentTypePieChart from '../Charts/EquipmentTypePieChart';
import StatusBarChart from '../Charts/StatusBarChart';
import RequesterBarChart from '../Charts/RequesterBarChart';
import RequestsChart from '../Charts/RequestsChart';
import DashboardCards from '../DashboardCards/DashboardCards';
import EquipmentMap from '../EquipmentMap/EquipmentMapPage';
import { Box, Typography, Paper, Grid, Snackbar, Alert } from '@mui/material';
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const DashboardPage = () => {
    const [chartData, setChartData] = useState({});
    const [statusData, setStatusData] = useState({});
    const [requesterData, setRequesterData] = useState({});
    const [selectedType, setSelectedType] = useState(null);
    const [showNotification, setShowNotification] = useState(false); // Notification state
    const [notificationMessage, setNotificationMessage] = useState(''); // Notification message
    const [existingRequestIds, setExistingRequestIds] = useState(new Set()); // Track existing request IDs

    // Fetch initial data for all charts
    const fetchInitialData = async () => {
        const dashboardData = await fetchDashboardData();
        const equipmentData = await fetchEquipmentData();

        setChartData(equipmentData);
        setStatusData(dashboardData.statusCounts);
        setRequesterData(dashboardData.requesterCounts); // Load full requester data
    };

    // Real-time listener for new pending requests
    useEffect(() => {
        const q = query(
            collection(db, 'equipmentRequests'),
            where('status', '==', 'Pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const requestData = change.doc.data();
                    const requestId = change.doc.id;

                    // Show notification only for new requests
                    if (!existingRequestIds.has(requestId)) {
                        setExistingRequestIds((prev) => new Set(prev).add(requestId));
                        setNotificationMessage(`New request from ${requestData.name} for ${requestData.equipmentType}`);
                        setShowNotification(true);
                    }
                }
            });
        });

        return () => unsubscribe();
    }, []);

    // Fetch filtered data based on selected type
    const fetchFilteredData = async (type) => {
        if (!type) {
            fetchInitialData();
            return;
        }

        const filteredStatusData = await fetchStatusData(type);
        setStatusData(filteredStatusData);

        const filteredRequesterData = {};
        const equipmentRequests = await getDocs(collection(db, 'equipmentRequests'));
        equipmentRequests.forEach(doc => {
            const request = doc.data();
            if (request.equipmentType === type) {
                const requester = request.requester || 'Unknown';
                filteredRequesterData[requester] = (filteredRequesterData[requester] || 0) + 1;
            }
        });

        setRequesterData(filteredRequesterData);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchFilteredData(selectedType);
    }, [selectedType]);

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

            {/* Main Grid container for charts */}
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center', borderRadius: '8px', height: 350 }}>
                        <Typography variant="h6" gutterBottom>
                            Equipment Types
                        </Typography>
                        {Object.keys(chartData).length > 0 ? (
                            <EquipmentTypePieChart 
                                data={chartData} 
                                onSectionTapped={(type) => setSelectedType(type)}
                            />
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                Loading chart data...
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center', borderRadius: '8px', height: 350 }}>
                        <Typography variant="h6" gutterBottom>
                            Equipment Status
                        </Typography>
                        {Object.keys(statusData).length > 0 ? (
                            <StatusBarChart data={statusData} />
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                {selectedType ? "No data available for the selected type" : "Loading status data..."}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center', borderRadius: '8px', height: 350 }}>
                        <RequesterBarChart data={requesterData} />
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                    <Paper ffd>
                        <RequestsChart />
                    </Paper>
                </Grid>

                {/* Equipment Map */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center', borderRadius: '8px' }}>
                        <Typography variant="h6" gutterBottom>
                            Equipment Location Map
                        </Typography>
                        <Box sx={{ height: '500px', width: '100%' }}>
                            <EquipmentMap />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
