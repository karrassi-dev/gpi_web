import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Dialog, IconButton, Typography, Box } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Make sure your firebase config is set up correctly

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RequesterBarChart = () => {
    const [data, setData] = useState({});
    const [emails, setEmails] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, 'equipmentRequests'));
            const requestCounts = {};
            const requestEmails = [];

            querySnapshot.forEach((doc) => {
                const email = doc.data().email; // Get the email from the document
                if (requestCounts[email]) {
                    requestCounts[email] += 1; // Increment count
                } else {
                    requestCounts[email] = 1; // Initialize count
                    requestEmails.push(email); // Store unique email
                }
            });

            setData(requestCounts);
            setEmails(requestEmails);
        };

        fetchData();
    }, []);

    const topRequesters = Object.entries(data)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 4);

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

    const chartData = {
        labels: topRequesters.map(([email]) => email),
        datasets: [
            {
                label: 'Requests',
                data: topRequesters.map(([, count]) => count),
                backgroundColor: colors,
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
    };

    return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
            <IconButton onClick={() => setIsFullscreen(true)} title="Expand">
                <FullscreenIcon />
            </IconButton>
            <Bar data={chartData} options={options} />
            <Dialog open={isFullscreen} onClose={() => setIsFullscreen(false)} maxWidth="md" fullWidth>
                <Box p={2}>
                    <IconButton onClick={() => setIsFullscreen(false)} style={{ float: 'right' }}>
                        <CloseIcon />
                    </IconButton>
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Bar data={chartData} options={options} />
                    </Box>
                </Box>
            </Dialog>
        </div>
    );
};

export default RequesterBarChart;
