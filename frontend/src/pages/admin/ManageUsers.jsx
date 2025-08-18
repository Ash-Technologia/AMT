// =========================
// FRONTEND: frontend/src/pages/admin/ManageUsers.jsx
// =========================
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../api";
import styles from "../../styles/AdminTable.module.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (id, current) => {
    try {
      await api.put(`/api/admin/users/${id}/role`, { isAdmin: !current });
      load();
    } catch (err) { console.error(err); }
  };

  const remove = async (id) => {
    if (!confirm("Delete user?")) return;
    await api.delete(`/api/admin/users/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <h1 className={styles.pageTitle}>Manage Users</h1>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Admin</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.isAdmin ? "Yes" : "No"}</td>
                <td>
                  <button className={styles.btn} onClick={() => toggleAdmin(u._id, u.isAdmin)}>{u.isAdmin ? "Revoke" : "Make Admin"}</button>
                  <button className={styles.btnDanger} onClick={() => remove(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ManageUsers;
