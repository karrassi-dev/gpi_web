import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography, Paper } from '@mui/material';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatusBarChart = ({ data }) => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    // Assign specific colors for each status
    const backgroundColors = labels.map(label => {
        if (label === 'Approved') return 'rgba(76, 175, 80, 0.6)'; // Green for Approved
        if (label === 'Pending') return '#FF6384'; // Yellow for Pending
        return 'rgba(33, 150, 243, 0.6)'; // Default color for other statuses
    });

    const borderColors = labels.map(label => {
        if (label === 'Approved') return 'rgba(76, 175, 80, 1)'; // Green border for Approved
        if (label === 'Pending') return '#FF6384'; // Yellow border for Pending
        return 'rgba(33, 150, 243, 1)'; // Default color for other statuses
    });

    const chartData = {
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [
            {
                label: 'Count',
                data: values.length > 0 ? values : [0],
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `${tooltipItem.raw} ${tooltipItem.dataset.label}`,
                },
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Status', color: '#333', font: { weight: 'bold' } },
                ticks: { color: '#333', font: { size: 12 } },
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Count', color: '#333', font: { weight: 'bold' } },
            },
        },
    };

    return (
        <Paper elevation={3} sx={{ padding: 2, height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', borderRadius: '8px' }}>
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Bar data={chartData} options={options} />
            </Box>
        </Paper>
    );
};

export default StatusBarChart;
