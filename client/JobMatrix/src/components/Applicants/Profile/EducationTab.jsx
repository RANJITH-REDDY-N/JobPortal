import React, { useEffect, useState } from "react";
import styles from "../../../styles/EducationTab.module.css";
import { getEducation, postEducation, editEducation, deleteEducation } from "../../../services/api"; 
import { IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Divider } from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import { BsCalendar2Date } from "react-icons/bs";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiExternalLink } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../Redux/userSlice";
import ToastNotification from "../../../components/ToastNotification";

const EducationTab = ({ }) => {
  const user = useSelector(state => state.user.user);
  const [educationData, setEducationData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  
  const [formData, setFormData] = useState({
    education_school_name: "",
    education_degree_type: "",
    education_major: "",
    education_gpa: "",
    education_start_date: "",
    education_end_date: "",
    education_is_currently_enrolled: false,
  });

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      setLoading(true);

      const res = await getEducation(user.user_id);
      if (res?.status === "success") {
        setEducationData(res.data);
      } else {
        showToast("Failed to load education data", "error");
      }
    } catch (error) {
      showToast("Error loading education data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        education_start_date: format(new Date(item.education_start_date), "yyyy-MM-dd"),
        education_end_date: item.education_end_date ? format(new Date(item.education_end_date), "yyyy-MM-dd") : ""
      });
    } else {
      setEditingItem(null);
      setFormData({
        education_school_name: "",
        education_degree_type: "",
        education_major: "",
        education_gpa: "",
        education_start_date: "",
        education_end_date: "",
        education_is_currently_enrolled: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = { 
        ...formData, 
        applicant_id: applicantId,
        education_start_date: new Date(formData.education_start_date).toISOString(),
        education_end_date: formData.education_end_date ? new Date(formData.education_end_date).toISOString() : null
      };
      
      if (editingItem) {
        await editEducation(editingItem.education_id, payload);
        showToast("Education updated successfully");
      } else {
        await postEducation(payload);
        showToast("Education added successfully");
      }
      handleCloseDialog();
      fetchEducationData();
    } catch (error) {
      showToast(error.message || "Failed to save education", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteEducation(id);
      showToast("Education deleted successfully");
      fetchEducationData();
    } catch (error) {
      showToast("Failed to delete education", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    
    const date = new Date(dateString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  };
  
  // Usage in the component:
  // {formatDate(edu.education_start_date)} - {formatDate(edu.education_end_date)}

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Education History</h2>
        <Button 
          variant="contained" 
          startIcon={<IoIosAddCircleOutline size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Education
        </Button>
      </div>

      {loading && !educationData.length ? (
        <div className={styles.loading}>Loading education history...</div>
      ) : educationData.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No education history added yet</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {educationData.map((edu) => (
            <div key={edu.education_id} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h3 className={styles.schoolName}>
                    {edu.education_school_name}
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(edu.education_school_name)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.schoolLink}
                    >
                      <FiExternalLink size={14} />
                    </a>
                  </h3>
                  <div className={styles.timelineActions}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(edu)}
                      aria-label="Edit education"
                    >
                      <MdEdit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(edu.education_id)}
                      aria-label="Delete education"
                    >
                      <MdDelete />
                    </IconButton>
                  </div>
                </div>
                
                <div className={styles.degreeInfo}>
                  <span className={styles.degreeType}>{edu.education_degree_type}</span>
                  {edu.education_major && <span className={styles.major}>in {edu.education_major}</span>}
                </div>
                
                <div className={styles.details}>
                  <div className={styles.dateRange}>
                    <BsCalendar2Date className={styles.dateIcon} />
                    {formatDate(edu.education_start_date)} - {formatDate(edu.education_end_date)}
                  </div>
                  {edu.education_gpa && (
                    <div className={styles.gpa}>
                      GPA: {edu.education_gpa}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingItem ? "Edit Education" : "Add New Education"}
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <TextField 
            fullWidth 
            margin="normal" 
            name="education_school_name" 
            label="School/University Name" 
            value={formData.education_school_name} 
            onChange={handleChange} 
            required
          />
          
          <div className={styles.formRow}>
            <TextField 
              fullWidth 
              margin="normal" 
              name="education_degree_type" 
              label="Degree Type" 
              value={formData.education_degree_type} 
              onChange={handleChange} 
              required
            />
            <TextField 
              fullWidth 
              margin="normal" 
              name="education_major" 
              label="Major/Field of Study" 
              value={formData.education_major} 
              onChange={handleChange} 
            />
          </div>
          
          <div className={styles.formRow}>
            <TextField 
              fullWidth 
              margin="normal" 
              name="education_gpa" 
              label="GPA" 
              value={formData.education_gpa} 
              onChange={handleChange} 
              type="number"
              inputProps={{ step: "0.01", min: "0", max: "4.0" }}
            />
          </div>
          
          <div className={styles.formRow}>
            <TextField 
              fullWidth 
              margin="normal" 
              name="education_start_date" 
              label="Start Date" 
              type="date" 
              value={formData.education_start_date} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }}
              required
            />
            
            {!formData.education_is_currently_enrolled && (
              <TextField 
                fullWidth 
                margin="normal" 
                name="education_end_date" 
                label="End Date" 
                type="date" 
                value={formData.education_end_date} 
                onChange={handleChange} 
                InputLabelProps={{ shrink: true }}
              />
            )}
          </div>
          
          <FormControlLabel
            control={
              <Checkbox
                name="education_is_currently_enrolled"
                checked={formData.education_is_currently_enrolled}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Currently enrolled"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading || !formData.education_school_name || !formData.education_degree_type || !formData.education_start_date}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {toastQueue.slice(0, 3).map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToastQueue(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );
};

export default EducationTab;