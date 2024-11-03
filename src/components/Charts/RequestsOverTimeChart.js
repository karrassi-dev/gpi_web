import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { db } from '../../firebaseConfig';

const RequestsOverTimeChart = () => {
    const [data, setData] = useState([]); // Initialize as an empty array

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await db.collection('equipmentRequests').get();
                const chartData = snapshot.docs.map(doc => doc.data()); // Map over the Firestore data
                setData(chartData); // Set fetched data
            } catch (error) {
                console.error("Error fetching data:", error);
                setData([]); // Set data to an empty array on error
            }
        };

        fetchData();
    }, []);

    if (!Array.isArray(data)) {
        console.warn("Expected `data` to be an array but received:", data);
        return <div>No data available</div>;
    }

    return (
        <Line
            data={{
                labels: data.map(item => item.date), // Replace `date` with your field
                datasets: [
                    {
                        label: 'Requests Over Time',
                        data: data.map(item => item.value), // Replace `value` with your field
                        fill: false,
                        backgroundColor: 'rgba(75,192,192,1)',
                        borderColor: 'rgba(75,192,192,1)',
                    },
                ],
            }}
        />
    );
};

export default RequestsOverTimeChart;
