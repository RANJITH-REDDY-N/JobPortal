import { useEffect, useState } from "react";
import styles from "../../styles/AdminUsers.module.css";
import { getAllUsers } from "../../services/api";
import defaultProfilePhoto from "../../assets/noprofilephoto.png";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleView = (user) => {
    console.log("Viewing user:", user.user_email);
  };

  const handleEdit = (user) => {
    console.log("Editing user:", user.user_email);
  };

  const handleDelete = (user) => {
    console.log("Deleting user:", user.user_email);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>All Users</h1>
      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>#</th>
            <th>Profile</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const fullName = `${user.user_first_name} ${user.user_last_name}`;
            const formattedDate = new Date(user.user_created_date).toLocaleDateString();
            return (
              <tr key={user.user_id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={user.user_profile_photo || defaultProfilePhoto}
                    alt={fullName}
                    className={styles.profileImage}
                  />
                </td>
                <td>{fullName}</td>
                <td>{user.user_email}</td>
                <td>{user.user_role}</td>
                <td>{formattedDate}</td>
                <td>
                  <div className={styles.actions}>
                    <FiEye onClick={() => handleView(user)} title="View" />
                    <FiEdit onClick={() => handleEdit(user)} title="Edit" />
                    <FiTrash2 onClick={() => handleDelete(user)} title="Delete" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
