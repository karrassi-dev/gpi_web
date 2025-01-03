import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Box, Card, Typography, Button, CircularProgress, Grid } from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';
import { QRCodeCanvas } from 'qrcode.react';

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
    const qrCodeRef = useRef(null);

    const requiredFields = [
        'start_time', 'end_time', 'email', 'name', 'type', 'user',
        'brand', 'reference', 'serial_number', 'processor', 'os', 'ram',
        'wireless_mouse', 'document_id', 'storage' // Include storage
    ];

    useEffect(() => {
        const fetchDataAndGenerateQrCode = async () => {
            setLoading(true);
            try {
                const equipmentQuery = query(collection(db, 'equipment'), where('serial_number', '==', equipmentId));
                const querySnapshot = await getDocs(equipmentQuery);

                if (!querySnapshot.empty) {
                    const docRef = querySnapshot.docs[0];
                    const data = docRef.data();

                    const filteredData = filterFields({ ...data, document_id: docRef.id }, requiredFields);

                    // Use plain serial_number for qr_data
                    const serialNumber = filteredData.serial_number;
                    console.log("QR Data (Plain Serial Number):", serialNumber);

                    // Update the QR data if it doesn't match the stored value
                    if (data.qr_data !== serialNumber) {
                        await updateDoc(doc(db, 'equipment', docRef.id), { qr_data: serialNumber });
                    }

                    // Set state with the filtered equipment data and qr_data
                    setEquipmentData({ ...filteredData, qr_data: serialNumber });
                } else {
                    setEquipmentData(null);
                }
            } catch (error) {
                console.error("Error fetching equipment data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDataAndGenerateQrCode();
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
        const canvas = qrCodeRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');

            const timestamp = new Date().toLocaleString().replace(/[/,:\s]/g, '-');
            const printTitle = `${equipmentData?.name || 'Equipment'} - QR Code - ${timestamp}`;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
              <html>
    <head>
        <title>${printTitle}</title>
        <style>
            @page {
                margin: 0; /* Removes default page margins */
            }
            body {
                margin: 0; /* Removes body margins */
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: flex-start; /* Align content to the top */
                align-items: flex-start; /* Align content to the left */
                position: relative;
                font-size: 0; /* Avoid any default spacing */
            }
            img {
                position: absolute;
                top: 0;
                right: 0;
                margin: 10px; /* Adds some space from the edge */
                width: 288px;
                height: 288px;
            }
        </style>
    </head>
    <body>
        <img src="${dataUrl}" alt="QR Code" />
    </body>
</html>

`);
            printWindow.document.close();
            printWindow.print();
        }
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
                            size={288}  // Set to 288x288 for exact match
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                            includeMargin
                            ref={qrCodeRef}
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
