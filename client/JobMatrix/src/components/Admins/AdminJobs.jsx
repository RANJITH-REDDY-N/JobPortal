import styles from "../../styles/AdminJobs.module.css";

const AdminJobs = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Job Postings</h1>
      <p className={styles.subtext}>All active and inactive job posts from recruiters.</p>
    </div>
  );
};

export default AdminJobs;
