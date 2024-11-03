// src/components/Admin/UpdaterEquipment.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { TextField, Card, IconButton, List, ListItem, ListItemText, AppBar, Toolbar, Box, Pagination } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Typography } from '@mui/material';

import './UpdaterEquipment.css';

const UpdaterEquipment = () => {
    const [equipmentList, setEquipmentList] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25); // Items per page
    const navigate = useNavigate();

    useEffect(() => {
        const equipmentRef = collection(db, 'equipment');
        const q = query(equipmentRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const equipmentData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEquipmentList(equipmentData);
            setFilteredEquipment(equipmentData);
        });
        return () => unsubscribe();
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredEquipment(
            equipmentList.filter((equipment) =>
                equipment.name?.toLowerCase().includes(query) ||
                equipment.email?.toLowerCase().includes(query) ||
                equipment.type?.toLowerCase().includes(query) ||
                equipment.brand?.toLowerCase().includes(query) ||
                equipment.serial_number?.toLowerCase().includes(query)
            )
        );
        setCurrentPage(1); // Reset to first page on search
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            await deleteDoc(doc(db, 'equipment', id));
            alert('Equipment deleted successfully');
        }
    };

    // Calculate the current items to display
    const indexOfLastEquipment = currentPage * itemsPerPage;
    const indexOfFirstEquipment = indexOfLastEquipment - itemsPerPage;
    const currentEquipment = filteredEquipment.slice(indexOfFirstEquipment, indexOfLastEquipment);

    // Calculate total pages
    const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo(0, 0); // Scroll to top when page changes
    };

    return (
        <Box sx={{ padding: 2 }}>
            <AppBar position="sticky" color="primary" sx={{ mb: 2 }}>
                <Toolbar>
                    <TextField
                        variant="outlined"
                        placeholder="Search equipment..."
                        onChange={handleSearch}
                        fullWidth
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: 1,
                            mt: { xs: 1, sm: 0 },
                        }}
                    />
                </Toolbar>
            </AppBar>

            <List sx={{ maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
                {currentEquipment.map((equipment) => (
                    <Card
                        key={equipment.id}
                        sx={{
                            margin: '10px 0',
                            padding: '10px',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            },
                        }}
                    >
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant="h6">{equipment.name || 'Unnamed'}</Typography>}
                                secondary={
                                    <>
                                        <Typography variant="body2">Email: {equipment.email}</Typography>
                                        <Typography variant="body2">Type: {equipment.type}</Typography>
                                        <Typography variant="body2">Brand: {equipment.brand}</Typography>
                                        <Typography variant="body2">Serial Number: {equipment.serial_number}</Typography>
                                    </>
                                }
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <IconButton
                                    onClick={() =>
                                        navigate(`/admin-dashboard/update-equipment/view-equipment/${equipment.serial_number}`)
                                    }
                                >
                                    <VisibilityIcon />
                                </IconButton>
                                <IconButton onClick={() => navigate(`/admin-dashboard/update-equipment/update-equipment/${equipment.id}`)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(equipment.id)}>
                                    <DeleteIcon color="error" />
                                </IconButton>
                            </Box>
                        </ListItem>
                    </Card>
                ))}
            </List>

            {/* Pagination Component */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    size="small"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            fontSize: { xs: '0.8rem', sm: '1rem' }, // Smaller size for mobile
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default UpdaterEquipment;
