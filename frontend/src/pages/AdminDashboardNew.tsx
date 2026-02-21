import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/Skeleton';
import { useAuthStore } from '../store/authStore';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const toast = useToast();
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

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
    setUsersLoading(true);
    try {
      const isActiveBool = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;
      const response = await adminAPI.getAllUsers(currentPage, 10, searchTerm, roleFilter, isActiveBool);
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
      loadStats(); // Refresh stats
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
      loadStats();
    } catch (err: any) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
      loadStats();
    } catch (err: any) {
      toast.error('Failed to delete user');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleBulkRoleChange = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    const newRole = prompt('Enter new role (ADMIN, ORGANIZER, PARTICIPANT):');
    if (!newRole) return;

    try {
      await adminAPI.bulkUpdateUserRole(selectedUsers, newRole);
      toast.success(`${selectedUsers.length} users updated successfully`);
      setSelectedUsers([]);
      loadUsers();
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update users');
    }
  };

  const handleBulkStatusChange = async (activate: boolean) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (!confirm(`Are you sure you want to ${activate ? 'activate' : 'deactivate'} ${selectedUsers.length} users?`)) return;

    try {
      await adminAPI.bulkUpdateUserStatus(selectedUsers, activate);
      toast.success(`${selectedUsers.length} users ${activate ? 'activated' : 'deactivated'} successfully`);
      setSelectedUsers([]);
      loadUsers();
      loadStats();
    } catch (err: any) {
      toast.error('Failed to update users');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  if (loading) return <div style={containerStyle}><DashboardSkeleton /></div>;

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* System Stats */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <h3>Total Users</h3>
          <p style={statNumberStyle}>{stats?.users.total || 0}</p>
          <small>{stats?.users.active || 0} active</small>
        </div>
        <div style={statCardStyle}>
          <h3>Total Quizzes</h3>
          <p style={statNumberStyle}>{stats?.quizzes.total || 0}</p>
          <small>{stats?.quizzes.recentlyCreated || 0} this week</small>
        </div>
        <div style={statCardStyle}>
          <h3>Questions</h3>
          <p style={statNumberStyle}>{stats?.questions.total || 0}</p>
        </div>
        <div style={statCardStyle}>
          <h3>Sessions</h3>
          <p style={statNumberStyle}>{stats?.sessions.total || 0}</p>
        </div>
      </div>

      {/* User Roles Breakdown */}
      {stats && (
        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <h3>User Roles</h3>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {Object.entries(stats.users.byRole).map(([role, count]) => (
              <div key={role} style={roleCardStyle}>
                <strong>{role}</strong>: {count}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div style={filterContainerStyle}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by username, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={selectStyle}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="PARTICIPANT">Participant</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={selectStyle}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" style={buttonStyle}>Search</button>
          <button type="button" onClick={clearFilters} style={buttonSecondaryStyle}>
            Clear
          </button>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div style={bulkActionsStyle}>
          <span>{selectedUsers.length} users selected</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleBulkRoleChange} style={buttonStyle}>
              Change Role
            </button>
            <button onClick={() => handleBulkStatusChange(true)} style={buttonSuccessStyle}>
              Activate All
            </button>
            <button onClick={() => handleBulkStatusChange(false)} style={buttonDangerStyle}>
              Deactivate All
            </button>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>User Management</h2>

      {usersLoading ? (
        <p>Loading users...</p>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Quizzes</th>
                <th>Sessions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={roleSelectStyle}
                      disabled={user.id === currentUser?.id}
                    >
                      <option value="PARTICIPANT">Participant</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span style={user.isActive ? activeStatusStyle : inactiveStatusStyle}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{user._count.quizzes}</td>
                  <td>{user._count.sessions}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        style={user.isActive ? buttonDangerStyle : buttonSuccessStyle}
                        disabled={user.id === currentUser?.id}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={buttonDangerStyle}
                        disabled={user.id === currentUser?.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationStyle}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={buttonStyle}
          >
            Previous
          </button>
          <span style={{ margin: '0 1rem' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={buttonStyle}
          >
            Next
          </button>
        </div>
      )}
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  marginBottom: '2rem',
};

const statCardStyle: React.CSSProperties = {
  background: '#fff',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

const statNumberStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  margin: '0.5rem 0',
  color: '#3498db',
};

const roleCardStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: '#ecf0f1',
  borderRadius: '4px',
};

const filterContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1rem',
  alignItems: 'center',
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
};

const selectStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1rem',
  minWidth: '150px',
};

const bulkActionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  background: '#e3f2fd',
  borderRadius: '4px',
  marginBottom: '1rem',
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: 'auto',
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const roleSelectStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #ddd',
};

const activeStatusStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  background: '#d4edda',
  color: '#155724',
  fontSize: '0.875rem',
  fontWeight: 'bold',
};

const inactiveStatusStyle: React.CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '12px',
  background: '#f8d7da',
  color: '#721c24',
  fontSize: '0.875rem',
  fontWeight: 'bold',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  backgroundColor: '#3498db',
  color: 'white',
  fontSize: '1rem',
};

const buttonSecondaryStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#95a5a6',
};

const buttonSuccessStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#27ae60',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
};

const buttonDangerStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#e74c3c',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
};

const paginationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '2rem',
};

export default AdminDashboard;
