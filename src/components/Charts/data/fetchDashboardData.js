// src/AdminCrud/Dashboard/data/fetchDashboardData.js

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

export const fetchDashboardData = async () => {
    const equipmentRequests = await getDocs(collection(db, 'equipmentRequests'));
    const data = { equipmentTypeCounts: {}, statusCounts: {}, requesterCounts: {}, requestsOverTime: {} };

    equipmentRequests.forEach(doc => {
        const request = doc.data();

        // Process equipmentTypeCounts
        const type = request.equipmentType || 'Unknown';
        data.equipmentTypeCounts[type] = (data.equipmentTypeCounts[type] || 0) + 1;

        // Process statusCounts
        const status = request.status || 'Unknown';
        data.statusCounts[status] = (data.statusCounts[status] || 0) + 1;

        // Process requesterCounts
        const requester = request.requester || 'Unknown';
        data.requesterCounts[requester] = (data.requesterCounts[requester] || 0) + 1;

        // Process requestsOverTime (time-series data can be added if needed)
    });

    return data;
};
