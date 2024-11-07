import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {
    Container,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Pagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './EquipmentCurrentUserPage.css';

const EquipmentCurrentUserPage = () => {
    const [equipmentList, setEquipmentList] = useState([]);
    const [filteredEquipmentList, setFilteredEquipmentList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    const itemsPerPage = 15;

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'equipment'));
                const equipmentData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setEquipmentList(equipmentData);
                setFilteredEquipmentList(equipmentData);
            } catch (error) {
                console.error('Error fetching equipment data: ', error);
            }
        };

        fetchEquipment();
    }, []);

    // Filter list based on search query for user, serial number, or brand
    useEffect(() => {
        const filteredList = equipmentList.filter((item) =>
            (item.user && item.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.serial_number && item.serial_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredEquipmentList(filteredList);
        setCurrentPage(1); // Reset to the first page when searching
    }, [searchQuery, equipmentList]);

    // Handle dialog open and close
    const handleOpenDialog = (item) => {
        setSelectedEquipment(item);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEquipment(null);
    };

    // Pagination logic
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const paginatedData = filteredEquipmentList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Container maxWidth="md" className="equipment-container">
            <Typography variant="h4" align="center" gutterBottom>
                Equipment Inventory
            </Typography>

            <TextField
                label="Search by User, Serial Number, or Brand"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Grid container spacing={3}>
                {paginatedData.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card className="equipment-card">
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {item.name || item.type}
                                </Typography>
                                <Typography color="textSecondary">
                                    <strong>Brand:</strong> {item.brand || 'N/A'}
                                </Typography>
                                <Typography color="textSecondary">
                                    <strong>User:</strong> {item.user || 'N/A'}
                                </Typography>
                                <Typography color="textSecondary">
                                    <strong>Serial Number:</strong> {item.serial_number || 'N/A'}
                                </Typography>
                                <Typography color="textSecondary">
                                    <strong>Type:</strong> {item.type || 'N/A'}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => handleOpenDialog(item)}
                                    style={{ marginTop: '10px' }}
                                >
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Pagination
                count={Math.ceil(filteredEquipmentList.length / itemsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
            />

            {/* Details Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Equipment Details
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseDialog}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedEquipment && (
                        <>
                            <Typography variant="body1">
                                <strong>Name:</strong> {selectedEquipment.name || 'N/A'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Brand:</strong> {selectedEquipment.brand || 'N/A'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>User:</strong> {selectedEquipment.user || 'N/A'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Serial Number:</strong> {selectedEquipment.serial_number || 'N/A'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Type:</strong> {selectedEquipment.type || 'N/A'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Processor:</strong> {selectedEquipment.processor || 'N/A'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>RAM:</strong> {selectedEquipment.ram || 'N/A'} GB
                            </Typography>
                            <Typography variant="body1">
                                <strong>OS:</strong> {selectedEquipment.os || 'N/A'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Department:</strong> {selectedEquipment.department || 'N/A'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Location:</strong> {selectedEquipment.location || 'N/A'}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EquipmentCurrentUserPage;
