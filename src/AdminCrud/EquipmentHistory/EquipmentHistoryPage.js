import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, Button, TextField, CircularProgress, Box, Typography, Autocomplete } from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const EquipmentHistoryPage = () => {
    const navigate = useNavigate();
    const [typeOptions] = useState([
        'imprimante', 'avaya', 'point d’access', 'switch', 'DVR', 'TV',
        'scanner', 'routeur', 'balanceur', 'standard téléphonique',
        'data show', 'desktop', 'laptop'
    ]);
    const [selectedType, setSelectedType] = useState('');
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [equipmentMap, setEquipmentMap] = useState({});
    const [searchOptions, setSearchOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch equipment list by type
    const fetchEquipmentList = async (type) => {
        setLoading(true);
        setError('');
        try {
            const equipmentRef = collection(db, 'equipment');
            const q = query(equipmentRef, where('type', '==', type));
            const equipmentSnapshot = await getDocs(q);

            const equipmentList = {};
            equipmentSnapshot.forEach((doc) => {
                equipmentList[doc.id] = doc.data().brand || 'Unknown Brand';
            });
            setEquipmentMap(equipmentList);
        } catch (err) {
            setError('Failed to fetch equipment data. Please try again.');
            console.error("Error fetching equipment:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all equipment for search field suggestions
    const fetchAllEquipmentForSearch = async () => {
        setLoading(true);
        try {
            const equipmentRef = collection(db, 'equipment');
            const equipmentSnapshot = await getDocs(equipmentRef);

            const searchList = [];
            equipmentSnapshot.forEach((doc) => {
                const data = doc.data();
                searchList.push({
                    id: doc.id,
                    label: `${data.brand || 'Unknown Brand'} - ${data.serial_number}`,
                    brand: data.brand,
                    serial_number: data.serial_number
                });
            });
            setSearchOptions(searchList);
        } catch (err) {
            console.error("Error fetching equipment for search:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllEquipmentForSearch();
    }, []);

    const handleTypeChange = (event) => {
        const type = event.target.value;
        setSelectedType(type);
        setSelectedEquipmentId('');
        fetchEquipmentList(type);
    };

    const handleBrandChange = (event) => {
        setSelectedEquipmentId(event.target.value);
    };

    const showEquipmentHistory = () => {
        if (selectedEquipmentId) {
            navigate(`/admin-dashboard/history/equipment-history/${selectedEquipmentId}`);
        }
    };

    // Dynamically filter options as the user types each letter
    const filterOptions = (options, { inputValue }) => {
        const normalizedInput = inputValue.toLowerCase();

        // Find exact matches first
        const exactMatches = options.filter((option) => 
            (option.serial_number && option.serial_number.toLowerCase() === normalizedInput) ||
            (option.brand && option.brand.toLowerCase() === normalizedInput)
        );

        // If exact matches are found, return only those
        if (exactMatches.length > 0) {
            return exactMatches;
        }

        // Otherwise, return partial matches
        return options.filter((option) => 
            (option.serial_number && option.serial_number.toLowerCase().includes(normalizedInput)) ||
            (option.brand && option.brand.toLowerCase().includes(normalizedInput))
        );
    };

    // Update selected equipment ID based on search selection
    const handleSearchChange = (event, value) => {
        setSelectedEquipmentId(value ? value.id : '');
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Equipment History
            </Typography>
            {error && <Typography color="error">{error}</Typography>}

            {/* Dropdown for Equipment Type */}
            <TextField
                select
                label="Select Equipment Type"
                value={selectedType}
                onChange={handleTypeChange}
                fullWidth
                margin="normal"
            >
                {typeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                        {type}
                    </MenuItem>
                ))}
            </TextField>

            {/* Dropdown for Equipment Brand based on selected type */}
            <TextField
                select
                label="Select Equipment by Brand"
                value={selectedEquipmentId}
                onChange={handleBrandChange}
                fullWidth
                margin="normal"
                disabled={!selectedType || loading}
            >
                {Object.entries(equipmentMap).map(([id, brand]) => (
                    <MenuItem key={id} value={id}>
                        {brand}
                    </MenuItem>
                ))}
            </TextField>

            {/* Separate Search Field for Brand or Serial Number */}
            <Autocomplete
                options={searchOptions}
                getOptionLabel={(option) => option.label}
                onChange={handleSearchChange}
                filterOptions={filterOptions} // Custom filter function
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search by Brand or Serial Number"
                        fullWidth
                        margin="normal"
                        disabled={loading}
                    />
                )}
            />

            <Button
                variant="contained"
                color="primary"
                onClick={showEquipmentHistory}
                disabled={!selectedEquipmentId}
                fullWidth
                sx={{ mt: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Show Equipment History'}
            </Button>
        </Box>
    );
};

export default EquipmentHistoryPage;
