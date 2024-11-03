import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const fetchStatusData = async () => {
    const querySnapshot = await getDocs(collection(db, 'equipmentRequests'));
    const statusData = {};

    querySnapshot.forEach((doc) => {
        const status = doc.data().status || 'Unknown';
        statusData[status] = (statusData[status] || 0) + 1;
    });

    return statusData;
};

export default fetchStatusData;
