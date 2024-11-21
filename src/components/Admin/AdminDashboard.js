import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from '../NavBar/NavBar';
import RegisterEquipment from '../../AdminCrud/RegisterEquipment/RegisterEquipment';
import AddUserForm from '../../AdminCrud/AddUser/AddUserForm';
import EquipmentHistoryPage from '../../AdminCrud/EquipmentHistory/EquipmentHistoryPage';
import EquipmentHistoryDetailPage from '../../AdminCrud/EquipmentHistory/EquipmentHistoryDetailPage';
import UpdaterEquipment from '../../AdminCrud/UpdaterEquipment/UpdaterEquipment';
import ViewEquipmentDetailsPage from '../../AdminCrud/UpdaterEquipment/ViewEquipmentDetailsPage';
import UpdateSpecificEquipmentPage from '../../AdminCrud/UpdaterEquipment/UpdateSpecificEquipmentPage';
import RequestsPage from '../Requests/RequestsPage'
import DashboardPage from './DashboardPage';
import  QrScanner  from '../QrScanner/QrScanner';
import EquipmentTypePieChart from '../Charts/EquipmentTypePieChart'
import EquipmentCurrentUserPage from '../../AdminCrud/EquipmentCurrentUser/EquipmentCurrentUserPage'
import SiteCurrentEquipmentPge from '../../AdminCrud/SiteCurrentEquipment/SiteCurrentEquipmentPge'
import "./AdminDashboard.css";
import Trash from '../Trash/Trash';

const AdminDashboard = () => {
    return (
        <div>
            <NavBar />
            <div className="content-wrapper">
                <Routes>
                    <Route path="/admin-dashboard" element={<DashboardPage />} />
                    <Route path="/" element={<DashboardPage />} />
                    {/* <Route path="/admin-dashboard" element={<EquipmentTypePieChart data={mockData} onSectionTapped={handleSectionTap} onLegendTapped={handleLegendTap} />} /> */}

                    <Route path="register-equipment" element={<RegisterEquipment />} />
                    <Route path="add-user" element={<AddUserForm />} />
                    <Route path="history/equipment" element={<EquipmentHistoryPage />} /> 
                    <Route path="history/current-users" element={<EquipmentCurrentUserPage />} /> 
                    <Route path="history/current-site" element={<SiteCurrentEquipmentPge />} /> 
                    <Route path="history/equipment-history/:equipmentId" element={<EquipmentHistoryDetailPage />} />
                    <Route path="update-equipment" element={<UpdaterEquipment />} /> 
                    <Route path="update-equipment/view-equipment/:equipmentId" element={<ViewEquipmentDetailsPage />} /> 
                    <Route path="update-equipment/update-equipment/:equipmentId" element={<UpdateSpecificEquipmentPage />} /> 
                    <Route path="new-request" element={<RequestsPage />} /> 
                    <Route path="scan-qr-code" element={<QrScanner />} /> 
                    <Route path="trash" element={<Trash />} /> 
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;
