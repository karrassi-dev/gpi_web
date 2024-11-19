import React, { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    updateDoc,
    doc,
    Timestamp,
    setDoc,
    arrayUnion
} from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    IconButton,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    Pagination,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ isRead: null, isAssigned: null, equipmentType: null });
    const [dateDescending, setDateDescending] = useState(true);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [assignmentSuccess, setAssignmentSuccess] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const equipmentTypes = ['Imprimante', 'Avaya', 'Point d’access', 'Switch', 'DVR', 'TV', 'Scanner', 'Routeur', 'Balanceur', 'Standard Téléphonique', 'Data Show', 'Desktop', 'Laptop', 'Notebook', 'VMware'];

    useEffect(() => {
        fetchRequests();
    }, [filters, dateDescending]);

    const fetchRequests = async () => {
        setLoading(true);
        const requestQuery = query(
            collection(db, 'equipmentRequests'),
            orderBy('requestDate', dateDescending ? 'desc' : 'asc')
        );
        const querySnapshot = await getDocs(requestQuery);
        const requestData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const filteredData = requestData.filter((request) => {
            const { isRead, isAssigned, equipmentType } = filters;

            const matchesReadStatus = isRead === null || request.isRead === isRead;
            const matchesAssignedStatus =
                isAssigned === null || (request.isAssigned === isAssigned || (isAssigned === false && !request.isAssigned));
            const matchesEquipmentType = equipmentType === null || request.equipmentType === equipmentType;

            return matchesReadStatus && matchesAssignedStatus && matchesEquipmentType;
        });

        setRequests(filteredData);
        setLoading(false);
    };

    const toggleDateOrder = () => setDateDescending(!dateDescending);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const handleAssignDialogOpen = (request) => {
        setSelectedRequest(request);
        setAssignDialogOpen(true);
    };

    const fetchAvailableEquipment = async (type) => {
        try {
            const equipmentQuery = query(
                collection(db, 'equipment'),
                where('type', '==', type),
                where('status', '==', 'Available') // Only fetch equipment with status "Available"
            );
            const equipmentSnapshot = await getDocs(equipmentQuery);
            const equipmentList = equipmentSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAvailableEquipment(equipmentList);
        } catch (error) {
            console.error("Error fetching available equipment:", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedRequest || !selectedEquipment) return;
    
        const now = Timestamp.now();
        try {
            const equipmentDoc = await getDoc(doc(db, 'equipment', selectedEquipment));
            const equipmentData = equipmentDoc.data();
    
            // Safely retrieve previousAdmin or set a default value
            const previousAdmin = equipmentData?.assignedBy || 'Unknown';
            const previousUser = equipmentData?.user || 'No previous user';
            const lastAssignedDate = equipmentData?.lastAssignedDate || null;
            const requestData = selectedRequest;
            const site = requestData.site;
    
            // Update the equipment request document
            await updateDoc(doc(db, 'equipmentRequests', selectedRequest.id), {
                assignedEquipment: selectedEquipment,
                assignedEquipmentDetails: {
                    brand: equipmentData.brand,
                    reference: equipmentData.reference,
                    serial_number: equipmentData.serial_number,
                },
                isAssigned: true,
                assignedBy: auth.currentUser?.email,
                assignedDate: now,
                status: 'Approved',
                isRead: true,
            });
    
            // Update the equipment document with the new user, department, and status
            await updateDoc(doc(db, 'equipment', selectedEquipment), {
                user: requestData.utilisateur,
                department: requestData.department,
                site,
                assignedBy: auth.currentUser?.email,
                lastAssignedDate: now,
                status: 'Affected', // Change status to "Affected"
            });
    
            // Update the history document if there's a last assigned date
            if (lastAssignedDate) {
                const durationInDays = Math.floor((now.toDate() - lastAssignedDate.toDate()) / (1000 * 60 * 60 * 24));
                await setDoc(
                    doc(db, 'HistoryOfEquipment', equipmentData.serial_number),
                    {
                        assignments: arrayUnion({
                            user: previousUser,
                            department: equipmentData.department,
                            admin: previousAdmin,
                            assignmentDate: lastAssignedDate,
                            durationInDays,
                        }),
                    },
                    { merge: true }
                );
            }
    
            // Close the dialog and refresh the requests
            setAssignDialogOpen(false);
            setAssignmentSuccess(true);
            fetchRequests();
    
            // Reset the success alert after 3 seconds
            setTimeout(() => setAssignmentSuccess(false), 3000);
        } catch (error) {
            console.error("Error assigning equipment:", error);
        }
    };
    
    
    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const paginatedRequests = requests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Box sx={{ padding: { xs: 2, md: 4 } }}>
            <Typography variant="h4" align="center" gutterBottom>
                Equipment Requests
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Read Status</InputLabel>
                        <Select
                            name="isRead"
                            value={filters.isRead}
                            onChange={handleFilterChange}
                            label="Read Status"
                        >
                            <MenuItem value={null}>All</MenuItem>
                            <MenuItem value={true}>Read</MenuItem>
                            <MenuItem value={false}>Unread</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Assigned Status</InputLabel>
                        <Select
                            name="isAssigned"
                            value={filters.isAssigned}
                            onChange={handleFilterChange}
                            label="Assigned Status"
                        >
                            <MenuItem value={null}>All</MenuItem>
                            <MenuItem value={true}>Assigned</MenuItem>
                            <MenuItem value={false}>Unassigned</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Equipment Type</InputLabel>
                        <Select
                            name="equipmentType"
                            value={filters.equipmentType}
                            onChange={handleFilterChange}
                            label="Equipment Type"
                        >
                            <MenuItem value={null}>All</MenuItem>
                            {equipmentTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <IconButton onClick={toggleDateOrder} sx={{ alignSelf: 'center' }}>
                    {dateDescending ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                </IconButton>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {paginatedRequests.map((request) => (
                            <Grid item xs={12} sm={6} md={4} key={request.id}>
                                <Card sx={{ borderRadius: 2, boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.2)' }}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary.main">
                                            {request.name || 'Unnamed Request'}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Status: <strong>{request.status || 'Pending'}</strong>
                                        </Typography>
                                        <Typography variant="body2">
                                            Requested on: {new Date(request.requestDate.seconds * 1000).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2">User: {request.utilisateur}</Typography>
                                        <Typography variant="body2">Type: {request.equipmentType}</Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'center' }}>
                                        <Button
                                            variant="contained"
                                            color={request.isAssigned ? 'success' : 'primary'}
                                            onClick={() => handleAssignDialogOpen(request)}
                                            disabled={request.isAssigned}
                                            sx={{ borderRadius: 2, width: '90%' }}
                                        >
                                            {request.isAssigned ? 'Assigned' : 'Assign Equipment'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box display="flex" justifyContent="center" mt={3}>
                        <Pagination
                            count={Math.ceil(requests.length / itemsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </>
            )}

            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                <DialogTitle>Assign Equipment</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        User: {selectedRequest?.utilisateur}
                    </Typography>
                    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                        <InputLabel>Select Equipment Type</InputLabel>
                        <Select
                            value={selectedType}
                            onChange={async (e) => {
                                setSelectedType(e.target.value);
                                await fetchAvailableEquipment(e.target.value);
                                setSelectedEquipment('');
                            }}
                            label="Select Equipment Type"
                        >
                            {equipmentTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                        <InputLabel>Select Equipment</InputLabel>
                        <Select
                            value={selectedEquipment}
                            onChange={(e) => setSelectedEquipment(e.target.value)}
                            label="Select Equipment"
                        >
                            {availableEquipment.map((equipment) => (
                                <MenuItem key={equipment.id} value={equipment.id}>
                                    {equipment.brand} - {equipment.type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAssign} color="primary" disabled={!selectedEquipment}>
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>

            {assignmentSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Equipment assigned successfully!
                </Alert>
            )}
        </Box>
    );
};

export default RequestsPage;
