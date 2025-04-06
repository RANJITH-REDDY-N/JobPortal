import styles from "../../styles/AdminCompanies.module.css";

const AdminCompanies = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Registered Companies</h1>
      <p className={styles.subtext}>List of companies that signed up to post jobs.</p>
    </div>
  );
};

export default AdminCompanies;
