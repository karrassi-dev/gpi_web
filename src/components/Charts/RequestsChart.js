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

const RequestsChart = () => {
    const [chartData, setChartData] = useState({ monthly: {}, weekly: {} });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timeFrame, setTimeFrame] = useState('monthly'); // State to toggle between monthly and weekly

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'equipmentRequests'));
            const requestCounts = { monthly: {}, weekly: {} };
            const now = new Date();

            // Initialize the request counts for the last year
            for (let i = 0; i < 12; i++) {
                const monthYear = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${monthYear.getMonth() + 1}-${monthYear.getFullYear()}`;
                requestCounts.monthly[monthKey] = 0; // Start with 0 requests for each month
            }

            // Weekly request counts
            for (let i = 0; i < 7; i++) {
                const weekDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const weekKey = `${weekDay.getDate()}-${weekDay.getMonth() + 1}-${weekDay.getFullYear()}`;
                requestCounts.weekly[weekKey] = 0; // Start with 0 requests for each day of the week
            }

            querySnapshot.forEach((doc) => {
                const requestDate = doc.data().requestDate.toDate(); // Adjust if necessary to get timestamp
                const monthYear = `${requestDate.getMonth() + 1}-${requestDate.getFullYear()}`;
                if (requestCounts.monthly[monthYear] !== undefined) {
                    requestCounts.monthly[monthYear] += 1; // Increment count for monthly
                }

                const weekKey = `${requestDate.getDate()}-${requestDate.getMonth() + 1}-${requestDate.getFullYear()}`;
                if (requestCounts.weekly[weekKey] !== undefined) {
                    requestCounts.weekly[weekKey] += 1; // Increment count for weekly
                }
            });

            setChartData(requestCounts);
        };

        fetchData();
    }, []);

    // Check if data exists for chart
    const isMonthlyDataAvailable = Object.keys(chartData.monthly).length > 0;
    const isWeeklyDataAvailable = Object.keys(chartData.weekly).length > 0;

    const chartLabels = timeFrame === 'monthly' 
        ? Object.keys(chartData.monthly).reverse() // Reverse for older on left
        : Object.keys(chartData.weekly).reverse();  // Reverse for older on left
        
    const chartValues = timeFrame === 'monthly' 
        ? Object.values(chartData.monthly).reverse() // Reverse for older on left
        : Object.values(chartData.weekly).reverse();  // Reverse for older on left

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

    const options = {
        
        responsive: true,
        plugins: {
            legend: { display: true },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
                },
            },
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
                <Button variant={timeFrame === 'monthly' ? 'contained' : 'outlined'} onClick={() => setTimeFrame('monthly')}>
                    Monthly
                </Button>
                <Button variant={timeFrame === 'weekly' ? 'contained' : 'outlined'} onClick={() => setTimeFrame('weekly')}>
                    Weekly
                </Button>
            </Box>
            <Box sx={{ height: '250px', width: '100%', marginTop: 2,  }}>
                {isMonthlyDataAvailable || isWeeklyDataAvailable ? (
                    <Line  data={data} options={options} />
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No data available for the selected timeframe.
                    </Typography>
                )}
            </Box>
            {/* Fullscreen Mode */}
            <Dialog open={isFullscreen} onClose={() => setIsFullscreen(false)} maxWidth="md" fullWidth>
                <Box p={2}>
                    <IconButton onClick={() => setIsFullscreen(false)} style={{ float: 'right' }}>
                        <CloseIcon />
                    </IconButton>
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Line data={data} options={options} />
                    </Box>
                </Box>
            </Dialog>
        </Paper>
    );
};

export default RequestsChart;
