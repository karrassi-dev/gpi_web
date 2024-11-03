import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Dialog, IconButton, Typography, Box } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';

ChartJS.register(ArcElement, Tooltip);

const EquipmentTypePieChart = ({ data, onSectionTapped }) => {
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showColors, setShowColors] = useState(false); // State to control legend visibility

    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#7C4DFF', '#00E676', '#FF3D00', '#304FFE'
    ];

    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                data: Object.values(data),
                backgroundColor: colors, // Always use colorful segments
                hoverOffset: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false }, // Hide legend in default view
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const value = chartData.datasets[0].data[tooltipItem.dataIndex];
                        return `${tooltipItem.label}: ${value}`;
                    },
                },
            },
        },
        onClick: (event, elements) => {
            if (elements.length) {
                const index = elements[0].index;
                const selectedType = chartData.labels[index];
                setFocusedIndex(index);
                onSectionTapped(selectedType);
            }
        },
    };

    return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
            <IconButton onClick={() => { setIsFullscreen(true); setShowColors(true); }} title="Expand">
                <FullscreenIcon />
            </IconButton>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px', position: 'relative', margin: 'auto', maxWidth: '100%' }}>
                <Pie data={chartData} options={options} />
                {focusedIndex !== null && ( // Show focused index info in both modes
                    <Box position="absolute" top="40%" left="50%" transform="translate(-50%, -50%)" textAlign="center">
                        <Typography variant="h6" color={colors[focusedIndex]}>
                            {chartData.labels[focusedIndex]}
                        </Typography>
                        <Typography variant="h4">
                            {((chartData.datasets[0].data[focusedIndex] / Object.values(data).reduce((a, b) => a + b)) * 100).toFixed(1)}%
                        </Typography>
                    </Box>
                )}
            </div>

            <Dialog open={isFullscreen} onClose={() => { setIsFullscreen(false); setShowColors(false); }} maxWidth="md" fullWidth>
                <Box p={2}>
                    <IconButton onClick={() => { setIsFullscreen(false); setShowColors(false); }} style={{ float: 'right' }}>
                        <CloseIcon />
                    </IconButton>
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Pie data={chartData} options={options} />
                    </Box>
                    {showColors && ( // If colors are shown, render legend
                        <Box display="flex" justifyContent="center" flexWrap="wrap" mt={2}>
                            {Object.keys(data).map((key, index) => (
                                <Box
                                    key={key}
                                    m={1}
                                    display="flex"
                                    alignItems="center"
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => setFocusedIndex(index)}
                                >
                                    <Box
                                        width={16}
                                        height={16}
                                        bgcolor={colors[index]}
                                        mr={1}
                                        sx={{ opacity: focusedIndex === index ? 1 : 0.6 }}
                                    />
                                    <Typography
                                        variant="body2"
                                        fontWeight={focusedIndex === index ? 'bold' : 'normal'}
                                        color={focusedIndex === index ? 'black' : 'grey'}
                                    >
                                        {key}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Dialog>
        </div>
    );
};

export default EquipmentTypePieChart;
