import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, Button, TextField, CircularProgress, Box, Typography } from '@mui/material';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Equipment History
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
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
