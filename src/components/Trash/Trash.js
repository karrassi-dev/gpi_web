import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
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
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';

// Styled Card
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

const Container = styled('div')(() => ({
    padding: '20px',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
}));

const Trash = () => {
    const [recycleBinData, setRecycleBinData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToRestore, setItemToRestore] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [sortOrder, setSortOrder] = useState('asc');
    const [typeFilter, setTypeFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');

    const uniqueEmails = [...new Set(recycleBinData.map((item) => item.Deleted_By))];
    const uniqueTypes = [...new Set(recycleBinData.map((item) => item.type))];

    useEffect(() => {
        const fetchData = async () => {
            const collectionRef = collection(db, 'recycle_bin');
            const snapshot = await getDocs(collectionRef);
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setRecycleBinData(data);
            setFilteredData(data);
        };

        fetchData();
    }, []);

    useEffect(() => {
        let data = [...recycleBinData];
        if (sortOrder) {
            data.sort((a, b) => {
                const dateA = a.Deleted_Date?.toDate();
                const dateB = b.Deleted_Date?.toDate();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        }
        if (typeFilter) data = data.filter((item) => item.type === typeFilter);
        if (emailFilter) data = data.filter((item) => item.Deleted_By === emailFilter);

        setFilteredData(data);
    }, [sortOrder, typeFilter, emailFilter, recycleBinData]);

    const handleDetailsClick = (item) => {
        setSelectedItem(item);
        setDialogOpen(true);
    };

    const handleRestoreDialogOpen = (item) => {
        setItemToRestore(item);
        setRestoreDialogOpen(true);
    };

    const handleDeleteDialogOpen = (item) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedItem(null);
    };

    const handleRestoreDialogClose = () => {
        setRestoreDialogOpen(false);
        setItemToRestore(null);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleRestore = async () => {
        if (itemToRestore) {
            try {
                const equipmentRef = doc(db, 'equipment', itemToRestore.id);
                await setDoc(equipmentRef, itemToRestore);

                const recycleBinRef = doc(db, 'recycle_bin', itemToRestore.id);
                await deleteDoc(recycleBinRef);

                setRecycleBinData((prev) => prev.filter((data) => data.id !== itemToRestore.id));
                setFilteredData((prev) => prev.filter((data) => data.id !== itemToRestore.id));
            } catch (error) {
                console.error('Error restoring item:', error);
            }
        }
        handleRestoreDialogClose();
    };

    const handleDelete = async () => {
        if (itemToDelete) {
            try {
                const recycleBinRef = doc(db, 'recycle_bin', itemToDelete.id);
                await deleteDoc(recycleBinRef);

                setRecycleBinData((prev) => prev.filter((data) => data.id !== itemToDelete.id));
                setFilteredData((prev) => prev.filter((data) => data.id !== itemToDelete.id));
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
        handleDeleteDialogClose();
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Recycle Bin
            </Typography>
            <Box display="flex" justifyContent="space-between" marginBottom={3}>
                <FormControl style={{ minWidth: 150 }}>
                    <InputLabel>Sort By Date</InputLabel>
                    <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                </FormControl>
                <FormControl style={{ minWidth: 150 }}>
                    <InputLabel>Filter By Type</InputLabel>
                    <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <MenuItem value="">All Types</MenuItem>
                        {uniqueTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl style={{ minWidth: 150 }}>
                    <InputLabel>Filter By Email</InputLabel>
                    <Select value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)}>
                        <MenuItem value="">All Emails</MenuItem>
                        {uniqueEmails.map((email) => (
                            <MenuItem key={email} value={email}>
                                {email}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Grid container spacing={3}>
                {filteredData.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <StyledCard variant="outlined">
                            <CardContent>
                                <Typography variant="h6">{item.name}</Typography>
                                <Typography color="textSecondary">Serial: {item.serial_number}</Typography>
                                <Typography color="textSecondary">Type: {item.type}</Typography>
                                <Typography color="textSecondary">Brand: {item.brand}</Typography>
                            </CardContent>
                            <IconButton onClick={() => handleDetailsClick(item)} style={{ position: 'absolute', top: 10, right: 10 }}>
                                <InfoIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => handleRestoreDialogOpen(item)}
                                style={{ position: 'absolute', bottom: 10, right: 60, color: 'blue' }}
                            >
                                <RestoreIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => handleDeleteDialogOpen(item)}
                                style={{ position: 'absolute', bottom: 10, right: 10, color: 'red' }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>
            <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth>
                <DialogTitle>Details</DialogTitle>
                <DialogContent>
                    {selectedItem && (
                        <div>
                            <Typography variant="body1"><strong>Deleted By:</strong> {selectedItem.Deleted_By}</Typography>
                            <Typography variant="body1"><strong>Deleted Date:</strong> {selectedItem.Deleted_Date?.toDate().toString()}</Typography>
                            <Typography variant="body1"><strong>Brand:</strong> {selectedItem.brand}</Typography>
                            <Typography variant="body1"><strong>Serial Number:</strong> {selectedItem.serial_number}</Typography>
                            <Typography variant="body1"><strong>Type:</strong> {selectedItem.type}</Typography>
                            <Typography variant="body1"><strong>Name:</strong> {selectedItem.name}</Typography>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={restoreDialogOpen}
                onClose={handleRestoreDialogClose}
            >
                <DialogTitle>Are you sure you want to restore this item?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleRestoreDialogClose} color="secondary">Cancel</Button>
                    <Button onClick={handleRestore} color="primary">Yes, Restore</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
            >
                <DialogTitle>Are you sure you want to delete this item permanently?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose} color="secondary">Cancel</Button>
                    <Button onClick={handleDelete} color="primary">Yes, Delete</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Trash;
