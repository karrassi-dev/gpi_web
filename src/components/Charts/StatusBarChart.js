import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography, Paper } from '@mui/material';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatusBarChart = ({ data }) => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    // Default to a message if there's no data
    const chartData = {
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [
            {
                label: 'Count',
                data: values.length > 0 ? values : [0],
                backgroundColor: 'rgba(33, 150, 243, 0.6)',
                borderColor: 'rgba(33, 150, 243, 1)',
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
                    label: (tooltipItem) => `${tooltipItem.raw} ${tooltipItem.dataset.label}`, // More informative tooltip
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
                // ticks: { color: '#333', font: { size: 12 } },
            },
        },
    };

    return (
        <Paper elevation={3} sx={{ padding: 2, height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', borderRadius: '8px' }}>
            {/* <Typography variant="h6" align="center" gutterBottom>
                Status Distribution
            </Typography> */}
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Bar data={chartData} options={options} />
            </Box>
</Paper>
    );
};

export default StatusBarChart;
