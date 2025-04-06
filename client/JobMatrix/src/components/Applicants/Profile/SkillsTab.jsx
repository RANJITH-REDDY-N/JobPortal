import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getSkills, postSkill, editSkill, deleteSkill } from "../../../services/api";
import { MdEdit, MdDelete, MdAdd, MdClose, MdCheck } from "react-icons/md";
import styles from "../../../styles/SkillsTab.module.css";
import ToastNotification from "../../../components/ToastNotification";

const SkillsTab = () => {
  const user = useSelector(state => state.user.user);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [editingMode, setEditingMode] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await getSkills(user.user_id);
      if (res?.status === "success") {
        setSkills(res.data);
      } else {
        showToast(res?.message || "Failed to load skills", "error");
      }
    } catch (error) {
      showToast("Error loading skills", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !yearsExp) {
      showToast("Please enter both skill name and years of experience", "error");
      return;
    }
    
    try {
      setLoading(true);
      const res = await postSkill({
        applicant_id: user.user_id,
        skill_name: newSkill,
        skill_years_of_experience: parseInt(yearsExp)
      });
      
      if (res?.status === "success") {
        setSkills(prev => [...prev, res.data]);
        setNewSkill("");
        setYearsExp("");
        showToast("Skill added successfully");
      } else {
        showToast(res?.message || "Failed to add skill", "error");
      }
    } catch (error) {
      showToast("Failed to add skill", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      setLoading(true);
      const res = await deleteSkill(skillId);
      if (res?.status === "success") {
        setSkills(prev => prev.filter(skill => skill.skill_id !== skillId));
        showToast("Skill deleted successfully");
      } else {
        showToast(res?.message || "Failed to delete skill", "error");
      }
    } catch (error) {
      showToast("Failed to delete skill", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async (skill) => {
    try {
      setLoading(true);
      const res = await editSkill(skill.skill_id, {
        skill_name: skill.skill_name,
        skill_years_of_experience: parseInt(skill.skill_years_of_experience)
      });
      
      if (res?.status === "success") {
        setSkills(prev => prev.map(s => 
          s.skill_id === skill.skill_id ? res.data : s
        ));
        setEditingSkill(null);
        showToast("Skill updated successfully");
      } else {
        showToast(res?.message || "Failed to update skill", "error");
      }
    } catch (error) {
      showToast("Failed to update skill", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    setEditingMode(!editingMode);
    if (editingMode) {
      setEditingSkill(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Skills</h2>
        <button 
          className={styles.editButton}
          onClick={toggleEditMode}
        >
          {editingMode ? (
            <>
              <MdCheck size={20} /> Done
            </>
          ) : (
            <>
              <MdEdit size={20} /> Edit
            </>
          )}
        </button>
      </div>

      <div className={styles.skillsGrid}>
        {skills.map(skill => (
          <div key={skill.skill_id} className={styles.skillChip}>
            {editingMode && editingSkill?.skill_id === skill.skill_id ? (
              <div className={styles.editContainer}>
                <input
                  type="text"
                  value={editingSkill.skill_name}
                  onChange={(e) => setEditingSkill({
                    ...editingSkill,
                    skill_name: e.target.value
                  })}
                  className={styles.editInput}
                />
                <input
                  type="number"
                  min="0"
                  value={editingSkill.skill_years_of_experience}
                  onChange={(e) => setEditingSkill({
                    ...editingSkill,
                    skill_years_of_experience: e.target.value
                  })}
                  className={styles.yearsInput}
                  placeholder="Yrs"
                />
                <div className={styles.editActions}>
                  <button 
                    onClick={() => handleUpdateSkill(editingSkill)}
                    className={styles.saveButton}
                  >
                    <MdCheck size={16} />
                  </button>
                  <button 
                    onClick={() => setEditingSkill(null)}
                    className={styles.cancelButton}
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className={styles.skillText}>
                  {skill.skill_name} ({skill.skill_years_of_experience} yrs)
                </span>
                {editingMode && (
                  <div className={styles.chipActions}>
                    <button 
                      onClick={() => setEditingSkill(skill)}
                      className={styles.editAction}
                    >
                      <MdEdit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSkill(skill.skill_id)}
                      className={styles.deleteAction}
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className={styles.addSkillContainer}>
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Skill name"
          className={styles.skillInput}
        />
        <input
          type="number"
          min="0"
          value={yearsExp}
          onChange={(e) => setYearsExp(e.target.value)}
          placeholder="Years"
          className={styles.yearsInput}
        />
        <button 
          onClick={handleAddSkill}
          disabled={!newSkill.trim() || !yearsExp || loading}
          className={styles.addButton}
        >
          <MdAdd size={20} /> Add
        </button>
      </div>

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SkillsTab;