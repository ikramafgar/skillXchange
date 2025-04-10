import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import customAxios from '../utils/axios';
import { toast } from 'react-hot-toast';
import { 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Download, 
  ExternalLink, 
  FileText, 
  Loader2, 
  RefreshCw, 
  XCircle 
} from 'lucide-react';


const Certificates = () => {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [eligibility, setEligibility] = useState({
    eligible: false,
    eligibleSkills: []
  });
  const [certificates, setCertificates] = useState([]);
  const [expandedCertificate, setExpandedCertificate] = useState(null);
  const isInitialMount = useRef(true);
  
  // Get the base URL for API calls
  const getApiBaseUrl = () => {
    // Get base URL from environment if available, otherwise use relative path
    return import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/` : '/';
  };
  
  // Helper to construct proper certificate URL
  const getCertificateUrl = (url) => {
    if (!url) return '';

    // If URL is already absolute (starts with http), return as is
    if (url.startsWith('http')) {
      return url;
    }

    // If URL already starts with '/', just append to base
    if (url.startsWith('/')) {
      return `${getApiBaseUrl().replace(/\/$/, '')}${url}`;
    }

    // Otherwise, ensure we have a proper path join
    return `${getApiBaseUrl()}${url}`;
  };
  
  // Fetch certificates and eligibility when component mounts
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get user certificates
        const certificatesResponse = await customAxios.get('/api/certificates/user');
        setCertificates(certificatesResponse.data);
        
        // Check eligibility for certificates (silent mode for initial load)
        await checkEligibility(true);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        toast.error('Failed to load certificate data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);
  
  // Check eligibility for certificates
  const checkEligibility = async (silent = false) => {
    setEligibilityLoading(true);
    
    try {
      const response = await customAxios.get('/api/certificates/eligibility');
      
      // Check if response data is valid
      if (!response.data || typeof response.data !== 'object') {
        if (!silent) {
          toast.error('Received invalid eligibility data format');
        }
        return;
      }
      
      // Set eligibility data
      setEligibility(response.data);
      
      // Only show toast notifications if not in silent mode
      if (!silent) {
        // Log eligible skills count
        const eligibleCount = response.data.eligibleSkills?.length || 0;
        
        if (eligibleCount > 0) {
          toast.success(`You're eligible for ${eligibleCount} certificate${eligibleCount > 1 ? 's' : ''}!`);
        } else {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-700">
                      Complete at least 3 sessions for a skill to become eligible for a certificate
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ), { duration: 4000 });
        }
      }
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
      if (!silent) {
        toast.error(`Failed to check certificate eligibility: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setEligibilityLoading(false);
    }
  };
  
  // Request a certificate
  const requestCertificate = async (skillId, teacherId) => {
    setRequestLoading(true);
    
    try {
      const response = await customAxios.post('/api/certificates/request', {
        skillId,
        teacherId
      });
      
      toast.success('Certificate request submitted successfully');
      
      // Update the eligibility data
      const updatedEligibleSkills = eligibility.eligibleSkills.map(skill => {
        if (skill.skillId === skillId) {
          return {
            ...skill,
            certificateStatus: 'pending',
            certificateId: response.data.certificate._id
          };
        }
        return skill;
      });
      
      setEligibility({
        ...eligibility,
        eligibleSkills: updatedEligibleSkills
      });
      
      // Add the new certificate to the certificates list
      setCertificates([response.data.certificate, ...certificates]);
    } catch (error) {
      console.error('Error requesting certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to request certificate');
    } finally {
      setRequestLoading(false);
    }
  };
  
  // Track certificate download
  const trackDownload = async (certificateId) => {
    try {
      await customAxios.post(`/api/certificates/${certificateId}/download`);
    } catch (error) {
      console.error('Error tracking certificate download:', error);
    }
  };
  
  // Helper function to handle certificate download
  const handleCertificateDownload = async (certificateId) => {
    try {
      // First track the download
      trackDownload(certificateId);
      
      // Direct URL to certificate download endpoint
      const downloadUrl = getCertificateUrl(`api/certificates/${certificateId}/download`);
      
      // Open the PDF in a new tab instead of direct download
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate. Please try again.');
    }
  };
  
  // Toggle certificate expansion
  const toggleCertificateExpansion = (certificateId) => {
    if (expandedCertificate === certificateId) {
      setExpandedCertificate(null);
    } else {
      setExpandedCertificate(certificateId);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-600">Loading certificates...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* My Certificates Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Award className="mr-2 text-blue-600" size={22} />
            My Certificates
          </h2>
          
          <button 
            onClick={() => checkEligibility(false)}
            disabled={eligibilityLoading} 
            className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {eligibilityLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw size={14} className="mr-1" />
            )}
            Refresh
          </button>
        </div>
        
        {certificates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">No certificates yet</h3>
            <p className="text-gray-500 mb-4">Complete sessions and request certificates to see them here</p>
            
            <button 
              onClick={() => checkEligibility(false)}
              disabled={eligibilityLoading} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center mx-auto hover:bg-blue-700 transition-colors"
            >
              {eligibilityLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw size={16} className="mr-2" />
              )}
              Check Eligibility
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <div 
                key={certificate._id} 
                className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Certificate Header */}
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${
                    expandedCertificate === certificate._id ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => toggleCertificateExpansion(certificate._id)}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      expandedCertificate === certificate._id ? 'bg-blue-100' : 'bg-gray-200'
                    }`}>
                      <Award className={`${
                        expandedCertificate === certificate._id ? 'text-blue-600' : 'text-gray-600'
                      }`} size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {certificate.skill?.name} Certificate
                      </h4>
                      <p className="text-sm text-gray-500">
                        Certificate ID: {certificate.certificateId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
                      certificate.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : certificate.status === 'pending' 
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {certificate.status === 'approved' 
                        ? 'Approved' 
                        : certificate.status === 'pending' 
                          ? 'Pending'
                          : 'Rejected'}
                    </span>
                    {expandedCertificate === certificate._id ? (
                      <ChevronUp size={20} className="text-blue-600" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </div>
                </div>
                
                {/* Expanded Content */}
                {expandedCertificate === certificate._id && (
                  <div className="p-5 border-t border-gray-200 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">Certificate Details</h5>
                        <div className="space-y-2">
                          <p className="text-sm flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span className={`font-medium ${
                              certificate.status === 'approved' 
                                ? 'text-green-600' 
                                : certificate.status === 'pending' 
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                            }`}>
                              {certificate.status === 'approved' 
                                ? 'Approved' 
                                : certificate.status === 'pending' 
                                  ? 'Pending Approval'
                                  : 'Rejected'}
                            </span>
                          </p>
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
                          <p className="text-sm flex justify-between">
                            <span className="text-gray-500">Requested:</span>
                            <span className="font-medium">
                              {new Date(certificate.requestedAt).toLocaleDateString()}
                            </span>
                          </p>
                          {certificate.status === 'approved' && certificate.approvedAt && (
                            <p className="text-sm flex justify-between">
                              <span className="text-gray-500">Approved:</span>
                              <span className="font-medium">
                                {new Date(certificate.approvedAt).toLocaleDateString()}
                              </span>
                            </p>
                          )}
                          {certificate.status === 'rejected' && certificate.rejectionReason && (
                            <div className="mt-2 bg-red-50 p-3 rounded-lg">
                              <p className="text-sm text-red-800 font-medium">Rejection Reason:</p>
                              <p className="text-sm text-red-700 mt-1">{certificate.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {certificate.status === 'approved' && certificate.certificateUrl && (
                        <div className="bg-blue-50 p-4 rounded-lg flex flex-col justify-between">
                          <h5 className="font-medium text-gray-700 mb-2">Download Certificate</h5>
                          <div className="flex-1 flex items-center justify-center">
                            <FileText className="text-blue-500 h-16 w-16" />
                          </div>
                          <a 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handleCertificateDownload(certificate._id);
                            }}
                            className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download size={16} className="mr-2" />
                            Download Certificate
                          </a>
                          <a 
                            href={getCertificateUrl(`api/certificates/${certificate._id}/download`)}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center justify-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            View in Browser
                            <ExternalLink size={14} className="ml-1" />
                          </a>
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
      
      {/* Eligible for Certificate Section */}
      {eligibility.eligible && eligibility.eligibleSkills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
            <Clock className="mr-2 text-indigo-600" size={22} />
            Eligible for Certificates
          </h2>
          
          <div className="space-y-4">
            {eligibility.eligibleSkills.map((skill) => (
              <div 
                key={skill.skillId} 
                className="bg-indigo-50 rounded-xl p-4 border border-indigo-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 flex items-center">
                      <Award className="mr-2 text-indigo-600" size={16} />
                      {skill.skillName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      You&apos;ve completed {skill.sessions.length} sessions with {skill.teacherName}
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    {skill.certificateStatus === 'pending' ? (
                      <div className="flex items-center text-amber-700 bg-amber-100 px-4 py-2 rounded-lg">
                        <Clock size={16} className="mr-2" />
                        Certificate request pending
                      </div>
                    ) : skill.certificateStatus === 'approved' ? (
                      <a 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCertificateDownload(skill.certificateId);
                        }}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download size={16} className="mr-2" />
                        Download Certificate
                      </a>
                    ) : skill.certificateStatus === 'rejected' ? (
                      <div className="flex items-center text-red-700 bg-red-100 px-4 py-2 rounded-lg">
                        <XCircle size={16} className="mr-2" />
                        Certificate request rejected
                      </div>
                    ) : (
                      <button 
                        onClick={() => requestCertificate(skill.skillId, skill.teacherId)}
                        disabled={requestLoading} 
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        {requestLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Award size={16} className="mr-2" />
                        )}
                        Request Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates; 