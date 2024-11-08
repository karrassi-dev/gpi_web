import React, { useState } from "react";
import { db } from "../../firebaseConfig";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import CryptoJS from "crypto-js";
import "./RegisterEquipment.css";

// Encryption constants
const ENCRYPTION_KEY = 'S3cur3P@ssw0rd123!';
const IV = '16-Bytes---IVKey';

// Function to encrypt data using AES with CBC mode
const encryptData = (data) => {
    const key = CryptoJS.enc.Utf8.parse(CryptoJS.MD5(ENCRYPTION_KEY).toString());
    const iv = CryptoJS.enc.Utf8.parse(IV);
    const encrypted = CryptoJS.AES.encrypt(data, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
};

const RegisterEquipment = () => {
    const [qrData, setQrData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isWirelessMouse, setIsWirelessMouse] = useState(false);
    const [isAdditionalFieldsVisible, setIsAdditionalFieldsVisible] = useState(false);
    const [formData, setFormData] = useState({
        startTime: "",
        endTime: "",
        email: "",
        name: "",
        type: "",
        user: "",
        brand: "",
        reference: "",
        serial_number: "", // This will be used as the document ID
        processor: "",
        os: "",
        ram: "",
        storage: "", // New storage field
        externalScreen: "",
        screenBrand: "",
        screenSerialNumber: "",
        inventoryNumberEcr: "",
        status: "",
        inventoryNumberLpt: "",
    });

    const typeOptions = [
        "imprimante", "avaya", "point d’access", "switch", "DVR", "TV",
        "scanner", "routeur", "balanceur", "standard téléphonique",
        "data show", "desktop", "laptop",
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const registerEquipment = async () => {
        // Check required fields
        const requiredFields = ["startTime", "endTime", "email", "name", "type", "user", "brand", "reference", "serial_number", "processor", "os", "ram", "storage", "status", "inventoryNumberLpt"];
        const missingRequiredField = requiredFields.some((field) => !formData[field]);
        
        // Conditionally check additional fields
        const missingAdditionalFields = isAdditionalFieldsVisible &&
            (!formData.externalScreen || !formData.screenBrand || !formData.screenSerialNumber || !formData.inventoryNumberEcr);

        if (missingRequiredField || missingAdditionalFields) {
            alert("Please fill in all required fields.");
            return;
        }
        
        setIsLoading(true);
        try {
            // Prepare equipment data
            const equipmentData = { ...formData, documentId: formData.serial_number, storage: formData.storage, wirelessMouse: isWirelessMouse ? "Yes" : "No" };

            // Generate and encrypt the QR data
            const generatedQRData = JSON.stringify(equipmentData);
            const encryptedQRData = encryptData(generatedQRData);

            console.log("Generated encrypted QR data:", encryptedQRData); // Log encrypted data

            // Save to Firestore with the encrypted QR data
            const docRef = doc(db, "equipment", formData.serial_number);
            await setDoc(docRef, {
                ...equipmentData,
                timestamp: serverTimestamp(),
                qr_data: encryptedQRData, // Store encrypted QR data
            });
            
            setQrData(encryptedQRData); // Set QR data to display the encrypted QR code

            // Clear the form fields after successful save
            setFormData({
                startTime: "",
                endTime: "",
                email: "",
                name: "",
                type: "",
                user: "",
                brand: "",
                reference: "",
                serial_number: "", // Reset serial_number field
                processor: "",
                os: "",
                ram: "",
                storage: "", // Reset storage field
                externalScreen: "",
                screenBrand: "",
                screenSerialNumber: "",
                inventoryNumberEcr: "",
                status: "",
                inventoryNumberLpt: "",
            });
            setIsWirelessMouse(false);
            setIsAdditionalFieldsVisible(false);
        } catch (error) {
            console.error("Error registering equipment:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadQRCode = async () => {
        const canvas = await html2canvas(document.getElementById("qrCode"));
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "qr_code.png";
        link.click();
    };

    return (
        <div className="register-equipment">
            <h1>Register Equipment</h1>

            {qrData ? (
                // QR Code Display Section
                <div className="qr-section">
                    <div id="qrCode">
                        <QRCodeCanvas value={qrData} size={300} /> {/* Increased QR code size */}
                    </div>
                    <button onClick={downloadQRCode}>Download QR Code</button>
                </div>
            ) : (
                // Form Section
                <form
                    className="equipment-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        registerEquipment();
                    }}
                >
                    <input type="datetime-local" name="startTime" placeholder="Start Time" onChange={handleChange} required />
                    <input type="datetime-local" name="endTime" placeholder="End Time" onChange={handleChange} required />
                    
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                    <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
                    <select name="type" onChange={handleChange} required>
                        <option value="">Select Type</option>
                        {typeOptions.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <input type="text" name="user" placeholder="User" onChange={handleChange} required />
                    <input type="text" name="brand" placeholder="Brand" onChange={handleChange} required />
                    <input type="text" name="reference" placeholder="Reference" onChange={handleChange} required />
                    <input type="text" name="serial_number" placeholder="Serial Number" onChange={handleChange} required />
                    <input type="text" name="processor" placeholder="Processor" onChange={handleChange} required />
                    <input type="text" name="os" placeholder="Operating System" onChange={handleChange} required />
                    <input type="text" name="ram" placeholder="RAM (GB)" onChange={handleChange} required />
                    <input type="text" name="storage" placeholder="Storage (GB)" onChange={handleChange} required /> {/* New storage field */}

                    <label className="checkbox-label">
                        <input type="checkbox" checked={isWirelessMouse} onChange={() => setIsWirelessMouse(!isWirelessMouse)} />
                        Wireless Mouse
                    </label>

                    {(formData.type === "desktop" || formData.type === "laptop") && (
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isAdditionalFieldsVisible}
                                onChange={() => setIsAdditionalFieldsVisible(!isAdditionalFieldsVisible)}
                            />
                            Has External Screen
                        </label>
                    )}
                    
                    {isAdditionalFieldsVisible && (
                        <>
                            <input type="text" name="externalScreen" placeholder="External Screen" onChange={handleChange} required />
                            <input type="text" name="screenBrand" placeholder="Screen Brand" onChange={handleChange} required />
                            <input type="text" name="screenSerialNumber" placeholder="Screen Serial Number" onChange={handleChange} required />
                            <input type="text" name="inventoryNumberEcr" placeholder="Inventory Number ECR" onChange={handleChange} required />
                        </>
                    )}

                    <input type="text" name="status" placeholder="Status" onChange={handleChange} required />
                    <input type="text" name="inventoryNumberLpt" placeholder="Inventory Number LPT" onChange={handleChange} required />

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default RegisterEquipment;
