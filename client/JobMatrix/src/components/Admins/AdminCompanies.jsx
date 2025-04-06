import { useEffect, useState } from "react";
import styles from "../../styles/AdminCompanies.module.css";
import { getCompanies } from "../../services/api";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import defaultImage from "../../assets/nocompanyimage2.jpg";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleView = (company) => {
    console.log("Viewing:", company.company_name);
  };

  const handleEdit = (company) => {
    console.log("Editing:", company.company_name);
  };

  const handleDelete = (company) => {
    console.log("Deleting:", company.company_name);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Registered Companies</h1>

      <div className={styles.cardGrid}>
        {companies.map((company) => (
          <div key={company.company_id} className={styles.card}>
            <img
              src={company.company_image || defaultImage}
              alt={company.company_name}
              className={styles.logo}
              onError={(e) => (e.target.src = defaultImage)}
            />

            <div className={styles.details}>
              <h2>{company.company_name}</h2>
              <p className={styles.industry}>{company.company_industry}</p>
              <p className={styles.description}>
                {company.company_description.length > 120
                  ? company.company_description.slice(0, 120) + "..."
                  : company.company_description}
              </p>
              <div className={styles.actions}>
                <FiEye onClick={() => handleView(company)} title="View" />
                <FiEdit onClick={() => handleEdit(company)} title="Edit" />
                <FiTrash2 onClick={() => handleDelete(company)} title="Delete" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCompanies;
