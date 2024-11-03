// EquipmentHistoryDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { List, ListItem, ListItemText, AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DateRangePicker from '@mui/lab/DateRangePicker';
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import StarIcon from '@mui/icons-material/Star';

const EquipmentHistoryDetailPage = () => {
    const { equipmentId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [currentUserAssignment, setCurrentUserAssignment] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            const historyRef = doc(db, 'HistoryOfEquipment', equipmentId);
            const snapshot = await getDoc(historyRef);

            if (snapshot.exists()) {
                const data = snapshot.data();
                const sortedAssignments = data.assignments.sort((a, b) => b.assignmentDate - a.assignmentDate);
                setAssignments(sortedAssignments);
                setFilteredAssignments(sortedAssignments);
                
                // Set the most recent assignment as the current user assignment
                if (sortedAssignments.length > 0) {
                    setCurrentUserAssignment(sortedAssignments[0]); // The most recent one
                }
            }
        };
        fetchAssignments();
    }, [equipmentId]);

    const filterAssignmentsByDate = () => {
        if (dateRange[0] && dateRange[1]) {
            const [start, end] = dateRange;
            const filtered = assignments.filter((assignment) => {
                const assignmentDate = assignment.assignmentDate.toDate();
                return assignmentDate >= start && assignmentDate <= end;
            });
            setFilteredAssignments(filtered);
        } else {
            setFilteredAssignments(assignments);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <AppBar position="static" sx={{ mb: 2 }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => window.history.back()}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">Equipment History Details</Typography>
                </Toolbar>
            </AppBar>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateRangePicker
                    startText="Start Date"
                    endText="End Date"
                    value={dateRange}
                    onChange={(newRange) => setDateRange(newRange)}
                    renderInput={(startProps, endProps) => (
                        <>
                            <TextField {...startProps} fullWidth margin="normal" />
                            <TextField {...endProps} fullWidth margin="normal" />
                        </>
                    )}
                />
                <Button variant="contained" onClick={filterAssignmentsByDate} sx={{ mt: 2 }}>
                    Filter
                </Button>
            </LocalizationProvider>
            <List>
                {filteredAssignments.map((assignment, index) => {
                    const isCurrentUser = currentUserAssignment && assignment === currentUserAssignment;

                    return (
                        <ListItem
                            key={index}
                            sx={{
                                mb: 1,
                                p: 2,
                                boxShadow: 1,
                                backgroundColor: isCurrentUser ? '#e3f2fd' : 'white', // Highlight color for current user
                                borderLeft: isCurrentUser ? '4px solid #1976d2' : 'none',
                            }}
                        >
                            <ListItemText
                                primary={`User: ${assignment.user}`}
                                secondary={`Department: ${assignment.department}, Assigned By: ${assignment.admin}`}
                                sx={{ fontWeight: isCurrentUser ? 'bold' : 'normal' }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                {assignment.assignmentDate.toDate().toLocaleDateString()}
                            </Typography>
                            {isCurrentUser && (
                                <IconButton edge="end" aria-label="current user" color="primary">
                                    <StarIcon />
                                </IconButton>
                            )}
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default EquipmentHistoryDetailPage;
