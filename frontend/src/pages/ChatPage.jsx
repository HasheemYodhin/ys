import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, Search, Plus, MoreVertical, Smile, Paperclip, X, Users, File, Image, Camera, Mic, Video, FileText, StickyNote, Calendar, Phone, Sparkles, Download, Mail, Briefcase } from 'lucide-react';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { API_BASE_URL } from '../config';
import { useSocket } from '../context/SocketContext';

export default function ChatPage() {
  const { user } = useAuth();
  // ... existing state ...
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const { socket, callState, setCallState, endCall: globalEndCall, stopRingtone } = useSocket();
  const callingAudioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  useEffect(() => {
    callingAudioRef.current.loop = true;
  }, []);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileType, setFileType] = useState('file');

  // Modal States
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [cameraStream, setCameraStream] = useState(null);

  // New Features State
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const handleAttachmentSelect = (type) => {
    setFileType(type);
    setShowAttachMenu(false);

    if (type === 'document') {
      if (fileInputRef.current) {
        fileInputRef.current.accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";
        fileInputRef.current.click();
      }
    } else if (type === 'image') {
      if (fileInputRef.current) {
        fileInputRef.current.accept = "image/*,video/*";
        fileInputRef.current.click();
      }
    } else if (type === 'poll') {
      setShowPollModal(true);
    } else if (type === 'camera') {
      setShowCameraModal(true);
      startCamera();
    } else if (type === 'audio') {
      setShowAudioModal(true);
    } else if (type === 'contact') {
      setShowContactModal(true);
    } else if (type === 'sticker') {
      setShowStickerModal(true);
    } else {
      alert(`${type} feature coming soon!`);
    }
  };

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);


  // Handle Socket Events (Moved connection logic to Context, just listeners here)
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('ChatPage connected');
      if (selectedConversation?._id) {
        console.log('Re-joining conversation room on connect:', selectedConversation._id);
        socket.emit('join_conversation', { conversation_id: selectedConversation._id });
      }
    };

    const handleNewMessage = (data) => {
      console.log('DEBUG: Received new_message socket event:', data);
      if (data.sender_id === user?._id) {
        console.log('Ignoring own message');
        return;
      }
      if (selectedConversation && data.conversation_id === selectedConversation._id) {
        console.log('Updating messages list with new message');
        setMessages(prev => [...prev, data]);
      } else {
        console.log('Message not for current conversation. Current:', selectedConversation?._id, 'Msg Conv:', data.conversation_id);
      }
      fetchConversations();
    };

    const handleUserTyping = (data) => {
      setTypingUser(data.user_name);
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    };

    const handleStatusUpdate = (data) => {
      setAvailableUsers(prev => prev.map(u =>
        u.id === data.user_id ? { ...u, is_online: data.is_online, current_status: data.current_status, last_seen: data.last_seen } : u
      ));
      setConversations(prev => prev.map(conv => {
        const hasParticipant = conv.participants_data?.some(p => p.id === data.user_id);
        if (!hasParticipant) return conv;
        return {
          ...conv,
          participants_data: conv.participants_data.map(p =>
            p.id === data.user_id ? { ...p, is_online: data.is_online, current_status: data.current_status, last_seen: data.last_seen } : p
          )
        };
      }));
    };

    const handleCallIncoming = (data) => {
      // Obsolete: Handled in SocketContext
    };

    const handleCallAnswered = async (data) => {
      callingAudioRef.current.pause();
      callingAudioRef.current.currentTime = 0;
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));

        // Process queued candidates
        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn("Failed to add queued candidate:", e);
          }
        }

        setCallState(prev => ({ ...prev, status: 'active' }));
      }
    };

    const handleIceCandidate = async (data) => {
      console.log("Received ICE candidate from signaling", data.candidate);
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log("Successfully added ICE candidate");
        } catch (e) {
          console.error("Error adding ice candidate", e);
        }
      } else {
        console.log("Queuing ICE candidate (PC not ready or remoteDescription not set)");
        iceCandidateQueue.current.push(data.candidate);
      }
    };

    const handleCallEnded = () => {
      console.log("Call ended by other user");
      handleEndCallCleanup();
    };

    socket.on('connect', handleConnect);
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('status_update', handleStatusUpdate);
    socket.on('call_incoming', handleCallIncoming);
    socket.on('call_answered', handleCallAnswered);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('status_update', handleStatusUpdate);
      socket.off('call_incoming', handleCallIncoming);
      socket.off('call_answered', handleCallAnswered);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, selectedConversation, user?._id]);


  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      if (socket) {
        socket.emit('join_conversation', { conversation_id: selectedConversation._id });
      }
    }
  }, [selectedConversation, socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log("Attaching local stream to element", localVideoRef.current.tagName);
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState.show, callState.status]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("Attaching remote stream to element", remoteVideoRef.current.tagName);
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState.show, callState.status]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('ys_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('ys_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const [error, setError] = useState(null);

  const fetchAvailableUsers = async () => {
    setError(null);
    try {
      const token = sessionStorage.getItem('ys_token');
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
      } else {
        const errText = await response.text();
        console.error("Fetch users failed:", response.status, errText);
        setError(`Failed to load users (Status: ${response.status}). Please try logging out and back in.`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError("Network error. Ensure backend is running.");
    }
  };

  const onEmojiClick = (emojiData) => {
    if (emojiData && emojiData.emoji) {
      setNewMessage(prev => prev + emojiData.emoji);
      // Optional: keep picker open or close it
      setShowEmojiPicker(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ys_token')}`
        },
        body: JSON.stringify({
          conversation_id: selectedConversation._id,
          content: newMessage
        })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Emit via Socket.IO for real-time delivery
        if (socket) {
          socket.emit('send_message', {
            conversation_id: selectedConversation._id,
            ...message
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('typing', {
        conversation_id: selectedConversation._id,
        user_name: user?.name || 'Someone'
      });
    }
  };

  const handleEndCallCleanup = () => {
    callingAudioRef.current.pause();
    callingAudioRef.current.currentTime = 0;
    if (stopRingtone) stopRingtone();

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    iceCandidateQueue.current = [];
    if (globalEndCall && callState.otherUser) {
      globalEndCall(callState.otherUser.id);
    } else {
      setCallState({ show: false, type: null, isIncoming: false, otherUser: null, status: 'idle', offer: null });
    }
    if (socket) socket.emit('update_status', { status: 'online' });
  };

  const startCall = async (type) => {
    if (!selectedConversation) return;
    const otherUser = selectedConversation.participants_data?.[0];
    if (!otherUser) return;

    if (socket) socket.emit('update_status', { status: 'in-call' });

    setCallState({ show: true, type, isIncoming: false, otherUser, status: 'calling' });
    callingAudioRef.current.play().catch(e => console.error("Audio play failed:", e));

    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log("Sending ICE candidate to signaling");
          socket.emit('ice_candidate', {
            target_id: otherUser.id,
            candidate: event.candidate
          });
        }
      };

      pc.ontrack = (event) => {
        console.log("Received remote track", event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      peerConnectionRef.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Local description set (offer)");

      socket.emit('call_user', {
        target_id: otherUser.id,
        offer,
        type,
        caller_name: user?.full_name || user?.name || 'Someone'
      });

      peerConnectionRef.current = pc;
    } catch (err) {
      console.error("Call error:", err);
      handleEndCallCleanup();
      alert("Could not start call: " + err.message);
    }
  };

  const answerCall = async () => {
    if (stopRingtone) stopRingtone();
    if (socket) socket.emit('update_status', { status: 'in-call' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.type === 'video'
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log("Sending ICE candidate to signaling (Answerer)");
          socket.emit('ice_candidate', {
            target_id: callState.otherUser.id,
            candidate: event.candidate
          });
        }
      };

      pc.ontrack = (event) => {
        console.log("Received remote track (Answerer)", event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(callState.offer));
      console.log("Remote description set (offer)");

      // Process queued candidates
      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("Added queued ICE candidate");
        } catch (e) {
          console.warn("Failed to add queued candidate", e);
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("Local description set (answer)");

      socket.emit('answer_call', {
        target_id: callState.otherUser.id,
        answer
      });

      peerConnectionRef.current = pc;
      setCallState(prev => ({ ...prev, status: 'active' }));
    } catch (err) {
      console.error("Answer error:", err);
      handleEndCallCleanup();
    }
  };

  const rejectCall = () => {
    if (socket && callState.otherUser) {
      socket.emit('end_call', { target_id: callState.otherUser.id });
    }
    handleEndCallCleanup();
  };

  const handleVote = async (messageId, optionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/vote?option_id=${optionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('ys_token')}`
        }
      });
      if (response.ok) {
        const updateMsg = await response.json();
        setMessages(prev => prev.map(m => m._id === messageId ? updateMsg : m));
        if (socket) {
          socket.emit('send_message', {
            conversation_id: selectedConversation._id,
            ...updateMsg
          });
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Call Modal Component
  const renderCallModal = () => {
    if (!callState.show) return null;

    return (
      <div className="call-modal">
        <div className="call-content">
          {callState.type === 'video' && callState.status === 'active' && (
            <>
              <video
                ref={remoteVideoRef}
                className="remote-video"
                autoPlay
                playsInline
              />
              <video
                ref={localVideoRef}
                className="local-video"
                autoPlay
                playsInline
                muted
              />
            </>
          )}

          {callState.status !== 'active' && (
            <div className="call-user-info">
              <div className="call-avatar">
                {callState.otherUser?.name?.charAt(0).toUpperCase()}
              </div>
              <h2>{callState.otherUser?.name}</h2>
              <div className="call-status">
                {callState.status === 'ringing' ? 'Incoming Call...' :
                  callState.status === 'calling' ? 'Calling...' :
                    callState.status}
              </div>
            </div>
          )}

          {callState.type === 'audio' && callState.status === 'active' && (
            <div className="call-user-info">
              <div className="call-avatar">
                <Phone size={48} />
              </div>
              <h2>Talking to {callState.otherUser?.name}</h2>
              <div className="call-status">
                {Math.floor(callDuration / 60).toString().padStart(2, '0')}:
                {(callDuration % 60).toString().padStart(2, '0')}
              </div>
              <audio ref={remoteVideoRef} autoPlay />
              <audio ref={localVideoRef} autoPlay muted />
            </div>
          )}
        </div>

        <div className="call-controls">
          {callState.isIncoming && callState.status === 'ringing' ? (
            <>
              <button className="call-btn accept" onClick={answerCall}>
                <Phone size={28} />
              </button>
              <button className="call-btn end" onClick={rejectCall}>
                <X size={28} />
              </button>
            </>
          ) : (
            <button className="call-btn end" onClick={rejectCall}>
              <Phone size={28} style={{ transform: 'rotate(135deg)' }} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = sessionStorage.getItem('ys_token');
      const response = await fetch(`${API_BASE_URL}/chat/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Send message with attachment
        await sendMessageWithAttachment(data);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera");
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    setIsUploading(true);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsUploading(false);
        alert("Failed to capture image");
        return;
      }
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append('file', file);

      // Timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const token = sessionStorage.getItem('ys_token');
        console.log("Step 1: Starting upload...");
        const response = await fetch(`${API_BASE_URL}/chat/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Upload Failed: ${response.status} ${response.statusText}`);
        }

        const uploadData = await response.json();
        console.log("Step 2: Upload done. Data:", uploadData);

        console.log("Step 3: Sending message...");
        try {
          await sendMessageWithAttachment(uploadData, 'image');
          console.log("Step 4: Message sent successfully.");
          stopCamera(); // Close ONLY on success
        } catch (msgError) {
          console.error("Message Send Failed:", msgError);
          alert("Upload OK, but failed to send message: " + msgError.message);
        }

      } catch (error) {
        if (error.name === 'AbortError') {
          alert("Upload timed out. Check your connection.");
        } else {
          console.error('Process Failed:', error);
          alert("Error: " + error.message);
        }
      } finally {
        setIsUploading(false);
      }
    }, 'image/jpeg');
  };

  // Poll Functions
  const createPoll = async () => {
    if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim())) return;

    const token = sessionStorage.getItem('ys_token');
    try {
      const messageData = {
        conversation_id: selectedConversation._id,
        content: "Poll: " + pollQuestion,
        message_type: "poll",
        metadata: {
          question: pollQuestion,
          options: pollOptions.map((opt, i) => ({ id: i, text: opt, votes: [] }))
        }
      };

      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        if (socket) socket.emit('send_message', { ...message, conversation_id: selectedConversation._id });

        setShowPollModal(false);
        setPollQuestion('');
        setPollOptions(['', '']);
      }
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupUsers.length === 0) return;

    try {
      const token = sessionStorage.getItem('ys_token');
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'group',
          name: groupName,
          participants: selectedGroupUsers
        })
      });

      if (response.ok) {
        const newConv = await response.json();
        // Fetch fresh conv list to get participant data populated
        await fetchConversations();
        setSelectedConversation(newConv); // This relies on fetch updating state fast enough, might need tweak but ok for now
        setShowNewChatModal(false);
        setIsGroupMode(false);
        setGroupName("");
        setSelectedGroupUsers([]);
      }
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  // Audio Functions
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], "voice-message.webm", { type: "audio/webm" });

        // Upload 
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
          const token = sessionStorage.getItem('ys_token');
          const response = await fetch(`${API_BASE_URL}/chat/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });

          if (response.ok) {
            const data = await response.json();
            await sendMessageWithAttachment(data, 'audio');
            setShowAudioModal(false);
          } else {
            alert("Audio upload failed");
          }
        } catch (error) {
          console.error("Audio upload failed", error);
          alert("Error sending audio");
        } finally {
          setIsUploading(false);
          // Stop tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
      alert("Could not access microphone");
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Contact Function
  const handleSendContact = async (contactUser) => {
    // Send as specific message type
    const contactData = {
      name: contactUser.name,
      id: contactUser.id,
      email: contactUser.email,
      role: contactUser.role
    };

    try {
      const token = sessionStorage.getItem('ys_token');
      const messageData = {
        conversation_id: selectedConversation._id,
        content: "Shared a contact",
        message_type: "contact",
        metadata: { contact: contactData }
      };

      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        if (socket) socket.emit('send_message', { ...message, conversation_id: selectedConversation._id });
        setShowContactModal(false);
      }
    } catch (error) {
      console.error("Error sending contact", error);
    }
  };

  // Sticker Function
  const handleSendSticker = async (stickerUrl) => {
    await sendMessageWithAttachment({ url: stickerUrl, type: 'image/sticker', name: 'sticker' }, 'sticker');
    setShowStickerModal(false);
  };

  const sendMessageWithAttachment = async (attachment, type = 'file') => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ys_token')}`
        },
        body: JSON.stringify({
          conversation_id: selectedConversation._id,
          content: '',
          attachments: [attachment],
          message_type: type
        })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);

        if (socket) {
          socket.emit('send_message', {
            conversation_id: selectedConversation._id,
            ...message
          });
        }
      }
    } catch (error) {
      console.error('Error sending attachment:', error);
    }
  };

  const startNewChat = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ys_token')}`
        },
        body: JSON.stringify({
          type: 'direct',
          participants: [userId]
        })
      });

      if (response.ok) {
        const conversation = await response.json();
        setConversations(prev => [conversation, ...prev]);
        setSelectedConversation(conversation);
        setShowNewChatModal(false);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchQuery.toLowerCase();
    return conv.name?.toLowerCase().includes(searchLower) ||
      conv.participants_data?.some(p => p.name.toLowerCase().includes(searchLower));
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleStartAIChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ys_token')}`
        },
        body: JSON.stringify({
          type: 'ai',
          participants: [user._id]
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Manually hydrate AI data for immediate view
        data.participants_data = [{
          id: "YS_AI_BOT",
          name: "YS AI",
          profile_photo: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png",
          is_online: true,
          current_status: "online",
          role: "AI Assistant"
        }];
        setSelectedConversation(data);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error starting AI chat", error);
    }
  };

  return (
    <div className="chat-container">
      {/* Conversations Sidebar */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <MessageCircle size={24} />
            Chats
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="new-chat-btn"
              onClick={() => {
                setShowNewChatModal(true);
                fetchAvailableUsers();
              }}
            >
              <Plus size={20} />
            </button>
            <button
              className="new-chat-btn"
              onClick={handleStartAIChat}
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
              title="Ask YS AI"
            >
              <Sparkles size={20} color="white" />
            </button>
          </div>
        </div>

        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.map(conv => {
            const otherParticipant = conv.participants_data?.[0];
            const displayName = conv.type === 'group' ? conv.name : otherParticipant?.name || 'Unknown';
            const isActive = selectedConversation?._id === conv._id;

            return (
              <div
                key={conv._id}
                className={`conversation-item ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conversation-avatar">
                  {conv.type === 'group' ? (
                    <Users size={20} />
                  ) : otherParticipant?.profile_photo ? (
                    <img src={otherParticipant.profile_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                  {conv.type !== 'group' && (
                    <div className={`status-indicator ${otherParticipant?.current_status === 'in-call' ? 'in-call' : otherParticipant?.current_status === 'idle' ? 'idle' : (otherParticipant?.is_online ? 'online' : 'offline')}`}></div>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <span className="conversation-name">{displayName}</span>
                    {conv.last_message_time && (
                      <span className="conversation-time">
                        {formatTime(conv.last_message_time)}
                      </span>
                    )}
                  </div>
                  {conv.last_message && (
                    <p className="conversation-preview">{conv.last_message}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div
                className="chat-header-info"
                onClick={() => {
                  if (selectedConversation.type === 'group') {
                    setShowGroupInfoModal(true);
                  } else {
                    setSelectedUserInfo(selectedConversation.participants_data?.[0]);
                    setShowUserInfoModal(true);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="chat-avatar">
                  {selectedConversation.type === 'group' ? (
                    <Users size={20} />
                  ) : selectedConversation.participants_data?.[0]?.profile_photo ? (
                    <img src={selectedConversation.participants_data?.[0]?.profile_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    selectedConversation.participants_data?.[0]?.name.charAt(0).toUpperCase()
                  )}
                  {selectedConversation.type !== 'group' && (
                    <div className={`status-indicator ${selectedConversation.participants_data?.[0]?.current_status === 'in-call' ? 'in-call' : selectedConversation.participants_data?.[0]?.current_status === 'idle' ? 'idle' : (selectedConversation.participants_data?.[0]?.is_online ? 'online' : 'offline')}`}></div>
                  )}
                </div>
                <div>
                  <h3 className="chat-title">
                    {selectedConversation.type === 'group'
                      ? selectedConversation.name
                      : selectedConversation.participants_data?.[0]?.name || 'Unknown'}
                  </h3>
                  <p className="chat-subtitle" style={{ color: isTyping ? '#22c55e' : 'inherit' }}>
                    {selectedConversation.type === 'group'
                      ? `${selectedConversation.participants.length} members`
                      : isTyping
                        ? 'typing...'
                        : selectedConversation.participants_data?.[0]?.is_online
                          ? 'Online'
                          : selectedConversation.participants_data?.[0]?.last_seen
                            ? `Last seen ${formatTime(selectedConversation.participants_data[0].last_seen)}`
                            : 'Offline'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="chat-options-btn" onClick={() => startCall('video')}>
                  <Video size={20} />
                </button>
                <button className="chat-options-btn" onClick={() => startCall('audio')}>
                  <Phone size={20} />
                </button>
                <button className="chat-options-btn">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {messages.map((msg, index) => {
                const isOwn = msg.sender_id === user?._id;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

                return (
                  <div key={msg._id} className={`message ${isOwn ? 'own' : ''}`}>
                    {!isOwn && showAvatar && (
                      <div className="message-avatar">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="message-content">
                      {!isOwn && showAvatar && (
                        <span className="message-sender">{msg.sender_name}</span>
                      )}
                      <div className="message-bubble">
                        {/* Poll Rendering */}
                        {msg.message_type === 'poll' && msg.metadata ? (
                          <div className="poll-container">
                            <p className="poll-question">{msg.metadata.question}</p>
                            <div className="poll-options">
                              {msg.metadata.options.map((opt, i) => {
                                const totalVotes = msg.metadata.options.reduce((acc, o) => acc + (o.votes?.length || 0), 0);
                                const percent = totalVotes === 0 ? 0 : Math.round(((opt.votes?.length || 0) / totalVotes) * 100);
                                const isVoted = opt.votes?.includes(user._id);

                                return (
                                  <div key={i} className={`poll-option ${isVoted ? 'voted' : ''}`} onClick={() => handleVote(msg._id, i)}>
                                    <div className="poll-option-bg" style={{ width: `${percent}%` }}></div>
                                    <div className="poll-option-content">
                                      <span>{opt.text}</span>
                                      <span className="poll-percent">{percent}% ({opt.votes?.length || 0})</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : msg.message_type === 'audio' && msg.attachments?.[0] ? (
                          <div className="audio-message">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Mic size={20} color="#6366f1" />
                              <audio controls src={msg.attachments[0].url} style={{ height: '32px' }} />
                            </div>
                          </div>
                        ) : msg.message_type === 'contact' && msg.metadata?.contact ? (
                          <div className="contact-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', minWidth: '200px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#6366f1', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Users size={20} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#334155' }}>{msg.metadata.contact.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{msg.metadata.contact.email}</div>
                              <button style={{ marginTop: '4px', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white' }}>Message</button>
                            </div>
                          </div>
                        ) : msg.message_type === 'sticker' && msg.attachments?.[0] ? (
                          <img src={msg.attachments[0].url} alt="Sticker" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                        ) : msg.attachments && msg.attachments.length > 0 ? (
                          <div className="message-attachments">
                            {msg.attachments.map((att, i) => (
                              <div key={i} className="attachment-item">
                                {att.type.startsWith('image/') ? (
                                  <img src={att.url} alt={att.name} className="attachment-image" />
                                ) : (
                                  <div className="message-file" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', minWidth: '200px' }}>
                                    <div style={{ width: '40px', height: '40px', background: att.name?.endsWith('.pdf') ? '#ef4444' : att.name?.endsWith('.xls') || att.name?.endsWith('.xlsx') ? '#22c55e' : '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                      <FileText size={24} />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                      <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {att.name || 'Document'}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        {att.name?.split('.').pop().toUpperCase()} File
                                      </div>
                                    </div>
                                    <a
                                      href={att.url}
                                      download={att.name}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                    >
                                      <Download size={18} />
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {(msg.content && msg.message_type !== 'poll') && <p>{msg.content}</p>}
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="typing-indicator">
                  <span>{typingUser} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="message-input-container" onSubmit={handleSendMessage}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />


              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                >
                  <Plus size={24} style={{ transform: showAttachMenu ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {showAttachMenu && (
                  <div className="attach-menu">
                    <div className="attach-item" onClick={() => handleAttachmentSelect('document')}>
                      <div className="attach-icon" style={{ background: '#7F66FF' }}>
                        <FileText size={20} color="white" />
                      </div>
                      <span>Document</span>
                    </div>
                    <div className="attach-item" onClick={() => handleAttachmentSelect('image')}>
                      <div className="attach-icon" style={{ background: '#007BEC' }}>
                        <Image size={20} color="white" />
                      </div>
                      <span>Photos & videos</span>
                    </div>
                    <div className="attach-item" onClick={() => handleAttachmentSelect('camera')}>
                      <div className="attach-icon" style={{ background: '#FF2E74' }}>
                        <Camera size={20} color="white" />
                      </div>
                      <span>Camera</span>
                    </div>
                    <div className="attach-item" onClick={() => handleAttachmentSelect('audio')}>
                      <div className="attach-icon" style={{ background: '#F86F03' }}>
                        <Mic size={20} color="white" />
                      </div>
                      <span>Audio</span>
                    </div>
                    <div className="attach-item" onClick={() => handleAttachmentSelect('contact')}>
                      <div className="attach-icon" style={{ background: '#009DE0' }}>
                        <Users size={20} color="white" />
                      </div>
                      <span>Contact</span>
                    </div>
                    <div className="attach-item" onClick={() => handleAttachmentSelect('poll')}>
                      <div className="attach-icon" style={{ background: '#FFBC2E' }}>
                        <Calendar size={20} color="white" />
                      </div>
                      <span>Poll</span>
                    </div>
                    <div className="attach-item" onClick={() => handleAttachmentSelect('sticker')}>
                      <div className="attach-icon" style={{ background: '#00C6B4' }}>
                        <StickyNote size={20} color="white" />
                      </div>
                      <span>New sticker</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  className="message-input"
                />
                {showEmojiPicker && (
                  <div className="emoji-picker-container">
                    <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                  </div>
                )}
              </div>

              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={20} />
              </button>
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state">
            <MessageCircle size={64} />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list or start a new chat</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {/* Poll Modal */}
      {showPollModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', width: '400px' }}>
            <div className="modal-header">
              <h3>Create Poll</h3>
              <button onClick={() => setShowPollModal(false)}><X size={20} /></button>
            </div>
            <div className="poll-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Ask a question..."
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
              />
              {pollOptions.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => {
                    const newOpts = [...pollOptions];
                    newOpts[i] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button className="btn-secondary" onClick={() => setPollOptions([...pollOptions, ''])}>+ Add Option</button>
                <button className="btn-primary" onClick={createPoll}>Create Poll</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal - Fullscreen */}
      {showCameraModal && (
        <div className="modal-overlay" style={{ background: 'black', padding: 0 }}>
          <div className="modal-content" style={{
            padding: '0',
            width: '100vw',
            height: '100vh',
            background: 'black',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: '100%'
          }}>
            <video ref={videoRef} autoPlay playsInline style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}></video>

            {/* Controls Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '30px',
              zIndex: 9999, // Super high z-index
              pointerEvents: 'auto'
            }}>
              <button
                onClick={(e) => {
                  console.log("Capture button clicked");
                  e.stopPropagation();
                  capturePhoto();
                }}
                disabled={isUploading}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: isUploading ? '#cbd5e1' : 'white',
                  border: '4px solid rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.1s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                {isUploading ? (
                  <div style={{ width: '24px', height: '24px', border: '3px solid #64748b', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', border: '2px solid black' }}></div>
                )}
              </button>
            </div>

            <button
              onClick={stopCamera}
              style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 9999
              }}
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}

      {/* Audio Modal */}
      {showAudioModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', width: '300px', textAlign: 'center' }}>
            <h3>Voice Message</h3>
            <div style={{ margin: '20px 0', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isRecording ? (
                <div className="recording-wave" style={{ color: 'red', fontWeight: 'bold' }}>Recording...</div>
              ) : (
                <div style={{ color: '#64748b' }}>Click mic to record</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {!isRecording ? (
                <button onClick={startAudioRecording} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#6366f1', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={24} />
                </button>
              ) : (
                <button onClick={() => {
                  stopAudioRecording();
                  // It will auto upload in onstop event
                }} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '2px' }}></div>
                </button>
              )}
              <button
                onClick={() => {
                  stopAudioRecording();
                  setShowAudioModal(false);
                }}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', width: '350px' }}>
            <div className="modal-header">
              <h3>Share Contact</h3>
              <button onClick={() => setShowContactModal(false)}><X size={20} /></button>
            </div>
            <div className="contact-list" style={{ marginTop: '16px', maxHeight: '300px', overflowY: 'auto' }}>
              {availableUsers.map(u => (
                <div key={u.id} onClick={() => handleSendContact(u)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', cursor: 'pointer', borderRadius: '8px' }} className="contact-item-hover">
                  <div style={{ width: '32px', height: '32px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: '500' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sticker Modal */}
      {showStickerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', width: '350px' }}>
            <div className="modal-header">
              <h3>Stickers</h3>
              <button onClick={() => setShowStickerModal(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
              {[
                'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
                'https://cdn-icons-png.flaticon.com/512/4712/4712009.png',
                'https://cdn-icons-png.flaticon.com/512/4712/4712139.png',
                'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
                'https://cdn-icons-png.flaticon.com/512/4712/4712073.png',
                'https://cdn-icons-png.flaticon.com/512/4712/4712104.png'
              ].map((url, i) => (
                <div key={i} onClick={() => handleSendSticker(url)} style={{ cursor: 'pointer', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <img src={url} alt="Sticker" style={{ width: '100%', height: 'auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Call Modal */}
      {renderCallModal()}

      {/* User Info Modal */}
      {showUserInfoModal && selectedUserInfo && (
        <div className="modal-overlay" onClick={() => setShowUserInfoModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '350px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ height: '100px', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}></div>
            <div style={{ padding: '0 24px 24px', marginTop: '-50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'white', padding: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {selectedUserInfo.profile_photo ? (
                  <img src={selectedUserInfo.profile_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#64748b' }}>
                    {selectedUserInfo.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 style={{ marginTop: '16px', fontSize: '1.5rem', color: '#1e293b', fontWeight: 'bold' }}>{selectedUserInfo.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: (selectedUserInfo.is_online || selectedUserInfo.current_status === 'online') ? '#22c55e' : '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: (selectedUserInfo.is_online || selectedUserInfo.current_status === 'online') ? '#22c55e' : '#cbd5e1' }}></div>
                {(selectedUserInfo.is_online || selectedUserInfo.current_status === 'online') ? 'Online' : 'Offline'}
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedUserInfo.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: '#6366f1' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Email</div>
                      <div style={{ color: '#334155', fontWeight: '500' }}>{selectedUserInfo.email}</div>
                    </div>
                  </div>
                )}

                {selectedUserInfo.role && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: '#a855f7' }}>
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Role</div>
                      <div style={{ color: '#334155', fontWeight: '500' }}>{selectedUserInfo.role}</div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowUserInfoModal(false)}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isGroupMode ? 'Create Group Chat' : 'Start New Chat'}</h3>
              <button onClick={() => setShowNewChatModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '0 20px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  onClick={() => setIsGroupMode(false)}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: !isGroupMode ? '#6366f1' : '#f1f5f9', color: !isGroupMode ? 'white' : '#64748b', cursor: 'pointer' }}
                >Direct Message</button>
                <button
                  onClick={() => setIsGroupMode(true)}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: isGroupMode ? '#6366f1' : '#f1f5f9', color: isGroupMode ? 'white' : '#64748b', cursor: 'pointer' }}
                >Group Chat</button>
              </div>

              {isGroupMode && (
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </div>
              )}
            </div>

            <div className="modal-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {error ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>
                  <p style={{ fontWeight: 600 }}>{error}</p>
                </div>
              ) : availableUsers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--slate-500)' }}>
                  No users available to chat with
                </div>
              ) : (
                availableUsers.map(u => {
                  const displayName = u.name || u.email || 'Unknown User';
                  const initial = displayName.charAt(0).toUpperCase();
                  const isSelected = selectedGroupUsers.includes(u.id);

                  return (
                    <div
                      key={u.id}
                      className="user-item"
                      onClick={() => {
                        if (isGroupMode) {
                          setSelectedGroupUsers(prev =>
                            prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                          );
                        } else {
                          startNewChat(u.id);
                        }
                      }}
                      style={{ background: isSelected ? '#eef2ff' : 'transparent' }}
                    >
                      <div className="user-avatar">
                        {u.profile_photo ? <img src={u.profile_photo} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initial}
                        {isGroupMode && isSelected && <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#6366f1', borderRadius: '50%', width: 16, height: 16, border: '2px solid white' }}></div>}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{displayName}</span>
                        <span className="user-role">{u.role}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {isGroupMode && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedGroupUsers.length === 0}
                  style={{
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    opacity: (!groupName.trim() || selectedGroupUsers.length === 0) ? 0.5 : 1
                  }}
                >
                  Create Group
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Group Info Modal */}
      {showGroupInfoModal && selectedConversation && (
        <div className="modal-overlay" onClick={() => setShowGroupInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h3>Group Info</h3>
              <button onClick={() => setShowGroupInfoModal(false)}><X size={20} /></button>
            </div>

            <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ width: '80px', height: '80px', background: '#6366f1', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Users size={40} />
              </div>
              <h2 style={{ margin: '0', fontSize: '1.5rem' }}>{selectedConversation.name}</h2>
              <p style={{ color: '#64748b', marginTop: '4px' }}>{selectedConversation.participants.length} members</p>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
              <div style={{ padding: '16px 20px', fontWeight: '600', color: '#475569', background: '#f8fafc' }}>
                Participants
              </div>
              {selectedConversation.participants_data?.map(u => (
                <div key={u.id} className="user-item" style={{ padding: '12px 20px', cursor: 'default' }}>
                  <div className="user-avatar">
                    {u.profile_photo ? (
                      <img src={u.profile_photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      u.name.charAt(0).toUpperCase()
                    )}
                    <div className={`status-indicator ${u.current_status === 'in-call' ? 'in-call' : u.current_status === 'idle' ? 'idle' : (u.is_online ? 'online' : 'offline')}`}></div>
                  </div>
                  <div className="user-info">
                    <span className="user-name">{u.name} {u.id === user?._id && '(You)'}</span>
                    <span className="user-role">{u.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chat-container {
          display: flex;
          height: calc(100vh - 80px);
          background: var(--bg-primary);
        }

        /* Conversations Sidebar */
        .conversations-sidebar {
          width: 320px;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-subtle);
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--slate-900);
          margin: 0;
        }

        .new-chat-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--primary-600);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .new-chat-btn:hover {
          background: var(--primary-700);
          transform: scale(1.05);
        }

        .search-container {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .search-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid var(--border-subtle);
        }

        .conversation-item:hover {
          background: var(--slate-50);
        }

        .conversation-item.active {
          background: var(--primary-50);
          border-left: 3px solid var(--primary-600);
        }

        .conversation-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          flex-shrink: 0;
          position: relative;
        }

        .chat-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          flex-shrink: 0;
          position: relative;
        }

        .conversation-info {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .conversation-name {
          font-weight: 600;
          color: var(--slate-900);
          font-size: 0.95rem;
        }

        .conversation-time {
          font-size: 0.75rem;
          color: var(--slate-500);
        }

        .conversation-preview {
          font-size: 0.85rem;
          color: var(--slate-600);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Chat Area */
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
        }

        .chat-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
        }

        .chat-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--slate-900);
        }

        .chat-subtitle {
          margin: 0;
          font-size: 0.85rem;
          color: var(--slate-500);
        }

        .chat-options-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--slate-600);
        }

        .chat-options-btn:hover {
          background: var(--slate-100);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .message.own {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--slate-300);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 60%;
        }

        .message.own .message-content {
          align-items: flex-end;
        }

        .message-sender {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--slate-700);
          margin-left: 12px;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          background: var(--slate-100);
          position: relative;
        }

        .message.own .message-bubble {
          background: var(--primary-600);
          color: white;
        }

        .message-bubble p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .message-time {
          font-size: 0.7rem;
          color: var(--slate-500);
          margin-top: 4px;
          display: block;
        }

        .message.own .message-time {
          color: rgba(255, 255, 255, 0.7);
        }

        .typing-indicator {
          padding: 8px 12px;
          font-size: 0.85rem;
          color: var(--slate-500);
          font-style: italic;
        }

        .message-input-container {
          padding: 20px 24px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .message-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid var(--border-subtle);
          border-radius: 24px;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }

        .message-input:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .input-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--slate-600);
        }

        .input-action-btn:hover {
          background: var(--slate-100);
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--primary-600);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--primary-700);
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--slate-400);
        }

        .empty-state h3 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--slate-600);
        }

        .empty-state p {
          margin: 0;
          color: var(--slate-500);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        /* Call Modal Overlay */
        .call-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #0f172a;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          color: white;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .call-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #1e293b;
        }

        .local-video {
          position: absolute;
          top: 40px;
          right: 40px;
          width: 180px;
          height: 120px;
          border-radius: 12px;
          background: #000;
          border: 2px solid rgba(255,255,255,0.3);
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          z-index: 2;
        }

        .call-user-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          z-index: 1;
        }

        .call-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--grad-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
        }

        .call-status {
          font-size: 1.2rem;
          color: #94a3b8;
          text-transform: capitalize;
          letter-spacing: 1px;
        }

        .call-controls {
          padding: 60px;
          display: flex;
          justify-content: center;
          gap: 32px;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          z-index: 3;
        }

        .call-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .call-btn:hover { transform: scale(1.1); }
        .call-btn:active { transform: scale(0.95); }
        
        .call-btn.end { background: #ef4444; color: white; }
        .call-btn.accept { background: #22c55e; color: white; }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }
        .status-indicator.online {
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
        }
        .status-indicator.in-call {
          background: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }
        .status-indicator.idle {
          background: #f97316;
          box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
        }
        .status-indicator.offline {
          background: #94a3b8;
        }

        .attach-menu {
          position: absolute;
          bottom: 70px;
          left: 20px;
          background: white;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 100;
          animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .attach-item {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .attach-item:hover {
          transform: translateX(4px);
        }

        /* POLL STYLES */
        .poll-container {
          width: 300px;
          min-width: 200px;
        }
        .poll-question {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 12px;
          color: var(--slate-800);
        }
        .poll-options { display: flex; flex-direction: column; gap: 8px; }
        .poll-option {
          position: relative;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .poll-option:hover { background: #e2e8f0; }
        .poll-option.voted {
          border-color: var(--primary-500);
          background: #eef2ff;
        }
        .poll-option-bg {
          position: absolute; top: 0; left: 0; bottom: 0;
          background: rgba(99, 102, 241, 0.15);
          transition: width 0.5s ease; z-index: 1;
        }
        .poll-option-content {
          position: relative; z-index: 2;
          display: flex; justify-content: space-between;
          font-weight: 600; color: var(--slate-700); font-size: 0.9rem;
        }
        .poll-percent { font-weight: 400; color: var(--slate-500); }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .attach-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
        }

        .attach-item span {
          font-weight: 600;
          color: var(--slate-700);
          font-size: 0.95rem;
        }

        .contact-item-hover:hover {
          background-color: #f1f5f9;
        }

        .audio-message {
           padding: 4px;
        }

        .emoji-picker-container {
          position: absolute;
          bottom: 60px;
          right: 0;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-radius: 8px;
        }

        .message-attachments {
          margin-bottom: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .attachment-image {
          max-width: 200px;
          max-height: 200px;
          border-radius: 8px;
          cursor: pointer;
        }

        .attachment-file {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.9);
          padding: 8px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--slate-700);
          font-size: 0.9rem;
          border: 1px solid rgba(0,0,0,0.1);
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .modal-header button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-header button:hover {
          background: var(--slate-100);
        }

        .modal-body {
          padding: 16px;
          overflow-y: auto;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-item:hover {
          background: var(--slate-50);
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: var(--slate-900);
        }

        .user-role {
          font-size: 0.85rem;
          color: var(--slate-500);
        }
      `}</style>
    </div>
  );
}
