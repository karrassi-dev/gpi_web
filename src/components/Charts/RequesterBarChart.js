// src/components/Charts/RequesterBarChart.js

import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography, Paper, IconButton, Dialog } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RequesterBarChart = ({ data }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const emails = Object.keys(data);
    const requestCounts = Object.values(data);

    // Define a color palette for the bars
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#7C4DFF', '#00E676', '#FF3D00', '#304FFE', '#FFD700', '#ADFF2F'
    ];


    const backgroundColors = emails.map((_, index) => colors[index % colors.length]);

    const chartData = {
        labels: emails,
        datasets: [
            {
                label: 'Number of Requests',
                data: requestCounts,
                backgroundColor: backgroundColors,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
                },
            },
        },
        scales: {
            x: { title: { display: true, text: 'Requester Email' } },
            y: { title: { display: true, text: 'Request Count' }, beginAtZero: true },
        },
    };

    return (
        <Paper sx={{ height: 350 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>
                    Top Requesters
                </Typography>
                <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
                    {isFullscreen ? <CloseIcon /> : <FullscreenIcon />}
                </IconButton>
            </Box>
            <Box sx={{ height: 350 }}>
                <Bar data={chartData} options={options} />
            </Box>
                


            {/* Fullscreen Dialog */}
            <Dialog open={isFullscreen} onClose={() => setIsFullscreen(false)} maxWidth="md" fullWidth>
                <Box p={2}>
                    <IconButton onClick={() => setIsFullscreen(false)} style={{ float: 'right' }}>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" align="center" gutterBottom>
                        Top Requesters
                    </Typography>
                    <Box display="flex" justifyContent="center" sx={{ height: '400px', marginTop: 2 }}>
                        <Bar data={chartData} options={options} />
                    </Box>
                </Box>
            </Dialog>
        </Paper>
    );
};

export default RequesterBarChart;
