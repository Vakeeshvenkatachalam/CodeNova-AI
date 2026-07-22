import React, { useEffect, useState } from 'react';
import { adminService, UserDetail, AdminUserProgress } from '../../services/adminService';
import { Badge } from '../../components/common/Badge';
import {
  Users, User, ArrowUpCircle, ArrowDownCircle, X, Trash2,
  Search, ChevronUp, ChevronDown, Award, MessageSquare, BookOpen
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserProgress | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.listUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (id: number, currentRole: string) => {
    const action = currentRole === 'ROLE_ADMIN' ? 'DEMOTE' : 'PROMOTE';
    const confirmMsg = currentRole === 'ROLE_ADMIN'
      ? 'Demote this Admin to standard User role?'
      : 'Promote this User to Administrator role?';
    if (!window.confirm(confirmMsg)) return;

    setUpdatingUserId(id);
    try {
      await adminService.toggleUserAccess(id, action);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (id: number, email: string) => {
    if (!window.confirm(`Are you sure you want to delete student "${email}"? This action cannot be undone and will delete all their code submissions and history.`)) {
      return;
    }

    setUpdatingUserId(id);
    try {
      await adminService.deleteUser(id);
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser(null);
      }
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete student.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleViewDetails = async (userId: number) => {
    setLoadingDetails(true);
    setSelectedUser(null);
    try {
      const details = await adminService.getUserProgress(userId);
      setSelectedUser(details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-80 bg-gray-800 rounded-xl" />
        <div className="h-12 bg-gray-800 rounded-xl" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Student Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage user accounts, roles, and audit individual student progress records.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Users table */}
        <div className="lg:col-span-2 bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 bg-gray-900/80 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-gray-600"
              />
              <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-gray-600" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[9px] font-bold">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-ai flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                          {(usr.name || usr.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          {usr.name && (
                            <p className="font-bold text-white text-[11px] leading-tight">{usr.name}</p>
                          )}
                          <p className={`font-semibold ${usr.name ? 'text-gray-400 text-[10px]' : 'text-white text-[11px]'}`}>{usr.email}</p>
                          <p className="text-[9px] text-gray-600 font-mono">UID: {usr.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        usr.role === 'ROLE_ADMIN'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>
                        {usr.role === 'ROLE_ADMIN' ? '⚡ Admin' : '👤 Student'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(usr.id)}
                          className="text-[10px] font-bold px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          View Progress
                        </button>
                        <button
                          onClick={() => handleDeleteUser(usr.id, usr.email)}
                          disabled={updatingUserId === usr.id}
                          className="text-[10px] font-bold px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                        <button
                          onClick={() => handleToggleAccess(usr.id, usr.role)}
                          disabled={updatingUserId === usr.id}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors ${
                            usr.role === 'ROLE_ADMIN'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                              : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                          } disabled:opacity-50`}
                        >
                          {updatingUserId === usr.id ? (
                            <span className="animate-pulse">...</span>
                          ) : usr.role === 'ROLE_ADMIN' ? (
                            <><ArrowDownCircle className="h-3 w-3" /> Demote</>
                          ) : (
                            <><ArrowUpCircle className="h-3 w-3" /> Promote</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="py-12 text-center text-gray-600 text-xs">No students match your search.</div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-gray-800 text-[10px] text-gray-600">
            Showing {filteredUsers.length} of {users.length} students
          </div>
        </div>

        {/* Right: Student progress detail card */}
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-5 relative min-h-[500px]">
          {loadingDetails ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Loading student records...</p>
              </div>
            </div>
          ) : selectedUser ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedUser.name || 'Anonymous Coder'}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Level + XP bar */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-ai flex items-center justify-center text-white font-extrabold text-sm shadow-lg shrink-0">
                  {selectedUser.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase mb-1">
                    <span>Level {selectedUser.level}</span>
                    <span>{selectedUser.totalXp} XP</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-ai rounded-full"
                      style={{ width: `${selectedUser.totalXp % 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 border-y border-gray-800 py-3">
                <div className="text-center">
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Solves</p>
                  <p className="font-extrabold text-white text-sm">{selectedUser.problemsSolved}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Runs</p>
                  <p className="font-extrabold text-white text-sm">{selectedUser.totalSubmissions}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-gray-500 font-bold uppercase">Chats</p>
                  <p className="font-extrabold text-white text-sm">{selectedUser.totalSessions}</p>
                </div>
              </div>

              {/* Language strengths */}
              <div className="space-y-2 text-xs">
                <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Language Profile</p>
                <div className="flex justify-between">
                  <span className="text-gray-400">Preferred:</span>
                  <span className="font-bold text-primary">{selectedUser.preferredLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Strongest:</span>
                  <span className="font-bold text-green-400">{selectedUser.strongestLanguage}</span>
                </div>
              </div>

              {/* Language solves breakdown */}
              {selectedUser.solvesByLanguage && Object.keys(selectedUser.solvesByLanguage).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Solves by Language</p>
                  {Object.entries(selectedUser.solvesByLanguage).map(([lang, count]) => (
                    <div key={lang} className="flex justify-between text-xs">
                      <span className="text-gray-400">{lang}</span>
                      <span className="font-bold text-white">{count} solves</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bio */}
              {selectedUser.bio && (
                <div className="bg-gray-900/60 border border-gray-800 p-2.5 rounded-lg text-[11px] text-gray-400 italic">
                  "{selectedUser.bio}"
                </div>
              )}

              {/* Recent submissions */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Recent Submissions</p>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {selectedUser.recentSubmissions.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="flex justify-between items-center text-[10px] border-b border-gray-800/50 pb-1.5">
                      <span className="truncate max-w-[120px] text-gray-300 font-semibold">{sub.problemTitle}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-600 font-mono text-[9px]">{sub.language}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                          sub.status === 'PASSED'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>{sub.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-800 rounded-2xl m-3">
              <User className="h-10 w-10 text-gray-700 mb-3" />
              <p className="text-sm font-bold text-gray-500">Select a Student</p>
              <p className="text-[10px] text-gray-600 mt-1 max-w-[160px] leading-relaxed">
                Click "View Progress" on any student to view their full learning report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
