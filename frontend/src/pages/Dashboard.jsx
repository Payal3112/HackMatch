import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Users, CheckCircle2, ChevronRight, MessageSquare, Plus, Bell, Search,
  Award, BookOpen, User, Star, Zap, Activity, ExternalLink, Calendar,
  Code2, Clock, Globe, ArrowRight, ShieldCheck, Mail, GitBranch, MapPin, Target, LogOut,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Settings,
  X,
  FileText,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Briefcase,
  PlayCircle,
  Code, Bookmark, UploadCloud, PieChart, Sparkles, Hexagon, Layers, Rocket, LayoutDashboard, BrainCircuit, HeartPulse, FolderHeart, PlusCircle, LifeBuoy
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'workspace';
  const currentSubPath = location.pathname.split('/')[2];
  
  const validTabs = ['workspace', 'myteam', 'aimatchmaker', 'skillverification', 'saveditem', 'setting'];
  const activeTab = validTabs.includes(currentPath) && currentPath !== 'dashboard' ? currentPath : 'workspace';

  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      navigate('/workspace', { replace: true });
    }
  }, [location, navigate]);

  const setActiveTab = (tabId) => {
    navigate(`/${tabId}`);
  };

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [toasts, setToasts] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/requests`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setIncomingRequests(data.incoming || []);
        
        // Map outgoing request targetIds to a simple array for UI checks
        const outgoingTargetIds = (data.outgoing || []).map(r => r.targetId);
        setSentRequests(outgoingTargetIds);
      }
    } catch (e) {
      console.error("Failed to fetch requests", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleSendRequest = async (personName) => {
    if (!user.discord_handle || user.discord_handle.trim() === '') {
      window.alert("Please add your Discord handle in settings to connect with teams.");
      return;
    }
    if (!sentRequests.includes(personName)) {
      try {
        const res = await fetch(`${API_BASE}/requests/send`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            targetId: personName,
            targetType: "user",
            type: "invite"
          })
        });
        if (res.ok) {
          setSentRequests(prev => [...prev, personName]);
          setNotifications(prev => [{ _id: Date.now(), message: `Connection request sent to ${personName}!` }, ...prev]);
          addToast('Request sent!', 'success');
        }
      } catch (e) {
        addToast('Failed to send request', 'error');
      }
    }
  };

  // Tab States
  const [proofData, setProofData] = useState(null);
  const [proofError, setProofError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pulseStatus, setPulseStatus] = useState('');
  const [aiInsights, setAiInsights] = useState(() => {
    const saved = localStorage.getItem('aiInsights');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingAi, setLoadingAi] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState(currentSubPath || 'browse');
  const [myTeamsTab, setMyTeamsTab] = useState(currentSubPath || 'my_projects');
  const [incomingRequests, setIncomingRequests] = useState([]);

  useEffect(() => {
    if (activeTab === 'workspace') setWorkspaceTab(currentSubPath || 'browse');
    if (activeTab === 'myteam') setMyTeamsTab(currentSubPath || 'my_projects');
  }, [activeTab, currentSubPath]);
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectForm, setNewProjectForm] = useState({ name: '', hackathon: '', description: '', skills: '', capacity: 4 });
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(null);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [aiProjectDesc, setAiProjectDesc] = useState('');
  const [aiMissingSkills, setAiMissingSkills] = useState('');
  const [workspaceData, setWorkspaceData] = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  
  // Settings State
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isGeneratingUSP, setIsGeneratingUSP] = useState(false);

  useEffect(() => {
    // We will default to the user's real GitHub handle
    const defaultUser = {
      name: "Payal",
      github_handle: "Payal3112",
      skills: ["React", "Python", "FastAPI", "PostgreSQL"],
      level: "Software Engineer",
      discord_handle: "payal_dev",
      avatar_url: null
    };

    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : defaultUser;
    setUser(currentUser);

    // Fetch complete user data from backend
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      } catch (e) {
        console.error("Failed to fetch user data", e);
      }
    };

    fetchMe();

    // Fetch live GitHub profile data
    const fetchGithubProfile = async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${currentUser.github_handle}`);
        if (res.ok) {
          const data = await res.json();
          setUser(prev => {
            const updated = {
              ...prev,
              name: data.name || data.login,
              avatar_url: data.avatar_url,
              level: prev.level || data.bio // Keep backend level if exists
            };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (e) {
        console.error("Failed to fetch GitHub profile", e);
      }
    };

    fetchGithubProfile();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchWorkspaceData();
      fetchCollectionData();
      fetchMyTeams();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
      if (res.ok) setNotifications(await res.json());
    } catch (e) { console.error("Failed to fetch notifications", e); }
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  const runProofVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/proof/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ github_handle: user.github_handle, skills: user.skills })
      });
      const data = await res.json();
      if (!res.ok || data.message?.toLowerCase().includes("not found") || data.message?.toLowerCase().includes("error") || data.message?.toLowerCase().includes("please configure")) {
        setProofError(data.message || "Verification failed");
      } else {
        setProofError(null);
        setProofData(data);
        const updatedUser = { ...user, verified_skills: data.verified_skills || [] };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (e) { 
      setProofError("Internal network error.");
      console.error("Failed verification", e); 
    }
    setIsVerifying(false);
  };

  const submitPulse = async (status) => {
    setPulseStatus('submitting');
    try {
      await fetch(`${API_BASE}/squad/pulse`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ team_id: "mock_team_1", status })
      });
      setTimeout(() => setPulseStatus('done'), 1000);
    } catch (e) {
      setPulseStatus('error');
    }
  };

  const generateUSP = async () => {
    setIsGeneratingUSP(true);
    try {
      const res = await fetch(`${API_BASE}/ai/usp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ skills: user.skills || [], experienceLevel: user.level || "Expert" })
      });
      if (res.ok) {
        const data = await res.json();
        const newUser = { ...user, level: data.usp, keywords: data.keywords };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        setSaveMessage('Bio generated successfully!');
        setSaveStatus('success');
      } else {
        setSaveMessage('Failed to generate bio.');
        setSaveStatus('error');
      }
    } catch (e) {
      setSaveMessage('Error connecting to AI.');
      setSaveStatus('error');
      console.error(e);
    }
    setIsGeneratingUSP(false);
  };

  const runAiInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch(`${API_BASE}/ai/matchmaker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_description: aiProjectDesc,
          missing_skills: aiMissingSkills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
        localStorage.setItem('aiInsights', JSON.stringify(data));
      }
    } catch (e) { console.error("AI Insight failed", e); }
    setLoadingAi(false);
  };

  const fetchWorkspaceData = async () => {
    try {
      const res = await fetch(`${API_BASE}/workspace`, { headers: getHeaders() });
      if (res.ok) setWorkspaceData(await res.json());
    } catch (e) { console.error("Workspace data failed", e); }
  };

  const fetchMyTeams = async () => {
    try {
      const res = await fetch(`${API_BASE}/teams/my-teams`, { headers: getHeaders() });
      if (res.ok) setMyTeams(await res.json());
    } catch (e) { console.error("Failed to fetch my teams", e); }
  };

  const handleCreateProject = async () => {
    if (!newProjectForm.name || !newProjectForm.hackathon) return;
    try {
      const res = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newProjectForm.name,
          hackathon: newProjectForm.hackathon,
          description: newProjectForm.description,
          needed_skills: newProjectForm.skills.split(',').map(s => s.trim()).filter(Boolean),
          capacity: parseInt(newProjectForm.capacity, 10) || 4
        })
      });
      if (res.ok) {
        setNewProjectForm({ name: '', hackathon: '', description: '', skills: '', capacity: 4 });
        setShowProjectModal(false);
        setNotifications(prev => [{ _id: Date.now(), message: "Project created successfully!" }, ...prev]);
        fetchWorkspaceData();
        fetchMyTeams();
      }
    } catch (e) {
      console.error("Failed to create project", e);
    }
  };

  const handleEditProject = async () => {
    if (!newProjectForm.name || !newProjectForm.hackathon) return;
    try {
      const res = await fetch(`${API_BASE}/teams/${editingProjectId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newProjectForm.name,
          hackathon: newProjectForm.hackathon,
          description: newProjectForm.description,
          needed_skills: newProjectForm.skills.split(',').map(s => s.trim()).filter(Boolean),
          capacity: parseInt(newProjectForm.capacity, 10) || 4
        })
      });
      if (res.ok) {
        setNewProjectForm({ name: '', hackathon: '', description: '', skills: '', capacity: 4 });
        setShowProjectModal(false);
        setIsEditingProject(false);
        setEditingProjectId(null);
        setNotifications(prev => [{ _id: Date.now(), message: "Project updated successfully!" }, ...prev]);
        fetchWorkspaceData();
        fetchMyTeams();
      } else {
        const data = await res.json();
        addToast(data.detail || 'Failed to update team', 'error');
      }
    } catch (e) {
      console.error("Failed to update project", e);
      addToast('Network error updating team', 'error');
    }
  };

  const fetchCollectionData = async () => {
    try {
      const res = await fetch(`${API_BASE}/collection`, { headers: getHeaders() });
      if (res.ok) setCollectionData(await res.json());
    } catch (e) { console.error("Collection data failed", e); }
  };

  const isSaved = (type, itemName) => {
    if (!collectionData) return false;
    let list = [];
    let matchField = 'name';
    
    if (type === 'hackathon') {
      list = collectionData.hackathons || [];
      matchField = 'title';
    } else if (type === 'team') {
      list = collectionData.teams || [];
    } else {
      list = collectionData.people || [];
    }
    
    return list.some(item => item[matchField] === itemName);
  };

  const toggleSave = async (type, item) => {
    const itemName = type === 'hackathon' ? item.title : item.name;
    const currentlySaved = isSaved(type, itemName);
    
    try {
      if (currentlySaved) {
        await fetch(`${API_BASE}/collection/remove`, {
          method: 'DELETE',
          headers: getHeaders(),
          body: JSON.stringify({ type, item_name: itemName })
        });
      } else {
        await fetch(`${API_BASE}/collection/add`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ type, item })
        });
      }
      fetchCollectionData();
    } catch (e) {
      console.error("Failed to toggle save", e);
    }
  };


  const saveSettings = async () => {
    setSaveStatus('saving');
    setSaveMessage('');
    try {
      const res = await fetch(`${API_BASE}/proof/update-profile`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          github_handle: user.github_handle,
          name: user.name,
          skills: user.skills,
          discord_handle: user.discord_handle || "",
          status: user.status || "open",
          level: user.level || "",
          keywords: user.keywords || [],
          bio: user.bio || ""
        })
      });
      const data = await res.json();
      
      if (data.valid) {
        setSaveStatus('success');
        setSaveMessage('Profile saved and GitHub handle verified!');
        // Update user with fetched real name/avatar if they changed it
        const updatedUser = { 
          ...user, 
          name: data.name || user.name,
          avatar_url: data.avatar_url,
          skills: data.skills || user.skills,
          discord_handle: data.discord_handle || user.discord_handle,
          status: data.status || user.status,
          level: data.level || user.level,
          keywords: data.keywords || user.keywords,
          bio: user.bio
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        setSaveStatus('error');
        setSaveMessage(data.message || 'Invalid GitHub handle');
      }
    } catch (e) {
      setSaveStatus('error');
      setSaveMessage('Failed to connect to server');
    }
  };

  if (!user) return null;

  return (
    // Layout: flex puts sidebar on left, main content on right
    <div className="w-full min-h-screen bg-[url('/bg.png')] bg-cover bg-bottom bg-no-repeat font-sans flex overflow-hidden text-gray-800 selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-white/40 flex flex-col bg-white/40 backdrop-blur-xl relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.05)]">
        <div className="px-6 py-5 border-b border-white/40 flex items-center gap-3 bg-white/20">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-md">
            <Layers size={18} />
          </div>
          <span className="text-sm font-bold tracking-wide text-gray-900">HackMatch</span>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          
          <SidebarButton id="workspace" icon={<Briefcase size={16} />} label="Workspace" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarButton id="myteam" icon={<Users size={16} />} label="My Teams" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarButton id="aimatchmaker" icon={<BrainCircuit size={16} />} label="AI Matchmaker" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarButton id="skillverification" icon={<ShieldCheck size={16} />} label="Proof Room" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarButton id="saveditem" icon={<FolderHeart size={16} />} label="Saved Items" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarButton id="setting" icon={<Settings size={16} />} label="Settings" activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="my-2 border-t border-white/30"></div>
          
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </nav>
        
        {/* User Profile Mini */}
        <div className="p-4 border-t border-white/30 flex items-center gap-3 bg-white/20 hover:bg-white/40 transition-colors relative group">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full border border-white shadow-sm" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-600 shadow-sm cursor-pointer" onClick={() => setActiveTab('settings')}>
              {user.name?.charAt(0) || 'P'}
            </div>
          )}
          <div className="flex-1 overflow-hidden cursor-pointer" onClick={() => setActiveTab('settings')}>
            <div className="text-sm font-bold text-gray-900 truncate">{user.name}</div>
            <div className="text-xs text-gray-600 truncate">{user.email}</div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="hidden group-hover:flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-white/30 bg-white/10 backdrop-blur-md relative z-50">
          <h2 className="text-sm font-bold capitalize text-gray-900 flex items-center gap-2">
             {activeTab.replace('_', ' ')}
          </h2>
          
          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-white/40 transition-colors text-gray-700 hover:text-gray-900 focus:outline-none">
                <Bell size={18} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                )}
              </button>
              
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-200/50 flex justify-between items-center bg-white/50">
                    <span className="text-sm font-bold text-gray-900">Notifications</span>
                    {notifications.filter(n => !n.read).length > 0 && <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full shadow-sm">{notifications.filter(n => !n.read).length}</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm font-medium">No new notifications.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} onClick={() => markRead(n._id)} className={`p-4 border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors flex gap-3 items-start ${n.read ? 'opacity-50 grayscale' : ''}`}>
                           {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>}
                           <div className={n.read ? 'ml-5' : ''}>
                             <p className="text-sm text-gray-700 font-medium leading-snug">{n.message}</p>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            
             {activeTab === 'workspace' && (
               <>
                 <div className="flex items-center justify-between mb-6">
                   <div>
                     <h3 className="text-3xl font-black tracking-tight text-gray-900 drop-shadow-sm">Workspace</h3>
                     <p className="text-gray-700 font-medium mt-1">Explore upcoming hackathons and participants.</p>
                   </div>
                 </div>

                 <div className="flex gap-4 border-b border-white/50 mb-8 pb-1 bg-white/30 backdrop-blur-md px-4 pt-2 rounded-t-xl">
                   <button onClick={() => setWorkspaceTab('browse')} className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${workspaceTab === 'browse' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-700 hover:text-gray-900'}`}>Explore Hackathons</button>
                   <button onClick={() => setWorkspaceTab('teams')} className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${workspaceTab === 'teams' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-700 hover:text-gray-900'}`}>Explore Teams</button>
                   <button onClick={() => setWorkspaceTab('participants')} className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${workspaceTab === 'participants' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-700 hover:text-gray-900'}`}>Explore Participants</button>
                 </div>

                 {workspaceTab === 'browse' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                     {[
                       { title: "XPRIZE Build with Gemini", date: "Jul 01 - Aug 30", theme: "AI / Google Cloud", link: "https://devpost.com/hackathons" },
                       { title: "ETHGlobal Online", date: "Aug 15 - Sep 10", theme: "Web3 & Blockchain", link: "https://ethglobal.com/" },
                       { title: "MLH Global Hack Week", date: "Sep 01 - Sep 07", theme: "Open Innovation", link: "https://mlh.io/" },
                       { title: "LabLab.ai Challenge", date: "Sep 15 - Sep 17", theme: "Generative AI", link: "https://lablab.ai/" },
                       { title: "Smart India Hackathon", date: "Oct 20 - Oct 22", theme: "GovTech", link: "https://sih.gov.in/" }
                     ].map((hack, i) => (
                       <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all flex flex-col justify-between">
                         <div className="flex justify-between items-start mb-3">
                           <h5 className="text-xl font-black text-gray-900">{hack.title}</h5>
                           <div className="flex gap-2 items-center">
                             <button onClick={(e) => { e.stopPropagation(); toggleSave('hackathon', hack); }} className="text-gray-400 hover:text-blue-600 transition-colors">
                               <Bookmark size={18} className={isSaved('hackathon', hack.title) ? "fill-blue-600 text-blue-600" : ""} />
                             </button>
                           </div>
                         </div>
                         <p className="text-sm font-bold text-blue-600 mb-6">{hack.date} • {hack.theme}</p>
                         <a 
                           href={hack.link}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full block text-center py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                         >
                           View Hackathon
                         </a>
                       </div>
                     ))}
                   </div>
                 )}

                 {workspaceTab === 'teams' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                     {[
                       ...(workspaceData?.active_teams || []),
                       { name: "Code Crafters", hackathon: "Mumbai Tech Week", description: "Building a decentralized exchange using smart contracts.", needed_skills: ["Solidity", "React", "Web3.js"], status: "Forming", members: ["Alex", "Jordan"], capacity: 4 },
                       { name: "AI Visionaries", hackathon: "Global AI Hackathon 2026", description: "Creating an AI model to analyze satellite imagery.", needed_skills: ["Python", "TensorFlow", "Computer Vision"], status: "Open to Teams", members: ["Sam", "Taylor", "Morgan"], capacity: 5 }
                     ].map((team, i) => (
                       <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all flex flex-col cursor-pointer" onClick={() => setSelectedProject(team)}>
                         <div className="flex justify-between items-start mb-3">
                           <h5 className="text-xl font-black text-gray-900">{team.name}</h5>
                           <div className="flex gap-2 items-center shrink-0">
                             <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                               {team.members?.length || 1}/{team.capacity || 4} filled
                             </span>
                             <button onClick={(e) => { e.stopPropagation(); toggleSave('team', team); }} className="text-gray-400 hover:text-blue-600 transition-colors">
                               <Bookmark size={18} className={isSaved('team', team.name) ? "fill-blue-600 text-blue-600" : ""} />
                             </button>
                           </div>
                         </div>
                         <p className="text-sm font-bold text-blue-600 mb-2">{team.hackathon}</p>
                         <p className="text-sm text-gray-700 font-medium italic mb-4 line-clamp-2">"{team.description || "Looking for passionate teammates to join our hackathon project!"}"</p>
                         
                         <div className="flex gap-2 flex-wrap mb-6 mt-auto">
                           {(team.needed_skills || team.roles_missing || ["Full Stack", "Design"]).map(r => (
                             <span key={r} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-bold text-gray-700">{r}</span>
                           ))}
                         </div>
                         
                         <button 
                           onClick={(e) => { e.stopPropagation(); setSelectedProject(team); }}
                           className="w-full block text-center py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                         >
                           View Team
                         </button>
                       </div>
                     ))}
                   </div>
                 )}

                 {workspaceTab === 'participants' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                     {/* Mock Candidate Cards */}
                     {[
                       { name: "Rohan Sharma", score: "98%", skills: ["React", "TypeScript", "Tailwind"] },
                       { name: "Ananya Gupta", score: "92%", skills: ["UI/UX", "Figma", "React"] },
                       { name: "Aryan Patel", score: "88%", skills: ["Python", "FastAPI", "MongoDB"] },
                       { name: "Kavya Desai", score: "85%", skills: ["Next.js", "GraphQL", "Prisma"] },
                       { name: "Aditya Singh", score: "81%", skills: ["Flutter", "Dart", "Firebase"] },
                       { name: "Priya Nair", score: "79%", skills: ["Machine Learning", "TensorFlow", "Pandas"] }
                     ].map((match, i) => (
                       <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform">
                         <div className="flex justify-between items-start mb-4">
                           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg font-black text-blue-700 shadow-inner border border-white">
                             {match.name.charAt(0)}
                           </div>
                           <div className="flex flex-col items-end gap-2">
                             <button onClick={(e) => { e.stopPropagation(); toggleSave('person', match); }} className="text-gray-400 hover:text-blue-600 transition-colors">
                               <Bookmark size={18} className={isSaved('person', match.name) ? "fill-blue-600 text-blue-600" : ""} />
                             </button>
                             <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full shadow-sm border border-purple-200">
                               {match.score} Match
                             </span>
                           </div>
                         </div>
                         <h5 className="font-bold text-gray-900 mb-1">{match.name}</h5>
                         <div className="flex gap-2 flex-wrap mb-5 mt-3">
                           {match.skills.map(s => (
                             <span key={s} className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600">{s}</span>
                           ))}
                         </div>
                         <button onClick={() => setShowProfileModal(match)} className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-gray-800 transition-colors">
                           View Profile
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </>
             )}

             {activeTab === 'myteam' && (
               <>
                 <div className="flex items-center justify-between mb-6">
                   <div>
                     <h3 className="text-3xl font-black tracking-tight text-gray-900 drop-shadow-sm">My Teams</h3>
                     <p className="text-gray-700 font-medium mt-1">Manage your active projects and team requests.</p>
                   </div>
                   <button onClick={() => setShowProjectModal(true)} className="flex items-center gap-2 bg-white/80 hover:bg-white backdrop-blur-md text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl border border-white">
                     <Plus size={18} /> New Project
                   </button>
                 </div>

                 <div className="flex gap-4 border-b border-white/50 mb-8 pb-1 bg-white/30 backdrop-blur-md px-4 pt-2 rounded-t-xl">
                    <button onClick={() => { setMyTeamsTab('my_projects'); }} className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${myTeamsTab === 'my_projects' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-700 hover:text-gray-900'}`}>My Projects</button>
                    <button 
                      onClick={() => { setMyTeamsTab('invitations'); }}
                      className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${myTeamsTab === 'invitations' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                    >
                      Invitations {incomingRequests.length > 0 && <span className="ml-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">{incomingRequests.length}</span>}
                    </button>
                    <button 
                      onClick={() => { setMyTeamsTab('requests'); }}
                      className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${myTeamsTab === 'requests' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
                    >
                      Outgoing Requests
                    </button>
                  </div>

                 {myTeamsTab === 'my_projects' && (
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                     {/* Profile Summary */}
                     <div className="lg:col-span-1 space-y-6">
                       <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-xl">
                         <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Participant Profile</h4>
                         <div className="flex items-center gap-4 mb-6">
                           {user.avatar_url ? (
                             <img src={user.avatar_url} alt="Avatar" className="w-14 h-14 rounded-xl shadow-inner border border-white object-cover" />
                           ) : (
                             <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl font-black text-blue-700 shadow-inner border border-white">
                               {user.name?.charAt(0) || 'P'}
                             </div>
                           )}
                           <div>
                             <div className="font-bold text-base text-gray-900">{user.name}</div>
                           </div>
                         </div>
                         
                         <div className="space-y-5 pt-5 border-t border-white/30">
                           <div className="flex justify-between items-center">
                             <span className="text-sm font-semibold text-gray-700">Status</span>
                             {(!user.status || user.status === 'open') ? (
                               <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/80 text-emerald-600 shadow-sm border border-emerald-100">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Open to Teams
                               </span>
                             ) : (
                               <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/80 text-red-600 shadow-sm border border-red-100">
                                 <div className="w-2 h-2 rounded-full bg-red-500"></div> Closed to Teams
                               </span>
                             )}
                           </div>
                           <div>
                             <span className="text-sm font-semibold text-gray-700 block mb-3">Technical Stack</span>
                             <div className="flex flex-wrap gap-2">
                               {user.skills.map(skill => {
                                 const isVerified = user.verified_skills?.includes(skill) || proofData?.verified_skills?.includes(skill);
                                 return (
                                   <span key={skill} className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border flex items-center gap-1.5 ${isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white/60 text-gray-800 border-white'}`}>
                                     {skill}
                                     {isVerified && <CheckCircle2 size={12} className="text-emerald-500" />}
                                   </span>
                                 )
                               })}
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Active Projects */}
                     <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {myTeams?.map((team, idx) => (
                             <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all flex flex-col cursor-pointer" onClick={() => setSelectedProject(team)}>
                               <div className="flex justify-between items-start mb-4">
                                 <div>
                                   <h5 className="text-xl font-black text-gray-900">{team.name}</h5>
                                   <p className="text-sm font-bold text-blue-600 mt-1">{team.hackathon}</p>
                                 </div>
                                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 shadow-sm border border-blue-200 shrink-0">
                                   {team.status}
                                 </span>
                               </div>
                               <div className="flex gap-2 flex-wrap mb-4">
                                 {(team.needed_skills || team.roles_missing || []).map(r => (
                                   <span key={r} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-700">{r}</span>
                                 ))}
                               </div>
                               <div className="flex items-center justify-between mt-auto pt-6">
                                 <div className="flex items-center gap-4">
                                   <div className="flex -space-x-3">
                                     {team.members.map((m, i) => (
                                       <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-sm">
                                         {typeof m === 'string' ? m.charAt(0) : (m?.name?.charAt(0) || '?')}
                                       </div>
                                     ))}
                                   </div>
                                   <span className="text-xs font-bold text-gray-600">{team.members.length} / {team.capacity} Members</span>
                                 </div>
                               </div>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setSelectedProject(team); }}
                                 className="w-full block text-center py-2.5 mt-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                               >
                                 View Project
                               </button>
                             </div>
                           )) || (
                             <div className="col-span-full p-10 text-center text-gray-600 text-sm font-bold bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl">
                               No active projects. Start by joining a hackathon.
                             </div>
                           )}
                        </div>
                     </div>
                   </div>
                 )}

                 {myTeamsTab === 'invitations' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                       {incomingRequests.length === 0 ? (
                         <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-xl">
                           <div className="w-20 h-20 mb-6 bg-purple-100 rounded-full flex items-center justify-center shadow-inner">
                             <User size={32} className="text-purple-500" />
                           </div>
                           <h3 className="text-2xl font-black text-gray-900 mb-2">No Invitations Yet</h3>
                           <p className="text-gray-500 font-medium max-w-sm text-center">When someone invites you to join their team, it will appear here. Make sure your profile skills are updated to get noticed!</p>
                         </div>
                       ) : (
                         incomingRequests.map(req => (
                           <div key={req.id} className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all flex flex-col gap-4 cursor-pointer">
                             <div className="flex gap-3">
                               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-lg font-black text-blue-700 shadow-inner border border-white shrink-0">
                                 {req.senderName?.charAt(0) || '?'}
                               </div>
                               <div>
                                 <h5 className="text-lg font-black text-gray-900 flex items-center gap-2">{req.senderName || 'Unknown User'} <MessageSquare size={14} className="text-indigo-500" /></h5>
                                 <p className="text-sm font-bold text-blue-600">{req.type === 'invite' ? 'Invited you to team' : `Wants to join ${req.targetId}`}</p>
                               </div>
                             </div>
                             <div className="p-4 bg-white/80 border border-gray-200 rounded-xl mt-2">
                               <p className="text-sm font-medium text-gray-700 italic">"I would love to connect and work together on this project!"</p>
                             </div>
                             <div className="flex gap-3 mt-auto pt-4">
                               <button 
                                 onClick={async () => {
                                   try {
                                     const res = await fetch(`${API_BASE}/requests/${req.id}/accept`, {
                                       method: 'POST',
                                       headers: getHeaders()
                                     });
                                     if (res.ok) {
                                       setIncomingRequests(incomingRequests.filter(r => r.id !== req.id));
                                       setNotifications(prev => [{ _id: Date.now(), message: `${req.senderName || req.name} joined your team!` }, ...prev]);
                                       addToast('Request accepted!', 'success');
                                       fetchWorkspaceData(); // Refresh teams to show new member
                                     } else {
                                       const data = await res.json();
                                       addToast(data.detail || 'Failed to accept', 'error');
                                     }
                                   } catch (e) {
                                     addToast('Failed to accept', 'error');
                                   }
                                 }}
                                 className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                               >
                                 Accept
                               </button>
                               <button 
                                 onClick={async () => {
                                   try {
                                     const res = await fetch(`${API_BASE}/requests/${req.id}/decline`, {
                                       method: 'POST',
                                       headers: getHeaders()
                                     });
                                     if (res.ok) {
                                       setIncomingRequests(incomingRequests.filter(r => r.id !== req.id));
                                       setNotifications(prev => [{ _id: Date.now(), message: `Declined request from ${req.senderName || req.name}` }, ...prev]);
                                       addToast('Request declined.', 'error');
                                     }
                                   } catch (e) {
                                     addToast('Failed to decline', 'error');
                                   }
                                 }}
                                 className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-900 rounded-xl text-sm font-bold shadow-sm transition-colors border border-gray-200"
                               >
                                 Decline
                               </button>
                             </div>
                           </div>
                         ))
                       )}
                    </div>
                  )}

                  {myTeamsTab === 'requests' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {sentRequests.length === 0 ? (
                          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-xl">
                            <div className="w-20 h-20 mb-6 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                              <Rocket size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">No Outgoing Requests</h3>
                            <p className="text-gray-500 font-medium max-w-sm text-center">You haven't requested to join any teams yet. Head over to the Explore Teams tab to find your match!</p>
                            <button onClick={() => { navigate('/workspace'); setTimeout(() => setWorkspaceTab('teams'), 10); }} className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
                              Explore Teams <ArrowRight size={16} />
                            </button>
                          </div>
                        ) : (
                          sentRequests.map((reqName, idx) => (
                            <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all flex flex-col justify-between cursor-pointer">
                              <div className="mb-6">
                                <h5 className="text-xl font-black text-gray-900">{reqName}</h5>
                                <p className="text-sm font-bold text-gray-500 mt-1">Join Request Sent</p>
                              </div>
                              <div className="w-full text-center py-2.5 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold shadow-sm border border-amber-200">
                                Pending Response
                              </div>
                            </div>
                          ))
                        )}
                    </div>
                  )}
               </>
             )}

            {activeTab === 'aimatchmaker' && (
              <>
                 <div className="mb-8">
                   <h3 className="text-3xl font-black tracking-tight text-gray-900 drop-shadow-sm flex items-center gap-3">
                     <BrainCircuit className="text-purple-600" size={32} /> AI Matchmaker
                   </h3>
                   <p className="text-gray-700 font-medium mt-1">Generate teammate recommendations based on your specific project needs.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Input Form */}
                   <div className="lg:col-span-1 space-y-6">
                     <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-xl">
                       <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5">Active Project Needs</h4>
                       <div className="space-y-4">
                         <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">Project Description</label>
                           <textarea 
                             rows="4"
                             value={aiProjectDesc}
                             onChange={(e) => setAiProjectDesc(e.target.value)}
                             placeholder="What are you building? e.g. A decentralized AI market..." 
                             className="w-full bg-white/50 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all resize-none custom-scrollbar"
                           />
                         </div>
                         <div>
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">Missing Skills</label>
                           <input 
                             type="text" 
                             value={aiMissingSkills}
                             onChange={(e) => setAiMissingSkills(e.target.value)}
                             placeholder="e.g. Backend, UI/UX, Python (comma separated)" 
                             className="w-full bg-white/50 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                           />
                         </div>
                         <button onClick={runAiInsight} disabled={loadingAi || (!aiProjectDesc && !aiMissingSkills)} className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_10px_20px_rgba(147,51,234,0.3)] disabled:opacity-50 mt-4">
                           <Sparkles size={18} className={loadingAi ? 'animate-spin' : ''} /> {loadingAi ? 'Analyzing Needs...' : 'Run AI Match Engine'}
                         </button>
                       </div>
                     </div>
                   </div>

                   {/* Output Area */}
                   <div className="lg:col-span-2">
                     {loadingAi ? (
                       <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-10 text-center">
                         <div className="relative mb-6 flex items-center justify-center">
                           <BrainCircuit size={56} className="text-purple-500 relative z-10 animate-pulse" />
                           <div className="absolute w-20 h-20 bg-purple-400 blur-2xl rounded-full opacity-40 animate-ping"></div>
                         </div>
                         <h4 className="text-lg font-black text-gray-900 tracking-tight mb-2">AI is analyzing your requirements...</h4>
                         <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">Synthesizing perfect candidate profiles tailored to your stack.</p>
                       </div>
                     ) : aiInsights ? (
                       <div className="space-y-5 animate-fade-in-up">
                         <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Candidate Matches</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           {aiInsights.matches.map((match, idx) => (
                             <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/80 p-5 rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300">
                               <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-base font-black text-purple-700 shadow-inner border border-white">
                                     {match.name.charAt(0)}
                                   </div>
                                   <h5 className="text-lg font-black text-gray-900">{match.name}</h5>
                                 </div>
                                 <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-md shadow-sm border border-purple-200">
                                   {match.matchScore}% Match
                                 </span>
                               </div>
                               <div className="flex gap-1.5 flex-wrap mb-4">
                                 {match.skills?.map(s => (
                                   <span key={s} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600">{s}</span>
                                 ))}
                               </div>
                               <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl mb-5">
                                 <p className="text-xs font-medium text-purple-900 leading-relaxed"><strong className="font-bold">AI Insight:</strong> {match.reason}</p>
                               </div>
                               <button 
                                 disabled={sentRequests.includes(match.name)}
                                 onClick={() => handleSendRequest(match.name)}
                                 className={`text-sm font-bold px-4 py-2.5 rounded-xl transition-all w-full shadow-md ${sentRequests.includes(match.name) ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'}`}
                               >
                                 {sentRequests.includes(match.name) ? 'Request Sent ✓' : 'Send Request'}
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                     ) : (
                       <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-600 bg-white/40 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-10 text-center">
                          <BrainCircuit size={48} className="mb-5 text-gray-400 drop-shadow-md" />
                          <p className="text-base font-bold text-gray-800">Describe your project needs and run the engine to see matches.</p>
                       </div>
                     )}
                   </div>
                 </div>
              </>
            )}

            {activeTab === 'skillverification' && (
              <>
                <div className="mb-8 bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-gray-900 drop-shadow-sm flex items-center gap-3">
                        <ShieldCheck className="text-emerald-600" size={32} /> Skill Verification
                      </h3>
                      <p className="text-gray-900 font-bold text-base mt-2">
                        Verify your self-reported skills against your GitHub commit history and repository languages to build trust with potential teams.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-w-3xl mx-auto">
                  
                  {proofError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center gap-3 animate-fade-in-up">
                      <AlertCircle size={20} />
                      {proofError}
                    </div>
                  )}

                  <button 
                    onClick={runProofVerify} 
                    disabled={isVerifying || !user.github_handle || user.github_handle.trim() === ''}
                    className={`w-full py-10 mb-8 border shadow-xl rounded-2xl backdrop-blur-xl font-bold transition-all flex flex-col items-center justify-center gap-4 ${(!user.github_handle || user.github_handle.trim() === '') ? 'bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'border-white/80 bg-white/60 hover:bg-white/80 text-gray-800 hover:shadow-2xl'}`}
                  >
                    <RefreshCw size={32} className={`drop-shadow-sm ${(!user.github_handle || user.github_handle.trim() === '') ? 'text-gray-400' : 'text-emerald-500'} ${isVerifying ? 'animate-spin' : ''}`} />
                    <span className="text-lg">
                      {(!user.github_handle || user.github_handle.trim() === '') 
                        ? 'Please add a GitHub link in Settings first' 
                        : (isVerifying ? 'Analyzing Repositories for @' + user.github_handle : (proofData ? 'Refresh GitHub Verification' : 'Run GitHub Verification'))}
                    </span>
                  </button>

                  {proofData && (
                    <div className="w-full space-y-8 animate-fade-in-up">
                      <div className="p-5 bg-emerald-100/80 backdrop-blur-md border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-3 shadow-lg">
                         <CheckCircle2 size={24} className="text-emerald-600 shrink-0" /> <span className="font-bold text-base">{proofData.message}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
                        {user.skills.map(skill => {
                          const isVerified = proofData.verified_skills.includes(skill);
                          return (
                            <div key={skill} className={`p-4 rounded-xl border flex justify-between items-center shadow-sm transition-all bg-white/60 backdrop-blur-xl ${isVerified ? 'border-emerald-200' : 'border-red-200'}`}>
                              <span className="font-bold text-gray-900">{skill}</span>
                              <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-md shadow-sm ${isVerified ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                {isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'saveditem' && (
              <>
                 <div className="mb-8">
                   <h3 className="text-3xl font-black tracking-tight text-gray-900 drop-shadow-sm flex items-center gap-3">
                     <FolderHeart className="text-pink-500" size={32} /> Saved Items
                   </h3>
                   <p className="text-gray-700 font-medium mt-2">Events and profiles you've bookmarked.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl overflow-hidden">
                     <div className="px-6 py-5 border-b border-white/40 bg-white/30 flex items-center gap-3">
                       <Bookmark size={18} className="text-blue-600" />
                       <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Events</h4>
                     </div>
                     <div className="divide-y divide-white/40">
                       {collectionData?.hackathons?.map((hack, idx) => (
                          <div key={idx} className="p-5 hover:bg-white/80 transition-colors flex justify-between items-center group">
                            <div>
                              <div className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{hack.title}</div>
                              <div className="text-xs font-medium text-gray-600">{hack.date}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => toggleSave('hackathon', hack)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">Remove</button>
                            </div>
                          </div>
                       ))}
                     </div>
                   </div>
                   
                   <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl overflow-hidden">
                     <div className="px-6 py-5 border-b border-white/40 bg-white/30 flex items-center gap-3">
                       <Briefcase size={18} className="text-orange-600" />
                       <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Teams</h4>
                     </div>
                     <div className="divide-y divide-white/40">
                       {collectionData?.teams?.map((team, idx) => (
                          <div key={idx} className="p-5 hover:bg-white/80 transition-colors flex justify-between items-center group">
                            <div>
                              <div className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{team.name}</div>
                              <div className="text-xs font-medium text-gray-600 line-clamp-1">{team.hackathon}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => toggleSave('team', team)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">Remove</button>
                              <button onClick={() => setSelectedProject(team)} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">View</button>
                            </div>
                          </div>
                       ))}
                     </div>
                   </div>

                   <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl overflow-hidden">
                     <div className="px-6 py-5 border-b border-white/40 bg-white/30 flex items-center gap-3">
                       <Users size={18} className="text-purple-600" />
                       <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Profiles</h4>
                     </div>
                     <div className="divide-y divide-white/40">
                       {collectionData?.people?.map((person, idx) => (
                          <div key={idx} className="p-5 hover:bg-white/80 transition-colors flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-700 shadow-sm shrink-0">
                              {person.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-bold text-gray-900">{person.name}</div>
                              <div className="text-xs font-medium text-gray-600 line-clamp-1">{person.skills?.join(", ")}</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => toggleSave('person', person)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">Remove</button>
                            </div>
                          </div>
                       ))}
                     </div>
                   </div>
                 </div>
              </>
            )}

            {activeTab === 'setting' && (
              <>
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-3xl font-black tracking-tight text-gray-900 drop-shadow-sm mb-2 flex items-center gap-3">
                    <Settings className="text-gray-700" size={32} /> Settings
                  </h3>
                  <p className="text-gray-700 font-medium mb-8 text-base">
                    Manage your personal profile, GitHub integration, and core skills.
                  </p>
                  
                  <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl p-10 space-y-10">
                    
                    {/* Profile Picture Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-gray-200/50">
                      <div className="relative group cursor-pointer">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="Avatar" className="w-28 h-28 rounded-3xl border-4 border-white shadow-lg object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-black text-gray-400 transition-transform group-hover:scale-105">
                             {user.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <UploadCloud className="text-white drop-shadow-md" size={28} />
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-xl font-bold text-gray-900 mb-4">{user.name}</h4>
                        <button className="px-5 py-2 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm rounded-xl text-sm font-bold text-gray-700 transition-all">
                          Change Avatar
                        </button>
                      </div>
                    </div>

                    {/* Inputs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Display Name</label>
                        <input 
                          type="text" 
                          value={user.name} 
                          onChange={(e) => {
                            const newUser = { ...user, name: e.target.value };
                            setUser(newUser);
                            localStorage.setItem('user', JSON.stringify(newUser));
                          }}
                          className="w-full bg-white/50 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white transition-all" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Discord Handle</label>
                        <input 
                          type="text" 
                          value={user.discord_handle || ''} 
                          onChange={(e) => {
                            const newUser = { ...user, discord_handle: e.target.value };
                            setUser(newUser);
                            localStorage.setItem('user', JSON.stringify(newUser));
                          }}
                          placeholder="username#1234"
                          className="w-full bg-white/50 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 focus:bg-white transition-all" 
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end mb-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Professional Bio (USP)</label>
                        <button 
                          onClick={generateUSP}
                          disabled={isGeneratingUSP || !user.skills || user.skills.length === 0}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm ${isGeneratingUSP ? 'bg-purple-100 text-purple-400 cursor-not-allowed' : (!user.skills || user.skills.length === 0) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 hover:border-purple-300'}`}
                        >
                          <Sparkles size={14} className={isGeneratingUSP ? "animate-spin" : ""} />
                          {isGeneratingUSP ? "Generating..." : "✨ Auto-Generate with AI"}
                        </button>
                      </div>
                      <textarea 
                        rows={3}
                        value={user.level || ''} 
                        onChange={(e) => {
                          const newUser = { ...user, level: e.target.value };
                          setUser(newUser);
                          localStorage.setItem('user', JSON.stringify(newUser));
                        }}
                        placeholder="Write a punchy bio or use the AI generator based on your skills..."
                        className="w-full bg-white/50 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 focus:bg-white transition-all resize-y"
                      />
                      {user.keywords && user.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 ml-1">
                          {user.keywords.map((kw, i) => (
                            <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-md border border-purple-100">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">GitHub Profile Link</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="https://github.com/username"
                            value={user.github_handle} 
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              const newUser = { 
                                ...user, 
                                github_handle: val,
                                avatar_url: null, 
                                verified_skills: [] 
                              };
                              setUser(newUser);
                              setSaveStatus('idle'); // Reset error status
                              localStorage.setItem('user', JSON.stringify(newUser));
                            }}
                            className={`w-full bg-white/50 border shadow-inner rounded-xl px-4 py-3.5 pr-10 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${saveStatus === 'error' ? 'border-red-400 focus:border-red-500' : 'border-gray-200/60 focus:border-blue-500/50'}`} 
                          />
                          <div className="absolute right-3 top-3.5 group cursor-help">
                            {user.avatar_url && saveStatus !== 'error' && (
                              <>
                                <CheckCircle2 size={18} className="text-emerald-500 drop-shadow-sm" />
                                <div className="absolute -top-8 right-0 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium pointer-events-none">
                                  Validated GitHub ID
                                </div>
                              </>
                            )}
                            {saveStatus === 'error' && (
                              <>
                                <AlertCircle size={18} className="text-red-500 drop-shadow-sm" />
                                <div className="absolute -top-8 right-0 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium pointer-events-none">
                                  Invalid GitHub Link
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Team Status</label>
                      <div className="flex bg-white/50 border border-gray-200/60 shadow-inner rounded-xl p-1">
                        <button 
                          onClick={() => {
                            const newUser = { ...user, status: 'open' };
                            setUser(newUser);
                            localStorage.setItem('user', JSON.stringify(newUser));
                            setSaveStatus('idle');
                          }}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${(!user.status || user.status === 'open') ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:bg-white/60'}`}
                        >
                          Open to Teams
                        </button>
                        <button 
                          onClick={() => {
                            const newUser = { ...user, status: 'closed' };
                            setUser(newUser);
                            localStorage.setItem('user', JSON.stringify(newUser));
                            setSaveStatus('idle');
                          }}
                          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${user.status === 'closed' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-white/60'}`}
                        >
                          Closed to Teams
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Core Skills</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. React, Node, Python..."
                          value={newSkill} 
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = newSkill.trim();
                              if (trimmed && !user.skills?.includes(trimmed)) {
                                const newUser = { ...user, skills: [...(user.skills || []), trimmed] };
                                setUser(newUser);
                                localStorage.setItem('user', JSON.stringify(newUser));
                                setNewSkill('');
                                setSaveStatus('idle');
                              }
                            }
                          }}
                          className="flex-1 bg-white/50 border border-gray-200/60 shadow-inner rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white transition-all" 
                        />
                        <button 
                          onClick={() => {
                            const trimmed = newSkill.trim();
                            if (trimmed && !user.skills?.includes(trimmed)) {
                              const newUser = { ...user, skills: [...(user.skills || []), trimmed] };
                              setUser(newUser);
                              localStorage.setItem('user', JSON.stringify(newUser));
                              setNewSkill('');
                              setSaveStatus('idle');
                            }
                          }}
                          className="px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-md transition-colors flex items-center gap-2"
                        >
                          <Plus size={16} /> Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {user.skills?.map(skill => {
                          const isVerified = user.verified_skills?.includes(skill) || proofData?.verified_skills?.includes(skill);
                          return (
                            <span key={skill} className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border flex items-center gap-2 transition-all ${isVerified ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20' : 'bg-red-500 text-white border-red-600 shadow-red-500/20'}`}>
                              {skill}
                              {isVerified ? <CheckCircle2 size={12} className="text-white" /> : null}
                              <button 
                                onClick={() => {
                                  const newUser = { ...user, skills: user.skills.filter(s => s !== skill) };
                                  setUser(newUser);
                                  localStorage.setItem('user', JSON.stringify(newUser));
                                  setSaveStatus('idle');
                                }}
                                className="hover:text-black/50 bg-black/10 rounded-full p-0.5 ml-1 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pt-6">
                      {saveMessage && (
                        <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${saveStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {saveStatus === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                          {saveMessage}
                        </div>
                      )}
                      <button 
                        onClick={saveSettings}
                        disabled={saveStatus === 'saving'}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:-translate-y-1 rounded-xl text-base font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {saveStatus === 'saving' ? <RefreshCw size={20} className="animate-spin" /> : null}
                        {saveStatus === 'saving' ? 'Verifying...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          window.location.href = '/';
                        }}
                        className="w-full mt-4 py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-base font-black transition-colors flex items-center justify-center gap-2"
                      >
                        <LogOut size={20} />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* MODALS AND OVERLAYS */}
      
      {/* AI Loading Overlay */}
      {loadingAi && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center pointer-events-auto">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-bounce">
            <BrainCircuit size={48} className="text-purple-600 animate-pulse" />
            <div className="font-black text-gray-900 text-lg">Running AI Match Engine...</div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-black text-gray-900 mb-6">{isEditingProject ? 'Edit Project' : 'Create New Project'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">Team Name <span className="text-red-500">*</span></label>
                <input value={newProjectForm.name} onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} type="text" placeholder="e.g. Cyber Syndicate" className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">Hackathon <span className="text-red-500">*</span></label>
                <input value={newProjectForm.hackathon} onChange={e => setNewProjectForm({...newProjectForm, hackathon: e.target.value})} type="text" placeholder="e.g. Global AI Hackathon" className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">Project Description <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(Optional)</span></label>
                <textarea value={newProjectForm.description} onChange={e => setNewProjectForm({...newProjectForm, description: e.target.value})} rows="3" placeholder="What are you building?" className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Needed Skills</label>
                <input value={newProjectForm.skills} onChange={e => setNewProjectForm({...newProjectForm, skills: e.target.value})} type="text" placeholder="e.g. Frontend, React" className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Team Size</label>
                <input value={newProjectForm.capacity} onChange={e => setNewProjectForm({...newProjectForm, capacity: e.target.value})} type="number" min="1" max="10" placeholder="e.g. 4" className="w-full bg-white border border-gray-200 shadow-inner rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setShowProjectModal(false); setIsEditingProject(false); setEditingProjectId(null); }} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition-colors border border-gray-200">Cancel</button>
              <button onClick={isEditingProject ? handleEditProject : handleCreateProject} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors">{isEditingProject ? 'Save Changes' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <button onClick={() => toggleSave('team', selectedProject)} className="absolute top-4 right-14 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-10">
              <Bookmark size={20} className={isSaved('team', selectedProject.name) ? "fill-blue-600 text-blue-600" : ""} />
            </button>
            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-10">
              <X size={20} />
            </button>
            <div className="p-8 pb-6 bg-gradient-to-br from-blue-50 to-white">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-lg mb-6 mx-auto">
                {selectedProject.name?.charAt(0) || '?'}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-1">{selectedProject.name}</h3>
                <p className="text-sm font-bold text-blue-600 mb-3">{selectedProject.hackathon}</p>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  {selectedProject.status}
                </span>
              </div>
              {selectedProject.description ? (
                <p className="mt-5 text-sm font-medium text-gray-700 text-center italic bg-white/50 p-4 rounded-xl border border-white shadow-sm">"{selectedProject.description}"</p>
              ) : (
                <p className="mt-5 text-sm font-medium text-gray-500 text-center italic bg-white/50 p-4 rounded-xl border border-white shadow-sm">"We are building an innovative solution for this hackathon. Looking for passionate teammates!"</p>
              )}
            </div>
            <div className="p-8 pt-6 space-y-6">
              {(selectedProject.needed_skills?.length > 0 || selectedProject.roles_missing?.length > 0) && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Needed Skills & Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProject.needed_skills || selectedProject.roles_missing || []).map((skill, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Team Members ({selectedProject.members?.length || 0} / {selectedProject.capacity || 4})</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {(selectedProject.members || []).map((member, idx) => {
                    let memberName = typeof member === 'string' ? member : (member?.name || 'Unknown');
                    let role = "Full Stack Developer";
                    let skills = ["React", "Node.js", "MongoDB"];
                    
                    if (memberName === 'user_1' || memberName.toLowerCase() === 'you' || memberName === 'Payal') {
                      memberName = memberName === 'user_1' ? "You" : memberName;
                      role = "Project Lead / Backend";
                      skills = ["Python", "FastAPI", "MongoDB"];
                    } else if (memberName === 'user_2' || memberName === 'Rohan') {
                      memberName = memberName === 'user_2' ? "Sarah Chen" : memberName;
                      role = "Frontend Developer";
                      skills = ["React", "TailwindCSS", "Figma"];
                    } else if (memberName === 'user_3' || memberName === 'Ananya') {
                      memberName = memberName === 'user_3' ? "Marcus Johnson" : memberName;
                      role = "UI/UX Designer";
                      skills = ["Figma", "Design Systems", "Prototyping"];
                    } else if (memberName === 'Aryan') {
                      role = "Machine Learning";
                      skills = ["Python", "TensorFlow", "Pandas"];
                    }
                    
                    return (
                      <div key={idx} className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                            {memberName.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{memberName}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{role}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1 ml-13">
                          {skills.map((s, i) => (
                            <span key={i} className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded border border-blue-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedProject(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm transition-colors border border-gray-200">
                  Close
                </button>
                {selectedProject.leaderId === user.id ? (
                  <button
                    onClick={() => {
                      setNewProjectForm({
                        name: selectedProject.name,
                        hackathon: selectedProject.hackathon,
                        description: selectedProject.description || '',
                        skills: (selectedProject.needed_skills || []).join(', '),
                        capacity: selectedProject.capacity || 4
                      });
                      setIsEditingProject(true);
                      setEditingProjectId(selectedProject.id);
                      setSelectedProject(null);
                      setShowProjectModal(true);
                    }}
                    className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex justify-center items-center gap-2"
                  >
                    Edit Team
                  </button>
                ) : (
                  <button 
                    onClick={async () => {
                      if (!sentRequests.includes(selectedProject.name)) {
                        try {
                          const res = await fetch(`${API_BASE}/requests/send`, {
                            method: 'POST',
                            headers: getHeaders(),
                            body: JSON.stringify({
                              targetId: selectedProject.name,
                              targetType: "team",
                              type: "join"
                            })
                          });
                          if (res.ok) {
                            setSentRequests(prev => [...prev, selectedProject.name]);
                            setNotifications(prev => [{ _id: Date.now(), message: `Join request sent to ${selectedProject.name}!` }, ...prev]);
                            addToast('Request sent!', 'success');
                            setSelectedProject(null);
                          }
                        } catch (e) {
                          addToast('Failed to send request', 'error');
                        }
                      }
                    }}
                    disabled={sentRequests.includes(selectedProject.name) || (selectedProject.members?.length || 1) >= (selectedProject.capacity || 4)}
                    className={`flex-[2] py-3.5 rounded-xl text-sm font-bold shadow-md transition-colors flex justify-center items-center gap-2 ${(sentRequests.includes(selectedProject.name) || (selectedProject.members?.length || 1) >= (selectedProject.capacity || 4)) ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {(selectedProject.members?.length || 1) >= (selectedProject.capacity || 4) ? 'Team is Full' : (sentRequests.includes(selectedProject.name) ? 'Request Sent ✓' : 'Request to Join')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 p-8 rounded-3xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => toggleSave('person', showProfileModal)} className="absolute top-4 right-14 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-10">
              <Bookmark size={20} className={isSaved('person', showProfileModal.name) ? "fill-blue-600 text-blue-600" : ""} />
            </button>
            <button onClick={() => setShowProfileModal(null)} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl font-black text-blue-700 shadow-inner border border-white">
                {showProfileModal.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">{showProfileModal.name}</h3>
                <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shadow-sm border border-emerald-200">
                  <ShieldCheck size={12} /> GitHub Verified
                </span>
                <a 
                  href="https://discord.com/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 mt-1 ml-2 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border cursor-pointer transition-colors ${copiedDiscord ? 'bg-green-100 text-green-700 border-green-300' : 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100'}`} 
                  onClick={() => {
                    navigator.clipboard.writeText(`${showProfileModal.name.split(' ')[0].toLowerCase()}_dev`).catch(() => {});
                    setCopiedDiscord(true);
                    setTimeout(() => setCopiedDiscord(false), 2000);
                  }}
                >
                  <MessageSquare size={12} /> {copiedDiscord ? 'Copied to Clipboard!' : `${showProfileModal.name.split(' ')[0].toLowerCase()}_dev`}
                </a>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Technical Skills</h4>
              <div className="flex gap-2 flex-wrap">
                {showProfileModal.skills.map(s => (
                  <span key={s} className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm">{s}</span>
                ))}
              </div>
            </div>

            {showProfileModal.score && (
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl mb-6">
                <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">AI Match: {showProfileModal.score}</div>
                <p className="text-sm font-medium text-purple-900">Great fit based on your recent searches.</p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleSendRequest(showProfileModal.name)}
                disabled={sentRequests.includes(showProfileModal.name)}
                className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-md transition-colors flex justify-center items-center gap-2 ${sentRequests.includes(showProfileModal.name) ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                <User size={18} /> {sentRequests.includes(showProfileModal.name) ? 'Request Sent ✓' : 'Send Request'}
              </button>
              <button 
                onClick={() => {
                  toggleSave('person', showProfileModal);
                  setNotifications(prev => [{ _id: Date.now(), message: isSaved('person', showProfileModal.name) ? `Removed ${showProfileModal.name} from saved profiles.` : `Saved ${showProfileModal.name} to your collection!` }, ...prev]);
                }}
                className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-sm transition-colors border flex justify-center items-center gap-2 ${isSaved('person', showProfileModal.name) ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <Bookmark size={18} className={isSaved('person', showProfileModal.name) ? "fill-indigo-700" : ""} /> {isSaved('person', showProfileModal.name) ? 'Saved Profile' : 'Save Profile'}
              </button>
              <button onClick={() => setShowProfileModal(null)} className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors mt-1">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notifications */}
      <div className="fixed top-24 right-4 z-[99999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-3 rounded-xl shadow-xl text-sm font-bold animate-fade-in-up flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>
             {toast.type === 'success' && <CheckCircle2 size={18} />}
             {toast.type === 'error' && <X size={18} />}
             {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarButton({ id, icon, label, activeTab, setActiveTab }) {
  const isActive = activeTab === id;
  return (
    <Link 
      to={`/${id}`}
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${isActive ? 'bg-white/60 shadow-sm border border-white/80 text-gray-900 font-bold' : 'text-gray-700 font-semibold hover:text-gray-900 hover:bg-white/40 border border-transparent'}`}
    >
      {icon} {label}
    </Link>
  );
}

function MetricCard({ title, value, icon, onClick }) {
  return (
    <div onClick={onClick} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl hover:shadow-2xl hover:-translate-y-1 p-6 rounded-2xl transition-all cursor-pointer flex flex-col gap-4">
      <div className="flex items-center gap-3 text-gray-800">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
      </div>
      <div className="text-4xl font-black text-gray-900 drop-shadow-sm">{value}</div>
    </div>
  );
}
