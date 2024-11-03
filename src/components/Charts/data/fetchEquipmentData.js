// src/components/Charts/data/fetchEquipmentData.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const fetchEquipmentData = async () => {
    const querySnapshot = await getDocs(collection(db, 'equipment'));
    const equipmentData = {};

    querySnapshot.forEach((doc) => {
        const type = doc.data().type || 'Unknown';
        equipmentData[type] = (equipmentData[type] || 0) + 1; // Count each type
    });

    return equipmentData;
};

export default fetchEquipmentData;
