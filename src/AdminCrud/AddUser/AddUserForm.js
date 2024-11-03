// AddUserForm.js
import React, { useState } from "react";
import { db } from "../../firebaseConfig"; // Adjust this path as needed
import { addDoc, collection } from "firebase/firestore";
import { TextField, Button, MenuItem, IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import "./AddUserForm.css";

const AddUserForm = () => {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
        role: "Admin",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }
        
        setIsLoading(true);
        try {
            await addDoc(collection(db, "users"), {
                email: formData.email.trim(),
                name: formData.name.trim(),
                role: formData.role,
            });
            alert("User added successfully!");
            setFormData({
                email: "",
                name: "",
                password: "",
                confirmPassword: "",
                role: "Admin",
            });
        } catch (error) {
            console.error("Error adding user:", error);
            alert("Error adding user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-user-form">
            <h1>Add New User</h1>
            <form className="form" onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    name="email"
                    variant="outlined"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    label="Name"
                    name="name"
                    variant="outlined"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    select
                    label="Role"
                    name="role"
                    variant="outlined"
                    fullWidth
                    value={formData.role}
                    onChange={handleChange}
                    required
                    margin="normal"
                >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                </TextField>
                <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    value={formData.password}
                    onChange={handleChange}
                    required
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    fullWidth
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isLoading}
                    className="submitUser"
                    sx={{
                        marginTop: "20px",
                        padding: "10px 0",
                        fontSize: "16px",
                        borderRadius: "8px",
                    }}
                >
                    {isLoading ? "Adding..." : "Add User"}
                </Button>
            </form>
        </div>
    );
};

export default AddUserForm;
