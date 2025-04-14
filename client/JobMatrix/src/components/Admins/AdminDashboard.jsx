import { useState, useEffect, useRef } from 'react';
import styles from "../../styles/AdminDashboard.module.css";
import { FiUsers, FiBriefcase, FiBarChart2, FiRefreshCw, FiBookmark, FiFileText } from "react-icons/fi";
import { MdBusiness, MdPieChart, MdShowChart } from "react-icons/md";
import { FaUser, FaUserTie, FaUserCog } from "react-icons/fa";
import { getDashboardInsights } from "../../services/api";
import { motion, useScroll } from 'framer-motion';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  
  const overviewRef = useRef(null);
  const analyticsRef = useRef(null);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    onChange: (latest) => {
      const analyticsTop = analyticsRef.current?.offsetTop || 0;
      const scrollPosition = latest * document.documentElement.scrollHeight;
      
      if (scrollPosition >= analyticsTop - 100) {
        setActiveSection('analytics');
      } else {
        setActiveSection('overview');
      }
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardInsights();
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError("Failed to fetch dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FiRefreshCw size={32} />
          </motion.div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.users.total,
      icon: <FiUsers />,
      color: "var(--steel-blue)",
      trend: dashboardData.users.trend,
      newThisWeek: dashboardData.users.new_this_week,
      breakdown: [
        { label: "Applicants", value: dashboardData.users.applicants, icon: <FaUser /> },
        { label: "Recruiters", value: dashboardData.users.recruiters, icon: <FaUserTie /> },
        { label: "Admins", value: dashboardData.users.admins, icon: <FaUserCog /> }
      ]
    },
    {
      title: "Total Companies",
      value: dashboardData.companies.total,
      icon: <MdBusiness />,
      color: "var(--blue)",
      trend: dashboardData.companies.trend,
      newThisWeek: dashboardData.companies.new_this_week
    },
    {
      title: "Total Jobs",
      value: dashboardData.jobs.total,
      icon: <FiBriefcase />,
      color: "var(--light-blue)",
      trend: dashboardData.jobs.trend,
      newThisWeek: dashboardData.jobs.new_this_week,
      distribution: dashboardData.jobs.distribution_by_industry
    },
    {
      title: "Active Admins",
      value: dashboardData.admins.total,
      icon: <FiBarChart2 />,
      color: "var(--english-violet)",
      trend: dashboardData.admins.trend,
      newThisWeek: dashboardData.admins.new_this_week
    }
  ];

  const activityStats = [
    {
      title: "Total Applications",
      value: dashboardData.activity.total_applications,
      icon: <FiFileText />,
      color: "var(--purple)"
    },
    {
      title: "Total Bookmarks",
      value: dashboardData.activity.total_bookmarks,
      icon: <FiBookmark />,
      color: "var(--pink)"
    }
  ];

  // Generate gradient colors for distribution bars
  const generateColor = (index, total) => {
    const baseColor = [100, 149, 237]; // Cornflower blue (var(--light-blue))
    const lightnessFactor = 0.9 - (index / total) * 0.4; // Decrease lightness as we go down
    return `rgb(
      ${Math.floor(baseColor[0] * lightnessFactor)},
      ${Math.floor(baseColor[1] * lightnessFactor)},
      ${Math.floor(baseColor[2] * lightnessFactor)}
    )`;
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.headerContainer}>
        <div className={styles.mainHeader}>
          <h1 className={styles.mainTitle}>ADMIN DASHBOARD</h1>
          <div className={styles.headerTabs}>
            <button 
              className={`${styles.headerTab} ${activeSection === 'overview' ? styles.activeHeaderTab : ''}`}
              onClick={() => {
                overviewRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Overview
            </button>
            <button 
              className={`${styles.headerTab} ${activeSection === 'analytics' ? styles.activeHeaderTab : ''}`}
              onClick={() => {
                analyticsRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div ref={overviewRef} className={styles.section}>
        <div className={styles.cardGrid}>
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className={styles.card}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={styles.icon}
                style={{ backgroundColor: stat.color }}
              >
                {stat.icon}
              </div>
              <div className={styles.info}>
                <h2>{stat.value.toLocaleString()}</h2>
                <p>{stat.title}</p>
                <div className={styles.meta}>
                  {stat.newThisWeek !== null && (
                    <span className={styles.newThisWeek}>
                      +{stat.newThisWeek} this week
                    </span>
                  )}
                  {stat.trend !== null && (
                    <span className={stat.trend >= 0 ? styles.trendUp : styles.trendDown}>
                      {stat.trend >= 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div ref={analyticsRef} className={styles.section}>
        <div className={styles.analyticsContainer}>
          <div className={styles.analyticsSection}>
            <h2 className={styles.sectionTitle}>
              <MdPieChart className={styles.sectionIcon} style={{ color: "var(--english-violet)" }} />
              Users Breakdown
            </h2>
            <div className={styles.breakdownGrid}>
              {stats[0].breakdown.map((item, index) => (
                <motion.div 
                  key={index}
                  className={styles.breakdownCard}
                  whileHover={{ scale: 1.03 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.breakdownIcon} style={{ color: "var(--english-violet)" }}>
                    {item.icon}
                  </div>
                  <div className={styles.breakdownValue}>{item.value}</div>
                  <div className={styles.breakdownLabel}>{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className={styles.analyticsSection}>
            <h2 className={styles.sectionTitle}>
              <MdShowChart className={styles.sectionIcon} style={{ color: "var(--english-violet)" }} />
              Jobs by Industry
            </h2>
            <div className={styles.distributionContainer}>
              {stats[2].distribution.map((industry, index) => {
                const percentage = (industry.count / stats[2].value) * 100;
                return (
                  <motion.div 
                    key={index}
                    className={styles.distributionItem}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={styles.distributionHeader}>
                      <span className={styles.distributionName}>{industry.industry_type}</span>
                      <span className={styles.distributionCount}>{industry.count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className={styles.distributionBarContainer}>
                      <motion.div 
                        className={styles.distributionBar}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        style={{ 
                          backgroundColor: generateColor(index, stats[2].distribution.length)
                        }}
                      ></motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className={styles.activitySection}>
            <h2 className={styles.sectionTitle}>
              <FiFileText className={styles.sectionIcon} style={{ color: "var(--english-violet)" }} />
              Platform Activity
            </h2>
            <div className={styles.activityGrid}>
              {activityStats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className={styles.activityCard}
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div
                    className={styles.activityIcon}
                    style={{ backgroundColor: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className={styles.activityInfo}>
                    <h3>{stat.value.toLocaleString()}</h3>
                    <p>{stat.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;