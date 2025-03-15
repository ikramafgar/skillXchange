import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import customAxios from '../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Users, 
  Award, 
  Clock, 
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  AlertCircle,
  BarChart3,
  UserCheck
} from 'lucide-react';

const AdminPanel = () => {
  const { isAdmin } = useAuthStore();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalLearners: 0,
    pendingVerifications: 0,
    verifiedTeachers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [activeTab, setActiveTab] = useState('verification');

  // Fetch pending teachers and stats
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch pending teachers
        const teachersResponse = await customAxios.get('/api/admin/pending-teachers');
        setPendingTeachers(teachersResponse.data);

        // Fetch admin stats
        const statsResponse = await customAxios.get('/api/admin/stats');
        setStats(statsResponse.data);

        setError(null);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin data. Please try again.');
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  // Handle teacher verification
  const handleVerifyTeacher = async (profileId, status) => {
    try {
      let data = { profileId, status };
      
      // If rejecting, include the reason
      if (status === 'rejected' && rejectionReason) {
        data.reason = rejectionReason;
      }
      
      await customAxios.post('/api/admin/verify-teacher', data);
      
      // Update the local state to remove the verified teacher
      setPendingTeachers(pendingTeachers.filter(teacher => teacher._id !== profileId));
      
      // Update stats
      if (status === 'approved') {
        setStats({
          ...stats,
          pendingVerifications: stats.pendingVerifications - 1,
          verifiedTeachers: stats.verifiedTeachers + 1
        });
      } else {
        setStats({
          ...stats,
          pendingVerifications: stats.pendingVerifications - 1
        });
      }
      
      // Reset rejection form
      setRejectionReason('');
      setShowRejectionForm(false);
      setSelectedTeacherId(null);
      
      toast.success(`Teacher ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error verifying teacher:', err);
      toast.error('Failed to verify teacher');
    }
  };

  // Toggle teacher expansion
  const toggleTeacherExpansion = (teacherId) => {
    if (expandedTeacher === teacherId) {
      setExpandedTeacher(null);
    } else {
      setExpandedTeacher(teacherId);
    }
  };

  // Show rejection form
  const showRejectForm = (teacherId) => {
    setSelectedTeacherId(teacherId);
    setShowRejectionForm(true);
  };

  // If not admin, don't show the panel
  if (!isAdmin) {
    return null;
  }

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading admin data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-center" />
      
      {/* Stats Cards */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <BarChart3 className="text-indigo-600 mr-3" size={20} />
          <h2 className="text-xl font-semibold text-gray-800">Platform Statistics</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100 transition-transform hover:scale-105 duration-300">
            <div className="flex flex-col">
              <div className="bg-blue-100 p-2 rounded-lg w-fit mb-3">
                <Users className="text-blue-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
              <h3 className="text-sm font-medium text-blue-700 mt-1">Total Users</h3>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-xl shadow-sm border border-green-100 transition-transform hover:scale-105 duration-300">
            <div className="flex flex-col">
              <div className="bg-green-100 p-2 rounded-lg w-fit mb-3">
                <Award className="text-green-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-green-900">{stats.verifiedTeachers}</p>
              <h3 className="text-sm font-medium text-green-700 mt-1">Verified Teachers</h3>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-xl shadow-sm border border-amber-100 transition-transform hover:scale-105 duration-300">
            <div className="flex flex-col">
              <div className="bg-amber-100 p-2 rounded-lg w-fit mb-3">
                <Clock className="text-amber-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-amber-900">{stats.pendingVerifications}</p>
              <h3 className="text-sm font-medium text-amber-700 mt-1">Pending Verifications</h3>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-5 rounded-xl shadow-sm border border-purple-100 transition-transform hover:scale-105 duration-300">
            <div className="flex flex-col">
              <div className="bg-purple-100 p-2 rounded-lg w-fit mb-3">
                <UserCheck className="text-purple-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-purple-900">{stats.totalTeachers || 0}</p>
              <h3 className="text-sm font-medium text-purple-700 mt-1">Total Teachers</h3>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl shadow-sm border border-rose-100 transition-transform hover:scale-105 duration-300">
            <div className="flex flex-col">
              <div className="bg-rose-100 p-2 rounded-lg w-fit mb-3">
                <User className="text-rose-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-rose-900">{stats.totalLearners || 0}</p>
              <h3 className="text-sm font-medium text-rose-700 mt-1">Total Learners</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-6 py-4 font-medium text-sm flex items-center whitespace-nowrap ${
              activeTab === 'verification'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={18} className="mr-2" />
            Teacher Verification
            {stats.pendingVerifications > 0 && (
              <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                {stats.pendingVerifications}
              </span>
            )}
          </button>
          {/* Additional tabs can be added here in the future */}
        </div>
        
        <div className="p-6">
          {activeTab === 'verification' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="mr-2 text-indigo-600" size={20} />
                Teacher Certificate Verification
              </h3>
              
              {pendingTeachers.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-xl text-center">
                  <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-3">
                    <CheckCircle className="text-gray-500" size={24} />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-1">All Caught Up!</h4>
                  <p className="text-gray-500">No pending teacher verifications at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTeachers.map((teacher) => (
                    <div key={teacher._id} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
                      {/* Teacher Header */}
                      <div 
                        className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                          expandedTeacher === teacher._id ? 'bg-indigo-50' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => toggleTeacherExpansion(teacher._id)}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${
                            expandedTeacher === teacher._id ? 'bg-indigo-100' : 'bg-gray-200'
                          }`}>
                            <User className={`${
                              expandedTeacher === teacher._id ? 'text-indigo-600' : 'text-gray-600'
                            }`} size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {teacher.user?.name || 'Unknown Teacher'}
                            </h4>
                            <p className="text-sm text-gray-500">{teacher.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium mr-3">
                            {teacher.role}
                          </span>
                          {expandedTeacher === teacher._id ? (
                            <ChevronUp size={20} className="text-indigo-600" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-500" />
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded Content */}
                      {expandedTeacher === teacher._id && (
                        <div className="p-5 border-t border-gray-200 bg-white">
                          {/* Skills Section */}
                          <div className="mb-6">
                            <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                              <Award className="text-indigo-500 mr-2" size={16} />
                              Skills to Teach:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {teacher.skillsToTeach && teacher.skillsToTeach.length > 0 ? (
                                teacher.skillsToTeach.map((skillObj, index) => (
                                  <span 
                                    key={index} 
                                    className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium"
                                  >
                                    {skillObj.skill?.name || 'Unknown Skill'}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 italic">No skills specified</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Certificates Section */}
                          <div className="mb-6">
                            <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                              <FileText className="text-indigo-500 mr-2" size={16} />
                              Certificates:
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {teacher.certificates && teacher.certificates.length > 0 ? (
                                teacher.certificates.map((cert, index) => (
                                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-50">
                                      {cert.endsWith('.pdf') ? (
                                        <div className="flex items-center justify-center bg-gray-100 h-full">
                                          <a 
                                            href={cert} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                                          >
                                            <FileText size={24} className="mr-2" />
                                            View PDF Certificate
                                            <ExternalLink size={14} className="ml-1" />
                                          </a>
                                        </div>
                                      ) : (
                                        <img 
                                          src={cert} 
                                          alt={`Certificate ${index + 1}`} 
                                          className="object-contain w-full h-full rounded"
                                        />
                                      )}
                                    </div>
                                    <div className="p-3 flex justify-between items-center bg-gray-50">
                                      <span className="text-sm font-medium text-gray-700">Certificate {index + 1}</span>
                                      <a 
                                        href={cert} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
                                      >
                                        View
                                        <ExternalLink size={12} className="ml-1" />
                                      </a>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full text-center p-4 bg-gray-50 rounded-xl">
                                  <span className="text-gray-500 italic">No certificates uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="mt-6 border-t border-gray-100 pt-4">
                            {showRejectionForm && selectedTeacherId === teacher._id ? (
                              <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Reason for rejection:
                                </label>
                                <textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Please provide a reason for rejection (optional)"
                                  className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                  rows="3"
                                />
                                <div className="flex flex-wrap justify-end gap-3">
                                  <button
                                    onClick={() => {
                                      setShowRejectionForm(false);
                                      setRejectionReason('');
                                      setSelectedTeacherId(null);
                                    }}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleVerifyTeacher(teacher._id, 'rejected')}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center font-medium"
                                  >
                                    <XCircle size={18} className="mr-2" />
                                    Confirm Rejection
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap justify-end gap-3">
                                <button
                                  onClick={() => showRejectForm(teacher._id)}
                                  className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center font-medium"
                                >
                                  <XCircle size={18} className="mr-2" />
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleVerifyTeacher(teacher._id, 'approved')}
                                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
                                >
                                  <CheckCircle size={18} className="mr-2" />
                                  Approve
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 