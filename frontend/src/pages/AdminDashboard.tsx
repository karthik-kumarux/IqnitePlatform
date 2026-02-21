import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/Skeleton';

interface SystemStats {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  quizzes: {
    total: number;
    recentlyCreated: number;
  };
  questions: {
    total: number;
  };
  sessions: {
    total: number;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    quizzes: number;
    sessions: number;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    loadStats();
    loadUsers();
  }, [currentPage]);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getSystemStats();
      setStats(response.data);
    } catch (err: any) {
      toast.error('Failed to load system stats');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers(currentPage, 10);
      setUsers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadUsers();
    } catch (err: any) {
      toast.error('Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (err: any) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) return <div style={containerStyle}><DashboardSkeleton /></div>;

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* Stats Cards */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Total Users</h3>
          <p style={statValueStyle}>{stats?.users.total || 0}</p>
          <p style={statSubtextStyle}>{stats?.users.active || 0} active</p>
        </div>

        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Total Quizzes</h3>
          <p style={statValueStyle}>{stats?.quizzes.total || 0}</p>
          <p style={statSubtextStyle}>{stats?.quizzes.recentlyCreated || 0} this week</p>
        </div>

        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Total Questions</h3>
          <p style={statValueStyle}>{stats?.questions.total || 0}</p>
        </div>

        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Quiz Sessions</h3>
          <p style={statValueStyle}>{stats?.sessions.total || 0}</p>
        </div>
      </div>

      {/* User Roles Breakdown */}
      <div style={{ ...statCardStyle, marginBottom: '2rem' }}>
        <h3 style={statTitleStyle}>Users by Role</h3>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          {stats?.users.byRole && Object.entries(stats.users.byRole).map(([role, count]) => (
            <div key={role}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>{count}</p>
              <p style={{ color: '#7f8c8d', textTransform: 'capitalize' }}>{role.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={tableContainerStyle}>
        <h2 style={{ marginBottom: '1rem' }}>User Management</h2>
        
        {usersLoading ? (
          <p>Loading users...</p>
        ) : (
          <>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Quizzes</th>
                  <th style={thStyle}>Sessions</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={trStyle}>
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{user.username}</div>
                        <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        style={selectStyle}
                      >
                        <option value="PARTICIPANT">Participant</option>
                        <option value="ORGANIZER">Organizer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        ...badgeStyle,
                        background: user.isActive ? '#27ae60' : '#e74c3c',
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={tdStyle}>{user._count.quizzes}</td>
                    <td style={tdStyle}>{user._count.sessions}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        style={{
                          ...actionBtnStyle,
                          background: user.isActive ? '#e74c3c' : '#27ae60',
                        }}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={paginationStyle}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={paginationBtnStyle}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={paginationBtnStyle}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '2rem',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem',
};

const statCardStyle: React.CSSProperties = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const statTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  color: '#7f8c8d',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const statValueStyle: React.CSSProperties = {
  margin: '0.5rem 0',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#2c3e50',
};

const statSubtextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.9rem',
  color: '#95a5a6',
};

const tableContainerStyle: React.CSSProperties = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  overflowX: 'auto',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHeaderStyle: React.CSSProperties = {
  background: '#f8f9fa',
  borderBottom: '2px solid #e5e7eb',
};

const thStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left',
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#2c3e50',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const trStyle: React.CSSProperties = {
  borderBottom: '1px solid #f0f0f0',
};

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '0.95rem',
};

const selectStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #e5e7eb',
  fontSize: '0.9rem',
};

const badgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'white',
};

const actionBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  color: 'white',
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontWeight: '500',
};

const paginationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '1.5rem',
};

const paginationBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default AdminDashboard;
