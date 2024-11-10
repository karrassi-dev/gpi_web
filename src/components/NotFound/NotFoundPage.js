// components/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Card, CardContent } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
    return (
        <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <motion.div 
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <Card elevation={3} sx={{ textAlign: 'center', p: 4, borderRadius: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
                            <Typography variant="h4" color="textPrimary" fontWeight="bold" gutterBottom>
                                Oops! Page Not Found
                            </Typography>
                            <Typography variant="body1" color="textSecondary" mb={4}>
                                Sorry, the page you’re looking for doesn’t exist or may have been moved.
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                size="large" 
                                component={Link} 
                                to="/admin-dashboard"
                                sx={{
                                    mt: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2
                                }}
                            >
                                Return to Homepage
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>
        </Container>
    );
};

export default NotFoundPage;
