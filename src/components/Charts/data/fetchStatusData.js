// src/components/Charts/data/fetchStatusData.js

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const fetchStatusData = async (typeFilter = null) => {
    let q = collection(db, 'equipmentRequests');
    if (typeFilter) {
        q = query(q, where('equipmentType', '==', typeFilter));
    }

    const querySnapshot = await getDocs(q);
    const statusData = {};

    querySnapshot.forEach((doc) => {
        const status = doc.data().status || 'Unknown';
        statusData[status] = (statusData[status] || 0) + 1;
    });

    return statusData;
};

export default fetchStatusData;
