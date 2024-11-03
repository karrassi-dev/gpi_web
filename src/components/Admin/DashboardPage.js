// src/components/Admin/DashboardPage.js

import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../Charts/data/fetchDashboardData';
import fetchEquipmentData from '../Charts/data/fetchEquipmentData';
import fetchStatusData from '../Charts/data/fetchStatusData';
import EquipmentTypePieChart from '../Charts/EquipmentTypePieChart';
import StatusBarChart from '../Charts/StatusBarChart';
import RequesterBarChart from '../Charts/RequesterBarChart';
import RequestsChart from '../Charts/RequestsChart';
import DashboardCards from '../DashboardCards/DashboardCards';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const DashboardPage = () => {
    const [chartData, setChartData] = useState({});
    const [statusData, setStatusData] = useState({});
    const [requesterData, setRequesterData] = useState({});
    const [selectedType, setSelectedType] = useState(null);

    // Fetch initial data for all charts
    const fetchInitialData = async () => {
        const dashboardData = await fetchDashboardData();
        const equipmentData = await fetchEquipmentData();

        setChartData(equipmentData);
        setStatusData(dashboardData.statusCounts);
        setRequesterData(dashboardData.requesterCounts); // Load full requester data
    };

    // Fetch filtered data based on selected type, or reset if type is null
    const fetchFilteredData = async (type) => {
        if (!type) {
            fetchInitialData(); // Reset to initial data if no type is selected
            return;
        }

        const filteredStatusData = await fetchStatusData(type);
        setStatusData(filteredStatusData);

        // Filter requester data by selected type
        const filteredRequesterData = {};
        const equipmentRequests = await getDocs(collection(db, 'equipmentRequests'));
        equipmentRequests.forEach(doc => {
            const request = doc.data();
            if (request.equipmentType === type) {
                const requester = request.requester || 'Unknown';
                filteredRequesterData[requester] = (filteredRequesterData[requester] || 0) + 1;
            }
        });

        setRequesterData(filteredRequesterData); // Set filtered requester data
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchFilteredData(selectedType); // Fetch data based on selected type
    }, [selectedType]);

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Admin Dashboard
            </Typography>

            {/* Dashboard Cards at the top */}
            <Box mb={10}> {/* Adds space below DashboardCards */}
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
                                onSectionTapped={(type) => setSelectedType(type)} // Update selected type
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
                        
                        {Object.keys(requesterData).length > 0 ? (
                            <RequesterBarChart data={requesterData} />
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                {selectedType ? "No data available for the selected type" : "Loading requester data..."}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                    
                        
                        <RequestsChart />

                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
