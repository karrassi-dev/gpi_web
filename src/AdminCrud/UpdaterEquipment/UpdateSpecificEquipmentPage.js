import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { TextField, Button, Box, CircularProgress, MenuItem, Typography } from '@mui/material';
import CryptoJS from 'crypto-js';

// Encryption constants (must match ViewEquipmentDetailsPage)
const ENCRYPTION_KEY = 'S3cur3P@ssw0rd123!';
const IV = '16-Bytes---IVKey';

// Encryption function to match ViewEquipmentDetailsPage setup
const encryptData = (data) => {
    const key = CryptoJS.enc.Utf8.parse(CryptoJS.MD5(ENCRYPTION_KEY).toString());
    const iv = CryptoJS.enc.Utf8.parse(IV);
    return CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
};

// Filter required fields for encryption
const filterFields = (data, equipmentId) => ({
    start_time: data.start_time || "N/A",
    end_time: data.end_time || "N/A",
    email: data.email || "N/A",
    name: data.name || "N/A",
    type: data.type || "N/A",
    user: data.user || "N/A",
    brand: data.brand || "N/A",
    reference: data.reference || "N/A",
    serial_number: data.serial_number || "N/A",
    processor: data.processor || "N/A",
    os: data.os || "N/A",
    ram: data.ram || "N/A",
    wireless_mouse: data.wireless_mouse || "N/A",
    document_id: equipmentId,
    storage: data.storage
});

const UpdateSpecificEquipmentPage = () => {
    const { equipmentId } = useParams();
    const navigate = useNavigate();
    const [equipmentData, setEquipmentData] = useState(null);
    const [loading, setLoading] = useState(true);

    const typeOptions = [
        'imprimante', 'avaya', 'point d’access', 'switch', 'DVR', 'TV', 
        'scanner', 'routeur', 'balanceur', 'standard téléphonique',
        'data show', 'desktop', 'laptop'
    ];

    const departmentOptions = [
        'maintenance', 'qualité', 'administration', 'commercial', 'caisse', 
        'chef d’agence', 'ADV', 'DOSI', 'DRH', 'logistique', 'contrôle de gestion',
        'moyens généraux', 'GRC', 'production', 'comptabilité', 'achat', 'audit'
    ];

    const siteOptions = [
        'Agence Oujda', 'Agence Agadir', 'Agence Marrakech', 'Canal Food',
        'Agence Beni Melal', 'Agence El Jadida', 'Agence Fes', 'Agence Tanger',
        'BMZ', 'STLZ', 'Zine Céréales', 'Manafid Al Houboub', 'CALZ', 'LGMZL',
        'LGSZ', 'LGMZB', 'LGMC', 'Savola', 'Siège'
    ];

    const statusOptions = ["Available", "en_maintenance", "in_service"]

    const brandOptions = ['HP', 'asus', 'toshiba', 'MacBook'];

    useEffect(() => {
        const fetchEquipmentData = async () => {
            try {
                const equipmentRef = doc(db, 'equipment', equipmentId);
                const docSnapshot = await getDoc(equipmentRef);
                if (docSnapshot.exists()) {
                    setEquipmentData(docSnapshot.data());
                } else {
                    alert("Equipment not found");
                }
            } catch (error) {
                console.error("Error fetching equipment data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipmentData();
    }, [equipmentId]);

    const handleUpdate = async () => {
        if (!equipmentData) return;

        try {
            // Filter data and encrypt only specified fields
            const filteredData = filterFields(equipmentData, equipmentId);
            const encryptedQRData = encryptData(filteredData);

            // Update Firestore with encrypted `qr_data`
            const updatedData = { ...equipmentData, qr_data: encryptedQRData };
            const equipmentRef = doc(db, 'equipment', equipmentId);
            await updateDoc(equipmentRef, updatedData);

            // Navigate back after updating
            navigate('/admin-dashboard/update-equipment');
        } catch (error) {
            console.error("Error updating equipment:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEquipmentData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box padding={2}>
            {equipmentData ? (
                <>
                    <TextField
                        name="start_time"
                        label="Date de debut"
                        type="datetime-local"
                        value={equipmentData.start_time || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />

                    <TextField
                        name="end_time"
                        label="Date de fin"
                        type="datetime-local"
                        value={equipmentData.end_time || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />

                    <TextField name="email" label="Address de messagerie" value={equipmentData.email || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="name" label="Name" value={equipmentData.name || ''} onChange={handleChange} fullWidth margin="normal" />
                    
                    {/* Site Dropdown */}
                    <TextField
                        name="site"
                        label="Site"
                        value={equipmentData.site || ''}
                        onChange={handleChange}
                        select
                        fullWidth
                        margin="normal"
                    >
                        {siteOptions.map((site) => (
                            <MenuItem key={site} value={site}>
                                {site}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        name="type"
                        label="Type"
                        value={equipmentData.type || ''}
                        onChange={handleChange}
                        select
                        fullWidth
                        margin="normal"
                    >
                        {typeOptions.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField name="user" label="User" value={equipmentData.user || ''} onChange={handleChange} fullWidth margin="normal" />
                    {/* Brand Dropdown */}
                    <TextField
                        name="brand"
                        label="Brand"
                        value={equipmentData.brand || ''}
                        onChange={handleChange}
                        select
                        fullWidth
                        margin="normal"
                    >
                        {brandOptions.map((brand) => (
                            <MenuItem key={brand} value={brand}>
                                {brand}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField name="reference" label="Reference" value={equipmentData.reference || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="serial_number" label="Serial Number" value={equipmentData.serial_number || ''} onChange={handleChange} fullWidth margin="normal" InputProps={{ readOnly: true }} />
                    <TextField name="processor" label="Processor" value={equipmentData.processor || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="os" label="Operating System" value={equipmentData.os || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="ram" label="RAM" value={equipmentData.ram || ''} onChange={handleChange} fullWidth margin="normal" />
                    <TextField name="storage" label="Storage" value={equipmentData.storage || ''} onChange={handleChange} fullWidth margin="normal" />

                    <TextField
                        name="department"
                        label="Department"
                        value={equipmentData.department || ''}
                        onChange={handleChange}
                        select
                        fullWidth
                        margin="normal"
                    >
                        {departmentOptions.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                                {dept}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField name="status" label="Status" value={equipmentData.status || ''} onChange={handleChange} select fullWidth margin="normal" >
                        {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField name="inventory_number_lpt" label="Inventory Number LPT" value={equipmentData.inventory_number_lpt || ''} onChange={handleChange} fullWidth margin="normal" />
                    <Button variant="contained" color="primary" onClick={handleUpdate} fullWidth sx={{ marginTop: 2 }}>
                        Save Changes
                    </Button>
                </>
            ) : (
                <Typography variant="h6" color="textSecondary" align="center">
                    Equipment data not found.
                </Typography>
            )}
        </Box>
    );
};

export default UpdateSpecificEquipmentPage;
