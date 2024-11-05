import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Grid, Avatar, useMediaQuery } from '@mui/material';
import { Sparklines, SparklinesLine, SparklinesSpots, SparklinesReferenceLine } from 'react-sparklines';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EquipmentIcon from '@mui/icons-material/Build';
import RequestIcon from '@mui/icons-material/Description';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import UserIcon from '@mui/icons-material/Person';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

const DashboardCards = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [totalRequests, setTotalRequests] = useState({ current: 0, trend: 0, trendData: [] });
    const [pendingRequests, setPendingRequests] = useState({ current: 0, trend: 0, trendData: [] });
    const [topDepartments, setTopDepartments] = useState([]);
    const [userApprovedRequests, setUserApprovedRequests] = useState({ current: 0, trend: 0, trendData: [] });

    const currentMonth = new Date().getMonth() + 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const currentUserEmail = auth.currentUser ? auth.currentUser.email : null;
        if (!currentUserEmail) return;

        const requestsRef = collection(db, 'equipmentRequests');
        const q = query(requestsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allRequests = snapshot.docs.map(doc => ({
                ...doc.data(),
                requestDate: doc.data().requestDate.toDate(),
                assignedDate: doc.data().assignedDate ? doc.data().assignedDate.toDate() : null,
            }));

            // Filter data for the current and last month
            const currentMonthRequests = allRequests.filter(req => req.requestDate.getMonth() + 1 === currentMonth && req.requestDate.getFullYear() === currentYear);
            const lastMonthRequests = allRequests.filter(req => req.requestDate.getMonth() + 1 === lastMonth && req.requestDate.getFullYear() === currentYear);

            // Total Equipment Requests
            const currentRequestsCount = currentMonthRequests.length;
            const lastRequestsCount = lastMonthRequests.length;
            const trendPercentage = lastRequestsCount
                ? ((currentRequestsCount - lastRequestsCount) / lastRequestsCount * 100).toFixed(1)
                : 0;
            setTotalRequests({
                current: currentRequestsCount,
                trend: trendPercentage,
                trendData: lastRequestsCount ? [lastRequestsCount, currentRequestsCount] : []
            });

            // Pending Requests
            const pendingRequestsSnapshot = currentMonthRequests.filter(req => req.status === 'Pending');
            const lastMonthPendingRequestsSnapshot = lastMonthRequests.filter(req => req.status === 'Pending');
            setPendingRequests({
                current: pendingRequestsSnapshot.length,
                trend: lastMonthPendingRequestsSnapshot.length
                    ? ((pendingRequestsSnapshot.length - lastMonthPendingRequestsSnapshot.length) / lastMonthPendingRequestsSnapshot.length * 100).toFixed(1)
                    : 0,
                trendData: lastMonthPendingRequestsSnapshot.length ? [lastMonthPendingRequestsSnapshot.length, pendingRequestsSnapshot.length] : []
            });

            // Top 3 Departments by Requests
            const departmentCounts = {};
            currentMonthRequests.forEach(req => {
                const department = req.department;
                if (department) {
                    departmentCounts[department] = (departmentCounts[department] || 0) + 1;
                }
            });
            const sortedDepartments = Object.entries(departmentCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([department, count]) => ({ department, count }));
            setTopDepartments(sortedDepartments);

            // User-Approved Requests
            const userApprovedSnapshot = currentMonthRequests.filter(req => req.status === 'Approved' && req.assignedBy === currentUserEmail);
            const lastMonthUserApprovedSnapshot = lastMonthRequests.filter(req => req.status === 'Approved' && req.assignedBy === currentUserEmail);
            setUserApprovedRequests({
                current: userApprovedSnapshot.length,
                trend: lastMonthUserApprovedSnapshot.length
                    ? ((userApprovedSnapshot.length - lastMonthUserApprovedSnapshot.length) / lastMonthUserApprovedSnapshot.length * 100).toFixed(1)
                    : 0,
                trendData: lastMonthUserApprovedSnapshot.length ? [lastMonthUserApprovedSnapshot.length, userApprovedSnapshot.length] : []
            });
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe();
    }, []);

    const cardData = [
        {
            title: "Total Equipment Requests",
            value: totalRequests.current,
            icon: <RequestIcon />,
            iconColor: '#FF7043',
            bgColor: '#FFE0B2',
            trend: `${totalRequests.trend}%`,
            trendColor: totalRequests.trend >= 0 ? 'success.main' : 'error.main',
            trendIcon: totalRequests.trend >= 0 ? <ArrowUpwardIcon color="success" /> : <ArrowDownwardIcon color="error" />,
            trendData: totalRequests.trendData
        },
        {
            title: "Pending Approvals",
            value: pendingRequests.current,
            icon: <PendingIcon />,
            iconColor: '#FFA726',
            bgColor: '#FFECB3',
            trend: `${pendingRequests.trend}%`,
            trendColor: pendingRequests.trend >= 0 ? 'success.main' : 'error.main',
            trendIcon: pendingRequests.trend >= 0 ? <ArrowUpwardIcon color="success" /> : <ArrowDownwardIcon color="error" />,
            trendData: pendingRequests.trendData
        },
        {
            title: "Top 3 Departments by Demand",
            value: topDepartments.map(dep => `${dep.department}: ${dep.count} requests`).join(", "),
            icon: <UserIcon />,
            iconColor: '#42A5F5',
            bgColor: '#BBDEFB',
            trend: "This Month",
            trendColor: 'success.main',
            trendIcon: <ArrowUpwardIcon color="success" />,
            trendData: []
        },
        {
            title: "You Approved",
            value: userApprovedRequests.current,
            icon: <EquipmentIcon />,
            iconColor: '#66BB6A',
            bgColor: '#C8E6C9',
            trend: `${userApprovedRequests.trend}%`,
            trendColor: userApprovedRequests.trend >= 0 ? 'success.main' : 'error.main',
            trendIcon: userApprovedRequests.trend >= 0 ? <ArrowUpwardIcon color="success" /> : <ArrowDownwardIcon color="error" />,
            trendData: userApprovedRequests.trendData
        }
    ];

    return (
        <Grid container spacing={isMobile ? 2 : 3} sx={{ paddingX: isMobile ? 1 : 3 }}>
            {cardData.map((card, index) => (
                <Grid item xs={12} sm={6} md={3} key={index} sx={{ marginBottom: isMobile ? 2 : 0 }}>
                    <Card sx={{
                        p: 2,
                        borderRadius: 2,
                        boxShadow: 3,
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '90%',
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'scale(1.03)' }
                    }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ bgcolor: card.iconColor, mr: 2 }}>
                                {card.icon}
                            </Avatar>
                            <Typography color="textSecondary" variant="h6">
                                {card.title}
                            </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {card.value}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={2}>
                            {card.trendIcon}
                            <Typography variant="body2" color={card.trendColor} sx={{ ml: 0.5 }}>
                                {card.trend} Since last month
                            </Typography>
                        </Box>
                        <Box mt={1}>
                            {card.trendData && card.trendData.length > 0 && (
                                <Sparklines data={card.trendData} limit={2} height={30}>
                                    <SparklinesLine color={card.trend >= 0 ? "green" : "red"} style={{ fillOpacity: 0.3, strokeWidth: 2 }} />
                                    <SparklinesReferenceLine type="avg" />
                                    <SparklinesSpots style={{ fill: card.trend >= 0 ? "green" : "red" }} />
                                </Sparklines>
                            )}
                        </Box>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default DashboardCards;
