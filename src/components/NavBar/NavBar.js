import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Badge, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HistoryIcon from '@mui/icons-material/History';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LogoutIcon from '@mui/icons-material/Logout';
import { auth, db } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useTheme, useMediaQuery } from '@mui/material';

const NavBar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [historyAnchorEl, setHistoryAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const pathToIndex = {
        '/admin-dashboard': 0,
        '/admin-dashboard/register-equipment': 1,
        '/admin-dashboard/update-equipment': 2,
        '/admin-dashboard/add-user': 3,
        '/admin-dashboard/new-request': 5,
        '/admin-dashboard/scan-qr-code': 6,
    };

    const getSelectedIndex = () => {
        return pathToIndex[location.pathname] ?? 0;
    };

    const [selectedIndex, setSelectedIndex] = useState(getSelectedIndex);

    useEffect(() => {
        setSelectedIndex(getSelectedIndex());
    }, [location.pathname]);

    useEffect(() => {
        const requestsRef = collection(db, 'equipmentRequests');
        const pendingQuery = query(requestsRef, where('status', '==', 'Pending'));

        const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
            setPendingCount(snapshot.size);
        });

        return () => unsubscribe();
    }, []);

    const handleNavigationChange = (event, newValue) => {
        const path = Object.keys(pathToIndex).find((key) => pathToIndex[key] === newValue);
        if (path) {
            setSelectedIndex(newValue);
            navigate(path);
        }
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

    const handleHistoryHover = (event) => {
        setHistoryAnchorEl(event.currentTarget);
    };

    const handleHistoryClose = () => {
        setHistoryAnchorEl(null);
    };

    const handleHistoryOptionClick = (path) => {
        navigate(path);
        handleHistoryClose();
    };

    const navItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, index: 0 },
        { label: 'Register Equipment', icon: <AddIcon />, index: 1 },
        { label: 'Update Equipment', icon: <UpdateIcon />, index: 2 },
        { label: 'Add User', icon: <PersonAddIcon />, index: 3 },
        { label: 'New Request', icon: <NewReleasesIcon />, index: 5 },
        { label: 'Scan QR Code', icon: <QrCodeScannerIcon />, index: 6 },
        { label: 'Log Out', icon: <LogoutIcon />, action: handleLogout, color: 'error' },
    ];

    return (
        <>
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
                    <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                        <List>
                            {navItems.map((item) => (
                                <ListItem
                                    button
                                    key={item.index}
                                    selected={selectedIndex === item.index}
                                    onClick={item.action || (() => handleNavigationChange(null, item.index))}
                                >
                                    <ListItemIcon sx={{ color: item.color || 'inherit' }}>
                                        {item.index === 5 ? (
                                            <Badge badgeContent={pendingCount} color="error">
                                                {item.icon}
                                            </Badge>
                                        ) : (
                                            item.icon
                                        )}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItem>
                            ))}
                            <ListItem button onMouseEnter={handleHistoryHover}>
                                <ListItemIcon>
                                    <HistoryIcon />
                                </ListItemIcon>
                                <ListItemText primary="History" />
                            </ListItem>
                        </List>
                    </Drawer>
                    <Menu
                        anchorEl={historyAnchorEl}
                        open={Boolean(historyAnchorEl)}
                        onClose={handleHistoryClose}
                        onMouseLeave={handleHistoryClose}
                    >
                        <MenuItem onClick={() => handleHistoryOptionClick('/admin-dashboard/history/equipment')}>
                            Equipment History
                        </MenuItem>
                        <MenuItem onClick={() => handleHistoryOptionClick('/admin-dashboard/history/current-users')}>
                            Current Users
                        </MenuItem>
                        <MenuItem onClick={() => handleHistoryOptionClick('/admin-dashboard/history/current-site')}>
                            Current Site
                        </MenuItem>
                    </Menu>
                </>
            ) : (
                <BottomNavigation
                    value={selectedIndex}
                    onChange={(event, newValue) => handleNavigationChange(event, newValue)}
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
                            icon={
                                item.index === 5 ? (
                                    <Badge badgeContent={pendingCount} color="error">
                                        {item.icon}
                                    </Badge>
                                ) : (
                                    item.icon
                                )
                            }
                            value={item.index}
                        />
                    ))}
                    <BottomNavigationAction
                        label="History"
                        icon={<HistoryIcon />}
                        onMouseEnter={handleHistoryHover}
                    />
                    <BottomNavigationAction
                        label="Log Out"
                        icon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{ color: 'red' }}
                    />
                    <Menu
                        anchorEl={historyAnchorEl}
                        open={Boolean(historyAnchorEl)}
                        onClose={handleHistoryClose}
                        onMouseLeave={handleHistoryClose}
                    >
                        <MenuItem onClick={() => handleHistoryOptionClick('/admin-dashboard/history/equipment')}>
                            Equipment History
                        </MenuItem>
                        <MenuItem onClick={() => handleHistoryOptionClick('/admin-dashboard/history/current-users')}>
                            Current Users
                        </MenuItem>
                        <MenuItem onClick={() => handleHistoryOptionClick('/admin-dashboard/history/current-site')}>
                            Current Site
                        </MenuItem>
                    </Menu>
                </BottomNavigation>
            )}
        </>
    );
};

export default NavBar;
