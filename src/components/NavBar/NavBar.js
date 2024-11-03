import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';
import NewReleasesIcon from '@mui/icons-material/NewReleases'; // New icon for "New Request"
import LogoutIcon from '@mui/icons-material/Logout';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useTheme, useMediaQuery } from '@mui/material';

const NavBar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Define path mappings to indices
    const pathToIndex = {
        '/admin-dashboard': 0,
        '/admin-dashboard/register-equipment': 1,
        '/admin-dashboard/update-equipment': 2,
        '/admin-dashboard/add-user': 3,
        '/admin-dashboard/history': 4,
        '/admin-dashboard/new-request': 5, // Add path for new request
    };

    // Function to calculate the selected index based on the exact current path
    const getSelectedIndex = () => {
        if (location.pathname === '/admin-dashboard') {
            return pathToIndex['/admin-dashboard'];
        }

        const matchingPath = Object.keys(pathToIndex).find(
            (path) => location.pathname.startsWith(path) && path !== '/admin-dashboard'
        );

        return matchingPath ? pathToIndex[matchingPath] : 0;
    };

    const [selectedIndex, setSelectedIndex] = useState(getSelectedIndex);

    useEffect(() => {
        setSelectedIndex(getSelectedIndex());
    }, [location.pathname]);

    const handleNavigationChange = (event, newValue) => {
        setSelectedIndex(newValue);
        setDrawerOpen(false); // Close the drawer if on mobile

        const path = Object.keys(pathToIndex).find((key) => pathToIndex[key] === newValue);
        if (path) navigate(path);
    };

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                localStorage.clear();
                navigate('/');
            })
            .catch((error) => {
                console.error("Logout error:", error);
            });
    };

    const navItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, index: 0 },
        { label: 'Register Equipment', icon: <AddIcon />, index: 1 },
        { label: 'Update Equipment', icon: <UpdateIcon />, index: 2 },
        { label: 'Add User', icon: <PersonAddIcon />, index: 3 },
        { label: 'History', icon: <HistoryIcon />, index: 4 },
        { label: 'New Request', icon: <NewReleasesIcon />, index: 5 }, // New request button
        { label: 'Log Out', icon: <LogoutIcon />, action: handleLogout, color: 'error' },
    ];

    return (
        <>
            {/* Mobile Drawer */}
            {isMobile ? (
                <>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            position: 'fixed',
                            top: 10,
                            left: 10,
                            zIndex: 1300,
                            backgroundColor: 'white',
                            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Drawer
                        anchor="left"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                    >
                        <List>
                            {navItems.map((item, index) => (
                                <ListItem
                                    button
                                    key={index}
                                    selected={selectedIndex === item.index}
                                    onClick={item.action || (() => handleNavigationChange(null, item.index))}
                                >
                                    <ListItemIcon sx={{ color: item.color || 'inherit' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItem>
                            ))}
                        </List>
                    </Drawer>
                </>
            ) : (
                // Desktop BottomNavigation
                <BottomNavigation
                    value={selectedIndex}
                    onChange={handleNavigationChange}
                    showLabels
                    sx={{
                        position: 'fixed',
                        top: 0,
                        width: '100%',
                        backgroundColor: '#f5f5f5',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                    }}
                >
                    {navItems.slice(0, -1).map((item) => (
                        <BottomNavigationAction
                            key={item.index}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                    <BottomNavigationAction
                        label="Log Out"
                        icon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{
                            color: 'red' // Sets the icon and label color to red
                        }}
                    />
                </BottomNavigation>
            )}
        </>
    );
};

export default NavBar;
