import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Box, Card, Typography, Button, CircularProgress, Grid } from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';
import CryptoJS from 'crypto-js';

// Encryption constants
const ENCRYPTION_KEY = 'S3cur3P@ssw0rd123!';
const IV = '16-Bytes---IVKey';

// Encryption helper to match Dart encryption setup
const encryptData = (data) => {
    const key = CryptoJS.enc.Utf8.parse(CryptoJS.MD5(ENCRYPTION_KEY).toString());
    const iv = CryptoJS.enc.Utf8.parse(IV);
    const encrypted = CryptoJS.AES.encrypt(data, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
};

// Decrypt function for QR data
const decryptData = (encryptedData) => {
    const key = CryptoJS.enc.Utf8.parse(CryptoJS.MD5(ENCRYPTION_KEY).toString());
    const iv = CryptoJS.enc.Utf8.parse(IV);
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
};

// Filter required fields
const filterFields = (data, fields) => {
    const filteredData = {};
    fields.forEach((field) => {
        filteredData[field] = data[field] || 'N/A';
    });
    return filteredData;
};

const ViewEquipmentDetailsPage = () => {
    const { equipmentId } = useParams();
    const [equipmentData, setEquipmentData] = useState(null);
    const [loading, setLoading] = useState(true);

    const requiredFields = [
        'start_time', 'end_time', 'email', 'name', 'type', 'user',
        'brand', 'reference', 'serial_number', 'processor', 'os', 'ram',
        'wireless_mouse', 'document_id'
    ];

    useEffect(() => {
        const fetchAndEncryptData = async () => {
            setLoading(true);
            try {
                const equipmentQuery = query(collection(db, 'equipment'), where('serial_number', '==', equipmentId));
                const querySnapshot = await getDocs(equipmentQuery);

                if (!querySnapshot.empty) {
                    const docRef = querySnapshot.docs[0];
                    const data = docRef.data();

                    // Filter data to include only the required fields
                    const filteredData = filterFields({ ...data, document_id: docRef.id }, requiredFields);

                    // Encrypt filtered data if QR data is missing and save it in Firestore
                    if (!data.qr_data) {
                        const plainData = JSON.stringify(filteredData);
                        const encryptedQRData = encryptData(plainData);

                        await updateDoc(doc(db, 'equipment', docRef.id), { qr_data: encryptedQRData });
                        setEquipmentData({ ...filteredData, qr_data: encryptedQRData });
                    } else {
                        setEquipmentData({ ...filteredData, qr_data: data.qr_data });
                    }
                } else {
                    setEquipmentData(null);
                }
            } catch (error) {
                console.error("Error fetching equipment data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndEncryptData();
    }, [equipmentId]);

    const downloadQRCode = () => {
        const canvas = document.getElementById('qrcode');
        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${equipmentData?.name || 'equipment'}_QRCode.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const printQRCode = () => {
        window.print();
    };

    if (loading) return <CircularProgress sx={{ marginTop: 5 }} />;

    return (
        <Box padding={2} maxWidth="800px" margin="auto">
            {equipmentData ? (
                <>
                    <Typography variant="h4" gutterBottom align="center">
                        Equipment Details
                    </Typography>

                    <Grid container spacing={3}>
                        {Object.entries(equipmentData).map(([key, value]) =>
                            key !== 'qr_data' && (
                                <Grid item xs={12} sm={6} md={4} key={key}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            padding: 2,
                                            textAlign: 'center',
                                            borderRadius: 3,
                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
                                            },
                                        }}
                                    >
                                        <Typography variant="subtitle1" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                                            {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ marginTop: 1 }}>
                                            {value !== 'N/A' ? value : 'N/A'}
                                        </Typography>
                                    </Card>
                                </Grid>
                            )
                        )}
                    </Grid>

                    <Card
                        variant="outlined"
                        sx={{
                            padding: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop: 4,
                            borderRadius: 3,
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
                            },
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            QR Code
                        </Typography>
                        <QRCodeCanvas
                            id="qrcode"
                            value={equipmentData.qr_data || 'No QR data'}
                            size={180}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            includeMargin
                        />
                        <Box display="flex" gap={2} marginTop={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={downloadQRCode}
                            >
                                Download QR
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<PrintIcon />}
                                onClick={printQRCode}
                            >
                                Print QR
                            </Button>
                        </Box>
                    </Card>
                </>
            ) : (
                <Typography variant="body1" color="textSecondary" align="center" marginTop={5}>
                    No equipment data found.
                </Typography>
            )}
        </Box>
    );
};

export default ViewEquipmentDetailsPage;