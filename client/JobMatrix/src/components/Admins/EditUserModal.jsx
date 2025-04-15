import { useState, useEffect } from 'react';
import styles from '../../styles/EditUserModal.module.css';
import { FiX, FiSave, FiUpload } from 'react-icons/fi';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    user_first_name: '',
    user_last_name: '',
    user_email: '',
    user_phone: '',
    user_street_no: '',
    user_city: '',
    user_state: '',
    user_zip_code: '',
    user_profile_photo: null,
    admin_ssn: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        user_first_name: user.user_first_name || '',
        user_last_name: user.user_last_name || '',
        user_email: user.user_email || '',
        user_phone: user.user_phone || '',
        user_street_no: user.user_street_no || '',
        user_city: user.user_city || '',
        user_state: user.user_state || '',
        user_zip_code: user.user_zip_code || '',
        user_profile_photo: null,
        admin_ssn: user.admin_ssn || '',
      });
      setPreviewImage(user.user_profile_photo || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, user_profile_photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      }
      await onSave(user.user_id, data);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2>Edit User</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                <img
                  src={previewImage || '/default-profile.png'}
                  alt="Profile preview"
                  className={styles.avatarImage}
                />
                <label className={styles.uploadButton}>
                  <FiUpload size={16} />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                </label>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="user_first_name">First Name</label>
                  <input
                    type="text"
                    id="user_first_name"
                    name="user_first_name"
                    value={formData.user_first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="user_last_name">Last Name</label>
                  <input
                    type="text"
                    id="user_last_name"
                    name="user_last_name"
                    value={formData.user_last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="user_email">Email</label>
                <input
                  type="email"
                  id="user_email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="user_phone">Phone</label>
                <input
                  type="tel"
                  id="user_phone"
                  name="user_phone"
                  value={formData.user_phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Address</h3>
              <div className={styles.formGroup}>
                <label htmlFor="user_street_no">Street Address</label>
                <input
                  type="text"
                  id="user_street_no"
                  name="user_street_no"
                  value={formData.user_street_no}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="user_city">City</label>
                  <input
                    type="text"
                    id="user_city"
                    name="user_city"
                    value={formData.user_city}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="user_state">State</label>
                  <input
                    type="text"
                    id="user_state"
                    name="user_state"
                    value={formData.user_state}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="user_zip_code">ZIP Code</label>
                  <input
                    type="text"
                    id="user_zip_code"
                    name="user_zip_code"
                    value={formData.user_zip_code}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {user.user_role === 'ADMIN' && (
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Admin Details</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="admin_ssn">SSN</label>
                  <input
                    type="text"
                    id="admin_ssn"
                    name="admin_ssn"
                    value={formData.admin_ssn}
                    onChange={handleChange}
                    placeholder="XXX-XX-XXXX"
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (
                <>
                  <FiSave size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;