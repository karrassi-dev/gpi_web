// src/components/Charts/RequesterBarChart.js

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RequesterBarChart = ({ data }) => {
    const emails = Object.keys(data);
    const requestCounts = Object.values(data);

    // Define a color palette for the bars
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#7C4DFF', '#00E676', '#FF3D00', '#304FFE', '#FFD700', '#ADFF2F'
    ];

    // Dynamically assign colors, looping through the color array if needed
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
        <Box sx={{ height: 300 }}>
            <Typography variant="h6" align="center">
                Top Requesters
            </Typography>
            <Bar data={chartData} options={options} />
        </Box>
    );
};

export default RequesterBarChart;
