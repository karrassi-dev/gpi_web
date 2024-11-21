import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication
import {
    TextField,
    Card,
    CardContent,
    IconButton,
    List,
    ListItemText,
    AppBar,
    Toolbar,
    Box,
    Pagination,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const UpdaterEquipment = () => {
    const [equipmentList, setEquipmentList] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25); // Items per page
    const navigate = useNavigate();
    const auth = getAuth(); // Initialize Firebase Authentication
    const currentUser = auth.currentUser; // Get the current user

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

    const handleDelete = async (id, equipment) => {
        if (!currentUser) {
            alert('You must be logged in to delete equipment.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this equipment?')) {
            try {
                // Move the document to the recycle_bin collection
                const recycleBinRef = doc(db, 'recycle_bin', equipment.serial_number);
                await setDoc(recycleBinRef, {
                    ...equipment,
                    Deleted_By: currentUser.email, // Use the authenticated user's email
                    Deleted_Date: serverTimestamp(),
                });

                // Delete the document from the equipment collection
                await deleteDoc(doc(db, 'equipment', id));

                alert('Equipment moved to recycle bin successfully');
            } catch (error) {
                console.error('Error moving to recycle bin: ', error);
                alert('Failed to move equipment to recycle bin. Try again later.');
            }
        }
    };

    // Pagination logic
    const indexOfLastEquipment = currentPage * itemsPerPage;
    const indexOfFirstEquipment = indexOfLastEquipment - itemsPerPage;
    const currentEquipment = filteredEquipment.slice(indexOfFirstEquipment, indexOfLastEquipment);
    const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo(0, 0); // Scroll to top when page changes
    };

    return (
        <Box sx={{ padding: { xs: 1, sm: 2 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
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
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                </Toolbar>
            </AppBar>

            <List sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                {currentEquipment.map((equipment) => (
                    <Card
                        key={equipment.id}
                        sx={{
                            width: { xs: '100%', sm: '48%', md: '32%' }, // Responsive widths
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                            borderRadius: '16px',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        <CardContent>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {equipment.name || 'Unnamed'}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography variant="body2" color="textSecondary">Email: {equipment.email}</Typography>
                                        <Typography variant="body2" color="textSecondary">Type: {equipment.type}</Typography>
                                        <Typography variant="body2" color="textSecondary">Brand: {equipment.brand}</Typography>
                                        <Typography variant="body2" color="textSecondary">Serial Number: {equipment.serial_number}</Typography>
                                    </>
                                }
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <IconButton
                                    onClick={() =>
                                        navigate(`/admin-dashboard/update-equipment/view-equipment/${equipment.serial_number}`)
                                    }
                                >
                                    <VisibilityIcon color="primary" />
                                </IconButton>
                                <IconButton onClick={() => navigate(`/admin-dashboard/update-equipment/update-equipment/${equipment.id}`)}>
                                    <EditIcon color="secondary" />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(equipment.id, equipment)}>
                                    <DeleteIcon sx={{ color: 'red' }} />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </List>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            fontSize: { xs: '0.8rem', sm: '1rem' },
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default UpdaterEquipment;
