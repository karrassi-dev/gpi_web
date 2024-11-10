import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';

const EmployeeDashboard = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f4f6f8',
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '90%',
          padding: 2,
          boxShadow: 3,
          borderRadius: 2,
          textAlign: 'center',
          bgcolor: '#ffffff',
        }}
      >
        <CardContent>
          <MobileFriendlyIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          <Typography variant="h5" color="textPrimary" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            This feature is accessible only on our mobile application. Please
            open the mobile app to continue.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="https://yourapp.link/download" 
            sx={{
              textTransform: 'none',
              paddingX: 4,
              paddingY: 1.5,
              borderRadius: 2,
            }}
          >
            Download Mobile App
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeDashboard;
