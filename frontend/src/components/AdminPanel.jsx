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
  UserCheck,
  BookOpen,
  Mail,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactMessages from './ContactMessages';

const AdminPanel = () => {
  const { isAdmin } = useAuthStore();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalLearners: 0,
    pendingVerifications: 0,
    verifiedTeachers: 0,
    totalContactMessages: 0,
    unreadContactMessages: 0,
    pendingCertificates: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState(null);
  const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' or 'messages' or 'certificates'
  const [expandedCertificate, setExpandedCertificate] = useState(null);
 

  const statsCards = [
    { 
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users />,
      color: "from-blue-500 to-blue-600",
      bgGlow: "from-blue-400/20 to-transparent"
    },
    { 
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: <Award />,
      color: "from-purple-500 to-purple-600",
      bgGlow: "from-purple-400/20 to-transparent"
    },
    { 
      title: "Total Learners",
      value: stats.totalLearners,
      icon: <BookOpen />,
      color: "from-emerald-500 to-emerald-600",
      bgGlow: "from-emerald-400/20 to-transparent"
    },
    { 
      title: "Pending Certificates",
      value: stats.pendingCertificates,
      icon: <FileCheck />,
      color: "from-teal-500 to-teal-600",
      bgGlow: "from-teal-400/20 to-transparent",
      onClick: () => setActiveTab('certificates')
    },
    { 
      title: "Unread Messages",
      value: stats.unreadContactMessages,
      icon: <Mail />,
      color: "from-pink-500 to-pink-600",
      bgGlow: "from-pink-400/20 to-transparent",
      onClick: () => setActiveTab('messages')
    }
  ];

  // Fetch pending teachers and stats
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch pending teachers and certificates in parallel
        const [teachersResponse, certificatesResponse, statsResponse] = await Promise.all([
          customAxios.get('/api/admin/pending-teachers'),
          customAxios.get('/api/certificates/admin/pending'),
          customAxios.get('/api/admin/stats')
        ]);
        
        setPendingTeachers(teachersResponse.data);
        setPendingCertificates(certificatesResponse.data);
        
        // Update stats with certificate count
        const updatedStats = {
          ...statsResponse.data,
          pendingCertificates: certificatesResponse.data.length
        };
        
        setStats(updatedStats);
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

  // Handle certificate approval or rejection
  const handleProcessCertificate = async (certificateId, status) => {
    try {
      let data = { certificateId, status };
      
      // If rejecting, include the reason
      if (status === 'rejected' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
      
      await customAxios.post('/api/certificates/admin/process', data);
      
      // Update the local state to remove the processed certificate
      setPendingCertificates(pendingCertificates.filter(cert => cert._id !== certificateId));
      
      // Update stats
      setStats({
        ...stats,
        pendingCertificates: stats.pendingCertificates - 1
      });
      
      // Reset rejection form
      setRejectionReason('');
      setShowRejectionForm(false);
      setSelectedCertificateId(null);
      
      toast.success(`Certificate ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error processing certificate:', err);
      toast.error('Failed to process certificate');
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

  // Show certificate rejection form
  const showCertificateRejectForm = (certificateId) => {
    setSelectedCertificateId(certificateId);
    setShowRejectionForm(true);
  };

  // Toggle certificate expansion
  const toggleCertificateExpansion = (certificateId) => {
    if (expandedCertificate === certificateId) {
      setExpandedCertificate(null);
    } else {
      setExpandedCertificate(certificateId);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Error Loading Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <ToastContainer position="top-center" />
      
      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
      >
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300 ${card.onClick ? 'cursor-pointer' : ''}`}
            onClick={card.onClick}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="p-6 relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <h3 className="text-gray-600 font-medium mb-2">{card.title}</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 mb-8">
        <div className="flex">
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'teachers'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('teachers')}
          >
            Pending Teacher Verifications
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'certificates'
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('certificates')}
          >
            Certificate Requests
            {stats.pendingCertificates > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs">
                {stats.pendingCertificates}
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'messages'
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            Contact Messages
            {stats.unreadContactMessages > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                {stats.unreadContactMessages}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'teachers' ? (
          <motion.div
            key="teachers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Pending Verifications Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 flex items-center justify-center text-white">
                    <UserCheck />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Pending Verifications</h2>
                </div>
                <span className="px-4 py-2 bg-violet-100 text-violet-700 rounded-xl font-medium">
                  {pendingTeachers.length} pending
                </span>
              </div>

              <div className="space-y-4">
                {pendingTeachers.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <UserCheck className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-1">No pending verifications</h3>
                    <p className="text-gray-500">All teacher verifications are complete</p>
                  </div>
                ) : (
                  pendingTeachers.map((teacher) => (
                    <AnimatePresence key={teacher._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        {/* ... existing teacher verification UI with enhanced styling ... */}
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
                      </motion.div>
                    </AnimatePresence>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'certificates' ? (
          <motion.div
            key="certificates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Pending Certificates Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white">
                    <FileCheck size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Pending Certificate Requests</h2>
                </div>
                <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-xl font-medium">
                  {pendingCertificates.length} pending
                </span>
              </div>

              <div className="space-y-4">
                {pendingCertificates.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FileCheck className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-1">No pending certificate requests</h3>
                    <p className="text-gray-500">All certificate requests are processed</p>
                  </div>
                ) : (
                  pendingCertificates.map((certificate) => (
                    <AnimatePresence key={certificate._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
                          {/* Certificate Request Header */}
                          <div 
                            className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                              expandedCertificate === certificate._id ? 'bg-teal-50' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => toggleCertificateExpansion(certificate._id)}
                          >
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg mr-3 ${
                                expandedCertificate === certificate._id ? 'bg-teal-100' : 'bg-gray-200'
                              }`}>
                                <FileCheck className={`${
                                  expandedCertificate === certificate._id ? 'text-teal-600' : 'text-gray-600'
                                }`} size={20} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  {certificate.user?.name || 'Unknown User'}
                                </h4>
                                <p className="text-sm text-gray-500">{certificate.skill?.name} Certificate</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium mr-3">
                                {certificate.certificateId}
                              </span>
                              {expandedCertificate === certificate._id ? (
                                <ChevronUp size={20} className="text-teal-600" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-500" />
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Content */}
                          {expandedCertificate === certificate._id && (
                            <div className="p-5 border-t border-gray-200 bg-white">
                              {/* Certificate Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h5 className="font-medium text-gray-700 mb-2">Student Details</h5>
                                  <div className="space-y-2">
                                    <p className="text-sm flex justify-between">
                                      <span className="text-gray-500">Name:</span>
                                      <span className="font-medium">{certificate.user?.name}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                      <span className="text-gray-500">Email:</span>
                                      <span className="font-medium">{certificate.user?.email}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                      <span className="text-gray-500">Request Date:</span>
                                      <span className="font-medium">
                                        {new Date(certificate.requestedAt).toLocaleDateString()}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h5 className="font-medium text-gray-700 mb-2">Certificate Details</h5>
                                  <div className="space-y-2">
                                    <p className="text-sm flex justify-between">
                                      <span className="text-gray-500">Skill:</span>
                                      <span className="font-medium">{certificate.skill?.name}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                      <span className="text-gray-500">Teacher:</span>
                                      <span className="font-medium">{certificate.teacher?.name}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                      <span className="text-gray-500">Certificate ID:</span>
                                      <span className="font-medium">{certificate.certificateId}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Sessions Completed */}
                              <div className="mb-6">
                                <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                  <Clock className="text-teal-500 mr-2" size={16} />
                                  Completed Sessions:
                                </h5>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {certificate.sessions && certificate.sessions.length > 0 ? (
                                        certificate.sessions.map((session, index) => (
                                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-3 py-2 text-sm text-gray-500">
                                              {new Date(session.startTime).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-2 text-sm font-medium text-gray-800">
                                              {session.title}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-500">
                                              {session.duration} minutes
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="3" className="px-3 py-2 text-sm text-gray-500 text-center">
                                            No session data available
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="mt-6 border-t border-gray-100 pt-4">
                                {showRejectionForm && selectedCertificateId === certificate._id ? (
                                  <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Reason for rejection:
                                    </label>
                                    <textarea
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Please provide a reason for rejection (optional)"
                                      className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                      rows="3"
                                    />
                                    <div className="flex flex-wrap justify-end gap-3">
                                      <button
                                        onClick={() => {
                                          setShowRejectionForm(false);
                                          setRejectionReason('');
                                          setSelectedCertificateId(null);
                                        }}
                                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleProcessCertificate(certificate._id, 'rejected')}
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
                                      onClick={() => showCertificateRejectForm(certificate._id)}
                                      className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center font-medium"
                                    >
                                      <XCircle size={18} className="mr-2" />
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => handleProcessCertificate(certificate._id, 'approved')}
                                      className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center font-medium"
                                    >
                                      <CheckCircle size={18} className="mr-2" />
                                      Issue Certificate
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="messages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContactMessages />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel; 
