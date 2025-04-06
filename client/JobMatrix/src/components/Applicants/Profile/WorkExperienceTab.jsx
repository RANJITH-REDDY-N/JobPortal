import React, { useEffect, useState } from "react";
import styles from "../../../styles/WorkExperienceTab.module.css";
import { 
  getWorkExperience, 
  postWorkExperience, 
  editWorkExperience, 
  deleteWorkExperience 
} from "../../../services/api";
import { 
  IconButton, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormControlLabel, 
  Checkbox 
} from "@mui/material";
import { MdEdit, MdDelete } from "react-icons/md";
import { BsCalendar2Date } from "react-icons/bs";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiExternalLink } from "react-icons/fi";
import { useSelector } from "react-redux";
import ToastNotification from "../../../components/ToastNotification";

const WorkExperienceTab = () => {
  const user = useSelector(state => state.user.user);
  const [workData, setWorkData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  
  const [formData, setFormData] = useState({
    work_experience_job_title: "",
    work_experience_company: "",
    work_experience_summary: "",
    work_experience_start_date: "",
    work_experience_end_date: "",
    work_experience_is_currently_working: false,
    work_experience_bullet_points: [""]
  });

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    fetchWorkData();
  }, []);

  const fetchWorkData = async () => {
    try {
      setLoading(true);
      const res = await getWorkExperience(user.user_id);
      if (res?.status === "success") {
        setWorkData(res.data);
      } else {
        showToast("Failed to load work experience", "error");
      }
    } catch (error) {
      showToast("Error loading work experience", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        work_experience_start_date: item.work_experience_start_date ? 
          new Date(item.work_experience_start_date).toISOString().split('T')[0] : "",
        work_experience_end_date: item.work_experience_end_date ? 
          new Date(item.work_experience_end_date).toISOString().split('T')[0] : "",
        work_experience_bullet_points: item.work_experience_bullet_points || [""]
      });
    } else {
      setEditingItem(null);
      setFormData({
        work_experience_job_title: "",
        work_experience_company: "",
        work_experience_summary: "",
        work_experience_start_date: "",
        work_experience_end_date: "",
        work_experience_is_currently_working: false,
        work_experience_bullet_points: [""]
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

  const handleBulletPointChange = (index, value) => {
    const newBulletPoints = [...formData.work_experience_bullet_points];
    newBulletPoints[index] = value;
    setFormData(prev => ({
      ...prev,
      work_experience_bullet_points: newBulletPoints
    }));
  };

  const addBulletPoint = () => {
    setFormData(prev => ({
      ...prev,
      work_experience_bullet_points: [...prev.work_experience_bullet_points, ""]
    }));
  };

  const removeBulletPoint = (index) => {
    const newBulletPoints = [...formData.work_experience_bullet_points];
    newBulletPoints.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      work_experience_bullet_points: newBulletPoints
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = { 
        ...formData,
        applicant_id: user.user_id,
        // Format dates as YYYY-MM-DD strings
        work_experience_start_date: formData.work_experience_start_date, // Already in YYYY-MM-DD from date input
        work_experience_end_date: formData.work_experience_is_currently_working 
          ? null 
          : formData.work_experience_end_date
      };
      
      if (editingItem) {
        await editWorkExperience(editingItem.work_experience_id, payload);
        showToast("Work experience updated successfully");
      } else {
        await postWorkExperience(payload);
        showToast("Work experience added successfully");
      }
      handleCloseDialog();
      fetchWorkData();
    } catch (error) {
      showToast(error.message || "Failed to save work experience", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteWorkExperience(id);
      showToast("Work experience deleted successfully");
      fetchWorkData();
    } catch (error) {
      showToast("Failed to delete work experience", "error");
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Work Experience</h2>
        <Button 
          variant="contained" 
          startIcon={<IoIosAddCircleOutline size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Experience
        </Button>
      </div>

      {loading && !workData.length ? (
        <div className={styles.loading}>Loading work experience...</div>
      ) : workData.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No work experience added yet</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {workData.map((work) => (
            <div key={work.work_experience_id} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <div>
                    <h3 className={styles.companyName}>
                      {work.work_experience_company}
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(work.work_experience_company)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.companyLink}
                      >
                        <FiExternalLink size={14} />
                      </a>
                    </h3>
                    <div className={styles.jobTitle}>{work.work_experience_job_title}</div>
                  </div>
                  <div className={styles.timelineActions}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(work)}
                      aria-label="Edit work experience"
                    >
                      <MdEdit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(work.work_experience_id)}
                      aria-label="Delete work experience"
                    >
                      <MdDelete />
                    </IconButton>
                  </div>
                </div>
                
                <div className={styles.details}>
                  <div className={styles.dateRange}>
                    <BsCalendar2Date className={styles.dateIcon} />
                    {formatDate(work.work_experience_start_date)} - {formatDate(work.work_experience_end_date)}
                  </div>
                </div>
                
                {work.work_experience_summary && (
                  <p className={styles.summary}>{work.work_experience_summary}</p>
                )}
                
                {work.work_experience_bullet_points && work.work_experience_bullet_points.length > 0 && (
                  <ul className={styles.bulletPoints}>
                    {work.work_experience_bullet_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {editingItem ? "Edit Work Experience" : "Add New Work Experience"}
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <TextField 
            fullWidth 
            margin="normal" 
            name="work_experience_company" 
            label="Company Name" 
            value={formData.work_experience_company} 
            onChange={handleChange} 
            required
          />
          
          <TextField 
            fullWidth 
            margin="normal" 
            name="work_experience_job_title" 
            label="Job Title" 
            value={formData.work_experience_job_title} 
            onChange={handleChange} 
            required
          />
          
          <div className={styles.formRow}>
            <TextField 
              fullWidth 
              margin="normal" 
              name="work_experience_start_date" 
              label="Start Date" 
              type="date" 
              value={formData.work_experience_start_date} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }}
              required
            />
            
            {!formData.work_experience_is_currently_working && (
              <TextField 
                fullWidth 
                margin="normal" 
                name="work_experience_end_date" 
                label="End Date" 
                type="date" 
                value={formData.work_experience_end_date} 
                onChange={handleChange} 
                InputLabelProps={{ shrink: true }}
              />
            )}
          </div>
          
          <FormControlLabel
            control={
              <Checkbox
                name="work_experience_is_currently_working"
                checked={formData.work_experience_is_currently_working}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Currently working here"
          />
          
          <TextField 
            fullWidth 
            margin="normal" 
            name="work_experience_summary" 
            label="Summary" 
            value={formData.work_experience_summary} 
            onChange={handleChange} 
            multiline
            rows={3}
          />
          
          <div className={styles.bulletPointsContainer}>
            <h4>Key Responsibilities & Achievements</h4>
            {formData.work_experience_bullet_points.map((point, index) => (
              <div key={index} className={styles.bulletPointInput}>
                <TextField
                  fullWidth
                  margin="normal"
                  value={point}
                  onChange={(e) => handleBulletPointChange(index, e.target.value)}
                  multiline
                  rows={2}
                />
                {index > 0 && (
                  <Button 
                    onClick={() => removeBulletPoint(index)}
                    color="error"
                    size="small"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button 
              onClick={addBulletPoint}
              variant="outlined"
              startIcon={<IoIosAddCircleOutline />}
            >
              Add Bullet Point
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading || 
              !formData.work_experience_company || 
              !formData.work_experience_job_title || 
              !formData.work_experience_start_date}
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

export default WorkExperienceTab;