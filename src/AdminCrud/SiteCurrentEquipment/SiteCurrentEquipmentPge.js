import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {
    Container,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Pagination,
} from '@mui/material';
import './SiteCurrentEquipmentPage.css';

const SiteCurrentEquipmentPage = () => {
    const [site, setSite] = useState('');
    const [department, setDepartment] = useState('');
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const sites = [
        'Agence Oujda', 'Agence Agadir', 'Agence Marrakech', 'Canal Food',
        'Agence Beni Melal', 'Agence El Jadida', 'Agence Fes', 'Agence Tanger',
        'BMZ', 'STLZ', 'Zine Céréales', 'Manafid Al Houboub', 'CALZ', 'LGMZL',
        'LGSZ', 'LGMZB', 'LGMC', 'Savola', 'Siège'
    ];

    const departments = [
        'Maintenance', 'Qualité', 'Administration', 'Commercial', 'Caisse',
        'Chef d’agence', 'ADV', 'DOSI', 'DRH', 'Logistique', 'Contrôle de gestion',
        'Moyens généraux', 'GRC', 'Production', 'Comptabilité', 'Achat', 'Audit'
    ];

    useEffect(() => {
        const fetchEquipment = async () => {
            if (site) {
                setLoading(true);
                try {
                    // Create the query based on site and department selection
                    let equipmentQuery;
                    if (department) {
                        // Filter by both site and department if both are selected
                        equipmentQuery = query(
                            collection(db, 'equipment'),
                            where('site', '==', site),
                            where('department', '==', department)
                        );
                    } else {
                        // Filter by site only if department is not selected
                        equipmentQuery = query(
                            collection(db, 'equipment'),
                            where('site', '==', site)
                        );
                    }
                    
                    const querySnapshot = await getDocs(equipmentQuery);
                    const equipmentData = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setEquipmentList(equipmentData);
                } catch (error) {
                    console.error('Error fetching equipment data:', error);
                }
                setLoading(false);
                setCurrentPage(1); 
            }
        };

        fetchEquipment();
    }, [site, department]);


    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // Calculate items to display on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = equipmentList.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <Container maxWidth="md" style={{ padding: '20px' }}>
            <Typography variant="h4" align="center" gutterBottom>
                Equipment by Site and Department
            </Typography>

            <FormControl fullWidth margin="normal">
                <InputLabel>Site</InputLabel>
                <Select
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    label="Site"
                >
                    {sites.map((siteName) => (
                        <MenuItem key={siteName} value={siteName}>
                            {siteName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    label="Department"
                >
                    {departments.map((deptName) => (
                        <MenuItem key={deptName} value={deptName}>
                            {deptName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {loading ? (
                <div className="loading-container">
                    <CircularProgress />
                </div>
            ) : (
                <Grid container spacing={3} style={{ marginTop: '20px' }}>
                    {currentItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card className="equipment-card">
                                <CardContent>
                                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }}>
                                        {item.name || item.type}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        <strong>Brand:</strong> {item.brand || 'N/A'}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        <strong>Serial Number:</strong> {item.serial_number || 'N/A'}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        <strong>Processor:</strong> {item.processor || 'N/A'}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        <strong>RAM:</strong> {item.ram || 'N/A'} GB
                                    </Typography>
                                    <Typography color="textSecondary">
                                        <strong>Type:</strong> {item.type || 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}


            {/* Display message if no equipment found */}

            
            {site && !loading && equipmentList.length === 0 && (
                <Typography
                    variant="body1"
                    color="textSecondary"
                    style={{ textAlign: 'center', marginTop: '20px' }}
                >
                    No equipment found for the selected site and department.
                </Typography>
            )}

            {/* Pagination Component */}
            {equipmentList.length > itemsPerPage && (
                <Pagination
                    count={Math.ceil(equipmentList.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
                />
            )}
        </Container>
    );
};

export default SiteCurrentEquipmentPage;
