import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Typography, Paper, Box } from '@mui/material';
import L from 'leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Custom icons for markers
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
});

const selectedIcon = new L.DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="41">
            <path fill="#28a745" d="M12 2C8.13 2 5 5.13 5 9c0 4.37 6.07 11.57 6.3 11.83a1.003 1.003 0 0 0 1.4 0C12.93 20.57 19 13.37 19 9c0-3.87-3.13-7-7-7zm0 9.75c-1.52 0-2.75-1.23-2.75-2.75S10.48 6.25 12 6.25 14.75 7.48 14.75 9 13.52 11.75 12 11.75z"/>
            </svg>`,
    className: '',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});


const locations = [
    { name: 'Agence Oujda', lat: 34.68, lon: -1.91 },
    { name: 'Agence Agadir', lat: 30.42, lon: -9.6 },
    { name: 'Agence Marrakech', lat: 31.63, lon: -8.0 },
    { name: 'Canal Food', lat: 33.4301024, lon: -7.8162922, address: 'zone indust du Sahel 26402 Had Soualem - Maroc' },
    { name: 'Agence Beni Mellal', lat: 32.33, lon: -6.36 },
    { name: 'Agence El Jadida', lat: 33.24, lon: -8.5 },
    { name: 'Agence Fès', lat: 34.03, lon: -5.0 },
    { name: 'Agence Tanger', lat: 35.78, lon: -5.83 },
    { name: 'BMZ', lat: 33.4309844, lon: -7.8190387, address: 'zone indust du Sahel 26402 Had Soualem - Maroc' },
    { name: 'STLZ', lat: 33.57, lon: -7.65, address: 'bd Moulay Ismaïl, hay Mohammadi - rue.1, bloc 16 20290 Casablanca - Maroc' },
    { name: 'Zine Céréales', lat: 33.4346276, lon: -7.8290593, address: 'عين صيرني حد السوالم، Soualem' },
    { name: 'Manafid Al Houboub', lat: 33.4337567, lon: -7.8278207, address: 'Km.175.4 Route 3011 - Bp 145, Had Soualem 26402' },
    { name: 'CALZ', lat: 33.4300732, lon: -7.8291225, address: 'Zone industrielle, Sahel Had soualem' },
    { name: 'LGMZL', lat: 33.53, lon: -7.64, address: 'Douar Lagwassem, Bouskoura' },
    { name: 'LGSZ', lat: 33.53, lon: -7.64, address: 'Zone industrielle, Ouled Saleh Bouskoura' },
    { name: 'LGMZB', lat: 33.4844628, lon: -7.6854808, address: 'Douar Lagwassem, Bouskoura' },
    { name: 'Savola', lat: 33.55, lon: -7.62, address: 'Rte De Marrakech, Zone Ind' },
    { name: 'Siège (Headquarters)', lat: 33.57, lon: -7.62, address: 'Lotissement La Colline II N°23, Sidi Maarouf, Casablanca, Morocco' },
];

const EquipmentMap = () => {
    const [equipmentCounts, setEquipmentCounts] = useState({});
    const [totalEquipment, setTotalEquipment] = useState(0);
    const [selectedLocations, setSelectedLocations] = useState([]); // Track selected locations
    const [isShiftPressed, setIsShiftPressed] = useState(false); // Track Shift key status

    // Fetch equipment data from Firestore
    useEffect(() => {
        const fetchData = async () => {
            const equipmentCollection = await getDocs(collection(db, 'equipment'));
            const counts = {};
            let total = 0;

            equipmentCollection.forEach(doc => {
                const data = doc.data();
                const site = data.site || 'Unknown';

                // Count equipment per site
                counts[site] = (counts[site] || 0) + 1;
                total += 1;
            });

            setEquipmentCounts(counts);
            setTotalEquipment(total);
        };

        fetchData();
    }, []);

    // Event listener for Shift key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Shift") setIsShiftPressed(true);
        };
        const handleKeyUp = (e) => {
            if (e.key === "Shift") setIsShiftPressed(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    // Toggle selection of locations
    const toggleLocationSelection = (location) => {
        setSelectedLocations(prevSelected =>
            prevSelected.includes(location)
                ? prevSelected.filter(item => item !== location)
                : [...prevSelected, location]
        );
    };

    // Calculate aggregated information for selected locations
    const getSelectedInfo = () => {
        let selectedCount = 0;
        let selectedPercentage = 0;

        selectedLocations.forEach(loc => {
            const count = equipmentCounts[loc.name] || 0;
            selectedCount += count;
            selectedPercentage += totalEquipment > 0 ? (count / totalEquipment) * 100 : 0;
        });

        return { selectedCount, selectedPercentage: selectedPercentage.toFixed(2) };
    };

    const { selectedCount, selectedPercentage } = getSelectedInfo();

    return (
        <Box position="relative" width="100%">
            <MapContainer center={[33.5731, -7.5898]} zoom={7} style={{ height: '500px', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

                {locations.map((location, index) => {
                    const count = equipmentCounts[location.name] || 0;
                    const percentage = totalEquipment > 0 ? ((count / totalEquipment) * 100).toFixed(2) : 0;
                    const isSelected = selectedLocations.includes(location);

                    return (
                        <Marker
                            key={index}
                            position={[location.lat, location.lon]}
                            icon={isSelected ? selectedIcon : customIcon}
                            eventHandlers={{
                                click: () => {
                                    if (isShiftPressed) {
                                        toggleLocationSelection(location);
                                    }
                                },
                            }}
                        >
                            <Popup>
                                <Paper elevation={3} style={{ padding: '10px', textAlign: 'center' }}>
                                    <Typography variant="h6" color="primary">
                                        {location.name}
                                    </Typography>
                                    {location.address && (
                                        <Typography variant="body2" color="textSecondary">
                                            {location.address}
                                        </Typography>
                                    )}
                                    <Typography variant="body1" color="textPrimary">
                                        Equipment Count: {count}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {percentage}% of Total
                                    </Typography>
                                    {!isShiftPressed && (
                                        <Typography
                                            variant="button"
                                            color={isSelected ? "secondary" : "primary"}
                                            onClick={() => toggleLocationSelection(location)}
                                            style={{ cursor: 'pointer', marginTop: '8px' }}
                                        >
                                            {isSelected ? "Deselect" : "Select"}
                                        </Typography>
                                    )}
                                </Paper>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Display selected locations information as overlay on the map */}
            <Paper elevation={3} style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '15px',
                minWidth: '200px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                zIndex: 1000 // Ensure it appears above the map
            }}>
                <Typography variant="h6">Selected Locations Info</Typography>
                <Typography variant="body1">Total Equipment Count: {selectedCount}</Typography>
                <Typography variant="body1">Percentage of Total: {selectedPercentage}%</Typography>
            </Paper>
        </Box>
    );
};

export default EquipmentMap;
