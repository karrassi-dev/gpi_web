import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/system';

// Styled Component for 3D Card with Radius
const StyledCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    borderRadius: '15px',
    transition: 'transform 0.3s, box-shadow 0.3s',
    backgroundColor: '#ffffff',
    '&:hover': {
        transform: 'translateY(-10px) scale(1.02)',
        boxShadow: theme.shadows?.[10] || '0px 10px 20px rgba(0, 0, 0, 0.2)',
    },
}));

// Styled Container
const Container = styled('div')(() => ({
    padding: '20px',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
}));

const Trash = () => {
    const [recycleBinData, setRecycleBinData] = useState([]);
    const [filteredData, setFilteredData] = useState([]); // For displaying filtered data
    const [selectedItem, setSelectedItem] = useState(null); // Store selected item for the dialog
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter state
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc' for Deleted_Date
    const [typeFilter, setTypeFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');

    const uniqueEmails = [...new Set(recycleBinData.map((item) => item.Deleted_By))]; // Extract unique emails
    const uniqueTypes = [...new Set(recycleBinData.map((item) => item.type))]; // Extract unique types

    // Fetch data from Firestore
    useEffect(() => {
        const fetchData = async () => {
            const collectionRef = collection(db, 'recycle_bin');
            const snapshot = await getDocs(collectionRef);
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setRecycleBinData(data);
            setFilteredData(data); // Initialize filtered data
        };

        fetchData();
    }, []);

    // Apply Filters
    useEffect(() => {
        let data = [...recycleBinData];

        // Sort by Deleted_Date
        if (sortOrder) {
            data.sort((a, b) => {
                const dateA = a.Deleted_Date?.toDate();
                const dateB = b.Deleted_Date?.toDate();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        }

        // Filter by Type
        if (typeFilter) {
            data = data.filter((item) => item.type === typeFilter);
        }

        // Filter by Deleted_By (email)
        if (emailFilter) {
            data = data.filter((item) => item.Deleted_By === emailFilter);
        }

        setFilteredData(data);
    }, [sortOrder, typeFilter, emailFilter, recycleBinData]);

    const handleDetailsClick = (item) => {
        setSelectedItem(item);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedItem(null);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Recycle Bin
            </Typography>

            {/* Filters */}
            <Box display="flex" justifyContent="space-between" marginBottom={3}>
                {/* Sort by Deleted_Date */}
                <FormControl style={{ minWidth: 150 }}>
                    <InputLabel>Sort By Date</InputLabel>
                    <Select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                </FormControl>

                {/* Filter by Type */}
                <FormControl style={{ minWidth: 150 }}>
                    <InputLabel>Filter By Type</InputLabel>
                    <Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <MenuItem value="">All Types</MenuItem>
                        {uniqueTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Filter by Deleted_By */}
                <FormControl style={{ minWidth: 150 }}>
                    <InputLabel>Filter By Email</InputLabel>
                    <Select
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value)}
                    >
                        <MenuItem value="">All Emails</MenuItem>
                        {uniqueEmails.map((email) => (
                            <MenuItem key={email} value={email}>
                                {email}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Grid of Cards */}
            <Grid container spacing={3}>
                {filteredData.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <StyledCard variant="outlined">
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {item.name}
                                </Typography>
                                <Typography color="textSecondary">
                                    Serial: {item.serial_number}
                                </Typography>
                                <Typography color="textSecondary">Type: {item.type}</Typography>
                                <Typography color="textSecondary">Brand: {item.brand}</Typography>
                            </CardContent>
                            <IconButton
                                onClick={() => handleDetailsClick(item)}
                                style={{ position: 'absolute', top: 10, right: 10 }}
                            >
                                <InfoIcon />
                            </IconButton>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>

            {/* Details Dialog */}
            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth>
                <DialogTitle>Details</DialogTitle>
                <DialogContent>
                    {selectedItem && (
                        <div>
                            <Typography variant="body1">
                                <strong>Deleted By:</strong> {selectedItem.Deleted_By}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Deleted Date:</strong> {selectedItem.Deleted_Date?.toDate().toString()}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Brand:</strong> {selectedItem.brand}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Serial Number:</strong> {selectedItem.serial_number}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Type:</strong> {selectedItem.type}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Name:</strong> {selectedItem.name}
                            </Typography>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Trash;
