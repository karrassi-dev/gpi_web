// src/Charts/RequestsChart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography, Paper, IconButton, Dialog, Button } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ensure your firebase config is set up correctly

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RequestsChart = ({ selectedType }) => {
    const [chartData, setChartData] = useState({ monthly: {}, weekly: {} });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timeFrame, setTimeFrame] = useState('monthly');

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'equipmentRequests'));
            const requestCounts = { monthly: {}, weekly: {} };
            const now = new Date();

            for (let i = 0; i < 12; i++) {
                const monthYear = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${monthYear.getMonth() + 1}-${monthYear.getFullYear()}`;
                requestCounts.monthly[monthKey] = 0;
            }

            for (let i = 0; i < 7; i++) {
                const weekDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const weekKey = `${weekDay.getDate()}-${weekDay.getMonth() + 1}-${weekDay.getFullYear()}`;
                requestCounts.weekly[weekKey] = 0;
            }

            querySnapshot.forEach((doc) => {
                const request = doc.data();
                if (!selectedType || request.equipmentType === selectedType) { // Filter by type
                    const requestDate = request.requestDate.toDate();
                    const monthYear = `${requestDate.getMonth() + 1}-${requestDate.getFullYear()}`;
                    if (requestCounts.monthly[monthYear] !== undefined) {
                        requestCounts.monthly[monthYear] += 1;
                    }

                    const weekKey = `${requestDate.getDate()}-${requestDate.getMonth() + 1}-${requestDate.getFullYear()}`;
                    if (requestCounts.weekly[weekKey] !== undefined) {
                        requestCounts.weekly[weekKey] += 1;
                    }
                }
            });

            setChartData(requestCounts);
        };

        fetchData();
    }, [selectedType]); // Re-fetch when selectedType changes

    const chartLabels = timeFrame === 'monthly'
        ? Object.keys(chartData.monthly).reverse()
        : Object.keys(chartData.weekly).reverse();

    const chartValues = timeFrame === 'monthly'
        ? Object.values(chartData.monthly).reverse()
        : Object.values(chartData.weekly).reverse();

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: timeFrame === 'monthly' ? 'Monthly Requests' : 'Weekly Requests',
                data: chartValues,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    return (
        <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', width: '100%', height: 350 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>
                    {timeFrame === 'monthly' ? 'Monthly Equipment Requests' : 'Weekly Equipment Requests'}
                </Typography>
                <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
                    {isFullscreen ? <CloseIcon /> : <FullscreenIcon />}
                </IconButton>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                    variant={timeFrame === 'monthly' ? 'contained' : 'outlined'}
                    onClick={() => setTimeFrame('monthly')}
                >
                    Monthly
                </Button>
                <Button
                    variant={timeFrame === 'weekly' ? 'contained' : 'outlined'}
                    onClick={() => setTimeFrame('weekly')}
                >
                    Weekly
                </Button>
            </Box>
            <Box sx={{ height: '250px', width: '100%', marginTop: 2 }}>
                {Object.keys(chartData[timeFrame]).length > 0 ? (
                    <Line data={data} options={{
                        responsive: true,
                        plugins: {
                            legend: { display: true },
                        },
                        scales: {
                            x: {
                                title: { display: true, text: timeFrame === 'monthly' ? 'Month-Year' : 'Date' },
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: 'Request Count' },
                            },
                        },
                    }} />
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No data available for the selected timeframe.
                    </Typography>
                )}
            </Box>
            <Dialog open={isFullscreen} onClose={() => setIsFullscreen(false)} maxWidth="md" fullWidth>
                <Box p={2}>
                    <IconButton onClick={() => setIsFullscreen(false)} style={{ float: 'right' }}>
                        <CloseIcon />
                    </IconButton>
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Line data={data} />
                    </Box>
                </Box>
            </Dialog>
        </Paper>
    );
};

export default RequestsChart;
