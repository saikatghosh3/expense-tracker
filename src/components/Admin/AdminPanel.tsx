import React, { useState, useEffect } from 'react';
import { Users, Trash2, Shield, Search, AlertTriangle } from 'lucide-react';
import { storage, User } from '../../data/storage';

interface UserWithStats extends User {
  expense_count: number;
  total_expenses: number;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const allUsers = storage.getAllUsers();
      const usersWithStats = allUsers.map(user => {
        const stats = storage.getUserStats(user.id);
        return {
          ...user,
          expense_count: stats.expenseCount,
          total_expenses: stats.totalExpenses,
        };
      });

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      storage.deleteUser(userId);
      await loadUsers();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Admin Panel</h2>
            <p className="text-sm text-slate-600">{users.length} total users</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
          <Users className="w-4 h-4" />
          {users.length} users
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base"
            placeholder="Search users by email or name..."
          />
        </div>
      </div>

      {/* Users Table - Responsive */}
      <div className="overflow-x-auto">
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700">User</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Role</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Expenses</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Total Spent</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Joined</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {user.fullName || 'No name'}
                      </div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      user.isAdmin 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-medium">
                    {user.expense_count || 0}
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-medium">
                    ${(user.total_expenses || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    {!user.isAdmin && (
                      <>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteUser(user.id)}
                              disabled={loading}
                              className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs rounded-lg hover:bg-slate-300 font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {user.fullName || 'No name'}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ml-2 ${
                  user.isAdmin 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {user.isAdmin ? 'Admin' : 'User'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-slate-600">Expenses:</span>
                  <span className="font-medium text-slate-900 ml-1">{user.expense_count || 0}</span>
                </div>
                <div>
                  <span className="text-slate-600">Total:</span>
                  <span className="font-medium text-slate-900 ml-1">${(user.total_expenses || 0).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
                {!user.isAdmin && (
                  <>
                    {deleteConfirm === user.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs rounded-lg hover:bg-slate-300 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No users found</h3>
          <p className="text-slate-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Warning */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 min-w-0 flex-1">
            <p className="font-semibold mb-1">Admin Panel Warning</p>
            <p>Deleting a user will permanently remove all their data including expenses and budgets. This action cannot be undone.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;