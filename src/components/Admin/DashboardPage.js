import React, { useEffect, useState } from 'react';
import fetchStatusData from '../Charts/data/fetchStatusData';  // Import status data fetch function
import EquipmentTypePieChart from '../Charts/EquipmentTypePieChart';
import StatusBarChart from '../Charts/StatusBarChart';  // Import StatusBarChart
import RequesterBarChart from '../Charts/RequesterBarChart'; // Import RequesterBarChart
import RequestsChart from '../Charts/RequestsChart'; // Import RequestsChart
import { Box, Typography, Paper, Grid } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const DashboardPage = () => {
    const [chartData, setChartData] = useState({});
    const [statusData, setStatusData] = useState({});
    const [requesterData, setRequesterData] = useState({}); // State for requester data

    // Fetch and process equipment data for EquipmentTypePieChart
    const fetchEquipmentData = async () => {
        const querySnapshot = await getDocs(collection(db, 'equipment'));
        const data = {};

        querySnapshot.forEach((doc) => {
            const type = doc.data().type || 'Unknown';
            data[type] = (data[type] || 0) + 1;
        });

        setChartData(data);
    };

    // Fetch status data for StatusBarChart
    const fetchRequesterData = async () => {
        const querySnapshot = await getDocs(collection(db, 'equipmentRequests'));
        const requestCounts = {};

        querySnapshot.forEach((doc) => {
            const email = doc.data().email; // Get the email from the document
            if (requestCounts[email]) {
                requestCounts[email] += 1; // Increment count
            } else {
                requestCounts[email] = 1; // Initialize count
            }
        });

        setRequesterData(requestCounts);
    };

    useEffect(() => {
        fetchEquipmentData();

        const getStatusData = async () => {
            const data = await fetchStatusData();
            setStatusData(data);
        };

        getStatusData();
        fetchRequesterData(); // Fetch requester data
    }, []);

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Admin Dashboard
            </Typography>
            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center', borderRadius: '8px', height: 350 }}>
                        <Typography variant="h6" gutterBottom>
                            Equipment Types
                        </Typography>
                        {Object.keys(chartData).length > 0 ? (
                            <EquipmentTypePieChart 
                                data={chartData} 
                                onSectionTapped={(type) => console.log('Section tapped:', type)}
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
                                Loading status data...
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Requester Bar Chart */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ padding: 2, textAlign: 'center', borderRadius: '8px', height: 350 }}>
                        <Typography variant="h6" gutterBottom>
                            Top Requesters
                        </Typography>
                        {Object.keys(requesterData).length > 0 ? (
                            <RequesterBarChart data={requesterData} />
                        ) : (
                            <Typography variant="body2" color="textSecondary">
                                Loading requester data...
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
