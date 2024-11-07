import React, { useState } from 'react';
import QrReader from 'qrcode-reader';
import CryptoJS from 'crypto-js';
import { Box, Typography, Card, IconButton, Dialog, DialogTitle, DialogContent, Divider, Grid, CircularProgress, Button } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

// Encryption constants
const ENCRYPTION_KEY = CryptoJS.MD5("S3cur3P@ssw0rd123!").toString();
const IV = CryptoJS.enc.Utf8.parse("16-Bytes---IVKey");

const QrScanner = () => {
    const [qrResult, setQrResult] = useState(null); // Store decrypted QR code result
    const [dialogOpen, setDialogOpen] = useState(false); // Control result dialog visibility
    const [loading, setLoading] = useState(false); // Loading state for file upload and decryption
    const navigate = useNavigate();

    const onFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => decodeQrCode(img);
        };
        reader.readAsDataURL(file);
    };

    const decodeQrCode = (img) => {
        const qr = new QrReader();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);

        const imageData = context.getImageData(0, 0, img.width, img.height);
        qr.callback = (error, result) => {
            if (error) {
                console.error("QR code decoding error:", error);
                setQrResult("Error: QR code not found.");
                setDialogOpen(true);
            } else {
                const decryptedData = decryptData(result.result);
                setQrResult(decryptedData);
                setDialogOpen(true);
            }
            setLoading(false);
        };
        qr.decode(imageData);
    };

    const decryptData = (encryptedText) => {
        try {
            console.log("Attempting to decrypt:", encryptedText); // Log the encrypted text

            const bytes = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY), {
                iv: IV,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
            });

            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

            // Check if decryption was successful
            if (!decryptedText) {
                throw new Error("Failed to decrypt data");
            }

            return JSON.parse(decryptedText);
        } catch (error) {
            console.error("Decryption failed:", error);
            return "Error: Decryption failed";
        }
    };

    const handleEdit = () => {
        navigate(`/admin-dashboard/update-equipment/update-equipment/${qrResult.document_id}`);
    };

    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            minHeight="100vh" 
            bgcolor="#f9f9f9"
            p={2}
        >
            <Card
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4,
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: 5,
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: '#ffffff'
                }}
            >
                <Typography variant="h5" gutterBottom color="primary">
                    Upload and Scan QR Code
                </Typography>
                <Divider sx={{ width: '80%', my: 2 }} />
                <IconButton 
                    component="label" 
                    color="primary" 
                    sx={{ 
                        bgcolor: 'rgba(25, 118, 210, 0.1)', 
                        padding: 4, 
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' },
                        mb: 2 
                    }}
                >
                    <UploadIcon fontSize="large" />
                    <input type="file" hidden accept="image/*" onChange={onFileUpload} />
                </IconButton>
                <Typography variant="body1" color="textSecondary">
                    Click to upload an image with a QR code
                </Typography>
                {loading && <CircularProgress sx={{ mt: 2 }} />}
            </Card>

            {/* QR Code Result Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Decrypted Equipment Details
                    <IconButton onClick={handleEdit} sx={{ ml: 2 }}>
                        <EditIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {qrResult && typeof qrResult === "object" ? (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {Object.entries(qrResult).map(([key, value]) => (
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
                                            {key.replace('_', ' ')}
                                        </Typography>
                                        <Typography variant="body1" sx={{ marginTop: 1 }}>
                                            {value !== 'N/A' ? value : 'N/A'}
                                        </Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography>{qrResult}</Typography> // Display plain text or error message
                    )}
                    <Box textAlign="center" mt={3}>
                        <Button onClick={() => setDialogOpen(false)} color="primary" variant="contained">
                            Close
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default QrScanner;
