import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import ChatLoading from './ChatLoading';
import { toast } from 'react-hot-toast';

const ScrollableChat = ({ messages, loading, deleteMessage }) => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  // Utility function to create image modals
  const createImageModal = (imageUrl, fileName) => {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300';
    
    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-transform duration-300 ease-out';
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-3 mt-4';
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200';
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>`;
    
    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full flex items-center transition-all duration-200 shadow-md';
    downloadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
    Download Image`;
    
    // Create button to copy image URL (without leaving the app)
    const copyBtn = document.createElement('button');
    copyBtn.className = 'bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full flex items-center transition-all duration-200 shadow-md';
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
    Copy Image URL`;
    
    // Add button events
    downloadBtn.addEventListener('click', () => {
      fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = fileName || 'image';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Downloading image...', {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
            iconTheme: {
              primary: '#4F46E5',
              secondary: '#fff',
            },
          });
        })
        .catch(() => toast.error('Download failed', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }));
    });
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(imageUrl)
        .then(() => {
          toast.success('Image URL copied to clipboard', {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
            iconTheme: {
              primary: '#4F46E5',
              secondary: '#fff',
            },
          });
        })
        .catch(() => {
          toast.error('Failed to copy URL', {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
        });
    });
    
    // Add buttons to container
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(copyBtn);
    
    // Assemble modal
    modal.appendChild(closeBtn);
    modal.appendChild(img);
    modal.appendChild(buttonContainer);
    
    // Add animation classes after a small delay
    setTimeout(() => {
      img.classList.add('scale-100');
    }, 50);
    
    // Close modal events
    closeBtn.addEventListener('click', () => {
      modal.classList.add('opacity-0');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      }
    });
    
    document.addEventListener('keydown', function onEscPress(e) {
      if (e.key === 'Escape') {
        modal.classList.add('opacity-0');
        setTimeout(() => {
          document.body.removeChild(modal);
          document.removeEventListener('keydown', onEscPress);
        }, 300);
      }
    });
    
    // Add to document
    document.body.appendChild(modal);
  };

  // Utility function to handle file downloads
  const handleFileDownload = (fileUrl, fileName) => {
    toast.loading('Preparing download...', {
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName || 'file';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.dismiss();
        toast.success(`Downloading ${fileName || 'file'}...`, {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          iconTheme: {
            primary: '#4F46E5',
            secondary: '#fff',
          },
        });
      })
      .catch(error => {
        console.error('Download error:', error);
        toast.dismiss();
        toast.error('Download failed', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      });
  };
  
  // Utility function to create PDF viewer modal
  const createPdfModal = (pdfUrl, fileName) => {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300';
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200';
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>`;
    
    // Create info text
    const infoText = document.createElement('div');
    infoText.className = 'text-white text-center mb-6';
    infoText.innerHTML = `<h3 class="text-xl font-bold mb-2">${fileName || 'PDF Document'}</h3>
      <p class="text-gray-300">PDF files can be viewed or downloaded</p>`;
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex flex-wrap justify-center gap-4 mb-4';
    
    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full flex items-center transition-all duration-200 shadow-md';
    downloadBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
    Download PDF`;
    
    // Create view button
    const viewBtn = document.createElement('button');
    viewBtn.className = 'bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full flex items-center transition-all duration-200 shadow-md';
    viewBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    View PDF`;
    
    // Create copy URL button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full flex items-center transition-all duration-200 shadow-md';
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
    Copy URL`;
    
    // Add button events
    downloadBtn.addEventListener('click', () => {
      handleFileDownload(pdfUrl, fileName, 'application/pdf');
    });
    
    viewBtn.addEventListener('click', () => {
      // Create an iframe to display the PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.className = 'w-full h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl opacity-0 transition-opacity duration-300';
      
      const iframe = document.createElement('iframe');
      iframe.src = pdfUrl;
      iframe.className = 'w-full h-full border-0';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      
      // Replace buttons with iframe
      pdfContainer.appendChild(iframe);
      buttonContainer.style.display = 'none';
      infoText.style.display = 'none';
      modal.appendChild(pdfContainer);
      
      // Add animation after a small delay
      setTimeout(() => {
        pdfContainer.classList.remove('opacity-0');
      }, 50);
      
      // Add back button
      const backBtn = document.createElement('button');
      backBtn.className = 'mt-4 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full transition-all duration-200 shadow-md';
      backBtn.textContent = 'Back to options';
      backBtn.addEventListener('click', () => {
        pdfContainer.classList.add('opacity-0');
        setTimeout(() => {
          pdfContainer.remove();
          backBtn.remove();
          buttonContainer.style.display = 'flex';
          infoText.style.display = 'block';
        }, 300);
      });
      
      modal.appendChild(backBtn);
    });
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pdfUrl)
        .then(() => {
          toast.success('PDF URL copied to clipboard', {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
            iconTheme: {
              primary: '#4F46E5',
              secondary: '#fff',
            },
          });
        })
        .catch(() => {
          toast.error('Failed to copy URL', {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
        });
    });
    
    // Add buttons to container
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(viewBtn);
    buttonContainer.appendChild(copyBtn);
    
    // Assemble modal
    modal.appendChild(closeBtn);
    modal.appendChild(infoText);
    modal.appendChild(buttonContainer);
    
    // Close modal events
    closeBtn.addEventListener('click', () => {
      modal.classList.add('opacity-0');
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      }
    });
    
    document.addEventListener('keydown', function onEscPress(e) {
      if (e.key === 'Escape') {
        modal.classList.add('opacity-0');
        setTimeout(() => {
          document.body.removeChild(modal);
          document.removeEventListener('keydown', onEscPress);
        }, 300);
      }
    });
    
    // Add to document with initial opacity settings for animation
    modal.style.opacity = '0';
    document.body.appendChild(modal);
    
    // Trigger animation
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
  };
  


  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const isFirstMessageByUser = (messages, i) => {
    return (
      i === 0 ||
      messages[i - 1].sender._id !== messages[i].sender._id
    );
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'h:mm a');
  };

  const shouldShowDate = (messages, i) => {
    if (i === 0) return true;
    
    const prevDate = new Date(messages[i - 1].createdAt).toDateString();
    const currDate = new Date(messages[i].createdAt).toDateString();
    
    return prevDate !== currDate;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'EEEE, MMMM d, yyyy');
  };

  // Updated to use async/await properly and add debug logs
  const handleDeleteMessage = async (e, messageId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!messageId) {
      console.error('Message ID is undefined or null');
      toast.error('Cannot delete message: Invalid message ID', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }
    
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    
    setDeletingId(messageToDelete);
    
    try {
      if (typeof deleteMessage !== 'function') {
        console.error('deleteMessage is not a function');
        toast.error('Delete functionality is not available', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }
      
      console.log('Calling deleteMessage function with ID:', messageToDelete);
      const success = await deleteMessage(messageToDelete);
      console.log('Delete operation result:', success);
      
      if (success) {
        toast.success('Message deleted successfully', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          iconTheme: {
            primary: '#4F46E5',
            secondary: '#fff',
          },
        });
      } else {
        toast.error('Failed to delete message', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    } catch (error) {
      console.error('Error in handleDeleteMessage:', error);
      toast.error(`Failed to delete message: ${error.message || 'Unknown error'}`, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } finally {
      setDeletingId(null);
      setMessageToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setMessageToDelete(null);
    setShowDeleteModal(false);
  };

  if (loading) {
    return <ChatLoading />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mb-3 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
        <p className="text-lg font-medium mb-1">No messages yet</p>
        <p className="text-sm">Start the conversation!</p>
      </div>
    );
  }

  // Sort messages by timestamp to ensure proper chronological order (oldest first)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="flex flex-col w-full">
      {sortedMessages.map((m, i) => {
        const isSenderMessage = m.sender.email === user?.email;
        
        return (
          <Fragment key={m._id}>
            {shouldShowDate(sortedMessages, i) && (
              <div className="text-center my-6">
                <span className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                  {formatDate(m.createdAt)}
                </span>
              </div>
            )}
            
            <div className={`flex items-end ${isSenderMessage ? 'justify-end' : 'justify-start'} mb-5 relative group`}>
      
              {!isSenderMessage && (
                <div className="flex-shrink-0 mr-2 mb-1">
                  <img
                    src={m.sender.profile?.profilePic || ''}
                    alt={m.sender.name}
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                </div>
              )}
              
              <div className={`flex flex-col ${isSenderMessage ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%] md:max-w-[65%]`}>
                {/* Show sender name for first message from a user */}
                {isFirstMessageByUser(sortedMessages, i) && !isSenderMessage && (
                  <span className="text-xs text-gray-500 font-medium mb-1 ml-1">
                    {m.sender.name}
                  </span>
                )}
                
                <div className="relative flex items-center">
                  {/* Delete button for own messages (only for sender) */}
                  {isSenderMessage && (
                    <button
                      onClick={(e) => handleDeleteMessage(e, m._id)}
                      disabled={deletingId === m._id}
                      className={`absolute -left-10 top-0 p-2 rounded-full ${
                        deletingId === m._id 
                          ? 'bg-gray-200 text-gray-400' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      } shadow-md transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 translate-x-2`}
                      aria-label="Delete message"
                      title="Delete message"
                    >
                      {deletingId === m._id ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  )}
                
                  <div 
                    className={`w-full px-4 py-2.5 rounded-2xl shadow-sm ${
                      isSenderMessage 
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}
                  >
                    {/* Message content based on type */}
                    {m.messageType === 'text' ? (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    ) : m.messageType === 'image' ? (
                      <div className="message-image-container">
                        <div className="block cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            createImageModal(m.fileUrl, m.fileName);
                          }}
                        >
                          <img 
                            src={m.fileUrl} 
                            alt={m.fileName || "Image"}
                            className="max-h-60 rounded-lg cursor-pointer object-contain hover:opacity-95 transition-opacity"
                            onError={(e) => {
                              console.error('Image failed to load:', m.fileUrl);
                              e.target.src = 'https://via.placeholder.com/200x150?text=Image+Failed+to+Load';
                            }}
                          />
                          {m.fileName && (
                            <p className={`text-xs mt-2 ${isSenderMessage ? 'text-indigo-100' : 'text-gray-500'}`}>
                              {m.fileName}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="file-container">
                        <button 
                          className={`flex items-center gap-3 p-3 rounded-xl w-full text-left ${
                            isSenderMessage ? 'bg-indigo-400 bg-opacity-30 hover:bg-opacity-40' : 'bg-gray-50 hover:bg-gray-100'
                          } transition-colors duration-200`}
                          onClick={(e) => {
                            e.preventDefault();
                            // Determine file type from extension or mime type
                            const isPdf = 
                              (m.fileName && m.fileName.toLowerCase().endsWith('.pdf')) || 
                              (m.fileType && m.fileType === 'application/pdf');
                            
                            if (isPdf) {
                              createPdfModal(m.fileUrl, m.fileName);
                            } else {
                              // Default to image modal to offer download option
                              createImageModal(m.fileUrl, m.fileName);
                            }
                          }}
                        >
                          {m.fileType && m.fileType === 'application/pdf' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                          )}
                          <div className="flex flex-col">
                            <span className="truncate max-w-[200px] font-medium">{m.fileName || 'File'}</span>
                            {m.fileSize && (
                              <span className="text-xs">
                                {Math.round(m.fileSize / 1024)} KB
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className={`text-xs mt-1.5 text-gray-500 px-1`}>
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          </Fragment>
        );
      })}
      <div ref={messagesEndRef} className="pb-2" />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-center text-gray-900">Delete Message</h3>
              <p className="mb-6 text-center text-gray-600">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingId !== null}
                  className={`px-4 py-2.5 rounded-xl font-medium text-white ${
                    deletingId !== null 
                      ? 'bg-red-400 cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-300'
                  } transition-colors focus:outline-none`}
                >
                  {deletingId !== null ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Message'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ScrollableChat.propTypes = {
  messages: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  deleteMessage: PropTypes.func.isRequired,
};

export default ScrollableChat; 