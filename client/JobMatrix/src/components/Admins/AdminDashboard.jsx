import styles from "../../styles/AdminDashboard.module.css";
import { FiUsers, FiBriefcase, FiBarChart2 } from "react-icons/fi";
import { MdBusiness } from "react-icons/md";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: 326,
      icon: <FiUsers />,
      color: "var(--steel-blue)",
    },
    {
      title: "Total Companies",
      value: 47,
      icon: <MdBusiness />,
      color: "var(--blue)",
    },
    {
      title: "Total Jobs",
      value: 128,
      icon: <FiBriefcase />,
      color: "var(--light-blue)",
    },
    {
      title: "Active Admin",
      value: 1,
      icon: <FiBarChart2 />,
      color: "var(--english-violet)",
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Dashboard</h1>

      <div className={styles.cardGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.card}>
            <div
              className={styles.icon}
              style={{ backgroundColor: stat.color }}
            >
              {stat.icon}
            </div>
            <div className={styles.info}>
              <h2>{stat.value}</h2>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
