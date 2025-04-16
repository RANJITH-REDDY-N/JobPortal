import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "../../../styles/CompanyInfo.module.css";
import {  Key, Edit, Business, Save, Close, CloudUpload } from '@mui/icons-material';
import defaultCompanyImage from '../../../assets/noprofilephoto.png';
import defaultBackground from '../../../assets/nocompanyimage2.jpg'; 
import {updateCompanyDetails} from '../../../services/api';
import { FiEdit3, FiSave } from "react-icons/fi";
import { LuEraser } from "react-icons/lu";
import CropImageUploader from "../../CropImageUploader";
import ToastNotification from "../../ToastNotification";
import { setCompany } from "../../../Redux/userSlice";


const CompanyInfo = () => {
    const userData = useSelector((state) => state.user?.user);
    const dispatch = useDispatch()
    const companyDetails = userData.company;
    const [isEditing, setIsEditing] = useState(false);
    const [editedDetails, setEditedDetails] = useState({
        ...companyDetails
    });
    const [toastQueue, setToastQueue] = useState([]);
    const [companyImageFile, setCompanyImageFile] = useState(null);


    const showToast = (message, type = "success") => {
        const newToast = { message, type, id: Date.now() };
        setToastQueue(prev => [...prev, newToast]);
        
        setTimeout(() => {
            setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
        }, 3000);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setCompanyImageFile(null);
        }
    };

    const handleCompanyImageChange = (file) => {
        setCompanyImageFile(file);
    };
    

    const handleSaveChanges = async () => {
        try {
            const formData = new FormData();
            Object.keys(editedDetails).forEach(key => {
                if (key !== 'company_image') {
                    formData.append(key, editedDetails[key]);
                }
            });
            if (companyImageFile) {
                formData.append('company_image', companyImageFile);
            } else if (editedDetails.company_image === null) {
                formData.append('company_image', '');
            }
            
            const response = await updateCompanyDetails(formData);
            console.log("Company details updated:", response);
            
            // Check if response contains error (failed case)
            if (response.error) {
                showToast(response.error.message || "Operation failed", "error");
            } else {
                // Success case
                dispatch(setCompany(response.data));
                showToast(response.message || "Company details updated successfully");
                setIsEditing(false);
            }
            
        } catch (error) {
            console.error("Error updating company:", error);
            
            // Handle both axios-style errors and other errors
            const errorMessage = 
                error?.response?.data?.error?.message ||  // Nested error message
                error?.response?.data?.message ||       // Direct message
                error?.message ||                      // Error object message
                "Failed to update company details";     // Fallback
                
            showToast(errorMessage, "error");
        }
    };

    const handleCancel = () => {
        setEditedDetails({ ...companyDetails });
        setCompanyImageFile(null);
        setIsEditing(false);
        showToast("Changes discarded", "info");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

        return (
            <div className={styles.wrapper}>
                {/* Toast Notifications */}
                <div className={styles.toastContainer}>
                    {toastQueue.map((toast) => (
                        <ToastNotification
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => setToastQueue(prev => prev.filter(t => t.id !== toast.id))}
                        />
                    ))}
                </div>
        
                {/* Background Banner */}
                <div className={styles.banner}>
                    <img 
                        src={defaultBackground} 
                        alt="Company background" 
                        className={styles.bannerImage}
                    />
                </div>
        
                {/* Main Content Container */}
                <div className={styles.container}>
                    {/* Header with Logo and Basic Info */}
                    <div className={styles.header}>
                        <div className={styles.logoContainer}>
                            <CropImageUploader
                                name="company_image"
                                onFileChange={handleCompanyImageChange}
                                defaultImage={defaultCompanyImage}
                                currentImage={editedDetails.company_image}
                                checkPage='company-info'
                                isEditing={isEditing}
                            />
                        </div>
                        
                        <div className={styles.headerInfo}>
                            <h1 className={styles.companyName}>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={editedDetails.company_name}
                                        onChange={handleInputChange}
                                        className={styles.editInput}
                                    />
                                ) : (
                                    editedDetails.company_name
                                )}
                            </h1>
                            
                            <p className={styles.tagline}>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="company_tagline"
                                        value={editedDetails.company_tagline || ''}
                                        onChange={handleInputChange}
                                        className={styles.editInput}
                                        placeholder="Add a company tagline..."
                                    />
                                ) : (
                                    editedDetails.company_tagline || "The best architecture speaks the language of what it is designed for ••••"
                                )}
                            </p>
                        </div>
                    </div>
        
                    {/* Company Content Sections */}
                    <div className={styles.content}>
                        {/* About Section */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Who are we</h2>
                            <div className={styles.sectionContent}>
                                {isEditing ? (
                                    <textarea
                                        name="company_description"
                                        value={editedDetails.company_description}
                                        onChange={handleInputChange}
                                        className={styles.editTextarea}
                                        rows={5}
                                    />
                                ) : (
                                    <p className={styles.description}>
                                        {editedDetails.company_description || 
                                        "RR Architects is an architecture company that help communities find their soul by unlocking stories within their landscape, culture, and character."}
                                    </p>
                                )}
                            </div>
                        </div>
        
                    </div>
        
                    {/* Action Buttons */}
                    <div className={styles.buttonGroup}>
                        {!isEditing ? (
                            <button 
                                className={styles.editButton}
                                onClick={handleEditToggle}
                            >
                                <FiEdit3 /> Edit Company
                            </button>
                        ) : (
                            <>
                                
                                <button 
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                >
                                    <LuEraser /> Cancel
                                </button>
                                <button 
                                    className={styles.saveButton}
                                    onClick={handleSaveChanges}
                                >
                                    <FiSave /> Save
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    
};

export default CompanyInfo;