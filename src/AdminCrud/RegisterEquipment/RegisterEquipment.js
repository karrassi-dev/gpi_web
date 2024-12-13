import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig"; // Ensure this is pointing to your Firebase config
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { getAuth } from "firebase/auth"; // Firebase Authentication
import "./RegisterEquipment.css";

const RegisterEquipment = () => {
    const [qrData, setQrData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isWirelessMouse, setIsWirelessMouse] = useState(false);
    const [isAdditionalFieldsVisible, setIsAdditionalFieldsVisible] = useState(false);
    const [isUserDataLoading, setIsUserDataLoading] = useState(true); // Loading state for user data
    const [formData, setFormData] = useState({
        startTime: "",
        endTime: "",
        email: "",
        name: "",  // Will be populated with logged-in user's name
        user: "",
        brand: "",
        reference: "",
        serial_number: "", // Used as document ID and QR data
        processor: "",
        os: "",
        ram: "",
        storage: "",
        externalScreen: "",
        screenBrand: "",
        screenSerialNumber: "",
        inventoryNumberEcr: "",
        status: "Available", // Default status value
        inventoryNumberLpt: "",
    });

    const typeOptions = [
        "Imprimante",
        "Avaya",
        "Point d’access",
        "Switch",
        "DVR",
        "TV",
        "Scanner",
        "Routeur",
        "Balanceur",
        "Standard Téléphonique",
        "Data Show",
        "Desktop",
        "Laptop",
        "laptop",
        "Notebook",
    ];

    const brandOptions = ["Dell", "Toshiba", "Asus", "HP"];
    const statusOptions = ["Available", "en_maintenance", "in_service"];

    // Fetch current user data from Firestore
    useEffect(() => {
        const auth = getAuth(); // Get Firebase Auth instance
        const currentUser = auth.currentUser; // Get currently logged-in user

        if (currentUser) {
            const currentUserUid = currentUser.uid;

            // Fetch user data from Firestore based on the UID
            const fetchUserData = async () => {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUserUid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setFormData((prev) => ({ ...prev, user: userData.name || "", name: userData.name || "" }));
                    } else {
                        console.warn("User document not found.");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setIsUserDataLoading(false);  // Set loading to false once the data is fetched
                }
            };

            fetchUserData();
        } else {
            console.warn("No user is logged in.");
            setIsUserDataLoading(false); // Set loading to false if no user is logged in
        }
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const registerEquipment = async () => {
        const requiredFields = ["startTime", "endTime", "email", "name", "type", "user", "brand", "reference", "serial_number", "processor", "os", "ram", "storage", "status", "inventoryNumberLpt"];
        const missingRequiredField = requiredFields.some((field) => !formData[field]);
        const missingAdditionalFields =
            isAdditionalFieldsVisible &&
            (!formData.externalScreen || !formData.screenBrand || !formData.screenSerialNumber || !formData.inventoryNumberEcr);

        if (missingRequiredField || missingAdditionalFields) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsLoading(true);
        try {
            const equipmentData = {
                ...formData,
                documentId: formData.serial_number,
                storage: formData.storage,
                wirelessMouse: isWirelessMouse ? "Yes" : "No",
            };

            const generatedQRData = formData.serial_number;

            const docRef = doc(db, "equipment", formData.serial_number);
            await setDoc(docRef, {
                ...equipmentData,
                timestamp: serverTimestamp(),
                qr_data: generatedQRData,
            });

            setQrData(generatedQRData);
            setFormData({
                startTime: "",
                endTime: "",
                email: "",
                name: "",
                user: "",
                type: "",
                brand: "",
                reference: "",
                serial_number: "",
                processor: "",
                os: "",
                ram: "",
                storage: "",
                externalScreen: "",
                screenBrand: "",
                screenSerialNumber: "",
                inventoryNumberEcr: "",
                status: "Available",
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
    if (isUserDataLoading) {
        return <div>Loading user data...</div>;
    }
    return (
        <div className="register-equipment">
            <h1>Register Equipment</h1>
            {qrData ? (
                <div className="qr-section">
                    <div id="qrCode">
                        <QRCodeCanvas value={qrData} size={300} />
                    </div>
                    <button onClick={downloadQRCode}>Download QR Code</button>
                </div>
            ) : (
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
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required  readOnly />
                    <select name="type" onChange={handleChange} required>
                        <option value="">Select Type</option>
                        {typeOptions.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <inputf
                        type="text"
                        name="user" 
                        placeholder="User"
                        value={formData.user}  // Prefill user name
                        onChange={handleChange}
                        required
                        readOnly
                    />
                    <select name="brand" onChange={handleChange} required>
                        <option value="">Select Brand</option>
                        {brandOptions.map((brand) => (
                            <option key={brand} value={brand}>
                                {brand}
                            </option>
                        ))}
                    </select>
                    <input type="text" name="reference" placeholder="Reference" onChange={handleChange} required />
                    <input type="text" name="serial_number" placeholder="Serial Number" onChange={handleChange} required />
                    <input type="text" name="processor" placeholder="Processor" onChange={handleChange} required />
                    <input type="text" name="os" placeholder="Operating System" onChange={handleChange} required />
                    <input type="text" name="ram" placeholder="RAM (GB)" onChange={handleChange} required />
                    <input type="text" name="storage" placeholder="Storage (GB)" onChange={handleChange} required />
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
                            Additional Fields
                        </label>
                    )}
                    {isAdditionalFieldsVisible && (
                        <>
                            <input type="text" name="externalScreen" placeholder="External Screen" onChange={handleChange} />
                            <input type="text" name="screenBrand" placeholder="Screen Brand" onChange={handleChange} />
                            <input type="text" name="screenSerialNumber" placeholder="Screen Serial Number" onChange={handleChange} />
                            <input type="text" name="inventoryNumberEcr" placeholder="Inventory Number ECR" onChange={handleChange} />
                        </>
                    )}
                    <select name="status" onChange={handleChange} required>
                        <option value="">Select Status</option>
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <input type="text" name="inventoryNumberLpt" placeholder="Inventory Number LPT" onChange={handleChange} required />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Registering..." : "Register Equipment"}
                    </button>
                </form>
            )}
        </div>
    );
};
export default RegisterEquipment;
