// src/Charts/WeeklyEquipmentRequestsChart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography, Paper, IconButton, Dialog } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ensure your firebase config is set up correctly

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeeklyEquipmentRequestsChart = () => {
    const [chartData, setChartData] = useState({});
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'equipmentRequests'));
            const requestCounts = {};
            const now = new Date();
            const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));

            querySnapshot.forEach((doc) => {
                const requestDate = doc.data().requestDate.toDate(); // Adjust if necessary to get timestamp
                if (requestDate >= oneWeekAgo) {
                    const dayKey = requestDate.toLocaleDateString(); // Format date for daily tracking
                    if (!requestCounts[dayKey]) {
                        requestCounts[dayKey] = 0; // Initialize count
                    }
                    requestCounts[dayKey] += 1; // Increment count
                }
            });

            setChartData(requestCounts);
        };

        fetchData();
    }, []);

    // Reverse the order of the chart data
    const chartLabels = Object.keys(chartData).reverse();
    const chartValues = Object.values(chartData).reverse();

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Weekly Requests',
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
                title: { display: true, text: 'Date' },
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
                    Weekly Equipment Requests
                </Typography>
                <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
                    {isFullscreen ? <CloseIcon /> : <FullscreenIcon />}
                </IconButton>
            </Box>
            <Box sx={{ height: '250px', marginTop: 2 }}>
                <Line data={data} options={options} />
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

export default WeeklyEquipmentRequestsChart;
