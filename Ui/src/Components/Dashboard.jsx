import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CssFiles/Mainpage.css";
import useUser from "./userdata";
import Gemniapi from "./gemini";
import imagelisting from "../assets/ai-input.gif";
import imagereply from "../assets/ai-output.gif";

const isHindi = (text) => {
  const hindiPattern = /[\u0900-\u097F]/;
  const hindiWords = ["kya", "hai", "nahi", "haan", "bolo", "karo", "batao",
    "mujhe", "tumhe", "aaj", "kal", "abhi", "kitna", "kaun", "kaise",
    "gaana", "chala", "kholo", "baja", "time", "date", "din", "mausam",
    "dhundh", "laga", "bajao", "sun", "dekho", "bhai", "yaar", "bol"];
  const lower = text.toLowerCase();
  return hindiPattern.test(text) || hindiWords.some(w => lower.includes(w));
};

function Mainpage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [assname, setassname] = useState("");
  const [selectedAi, setselectedAi] = useState(null);
  const [tempSelectedUrl, setTempSelectedUrl] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceLang, setVoiceLang] = useState("hi-IN");
  const recognitionRef = useRef(null);
  const shouldRunRef = useRef(false);

  const user = useUser();

  // Load saved AI on mount
  useEffect(() => {
    const savedAI = localStorage.getItem("selectedAI");
    if (savedAI) {
      try {
        setselectedAi(JSON.parse(savedAI));
      } catch (err) {
        console.log("Error loading AI:", err);
      }
    }
  }, []);

  const handleLogout = async () => {
    await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/");
  };

  const handleImageClick = (imageUrl) => {
    setTempSelectedUrl(imageUrl);
  };

  const handleCreateAI = () => {
    if (!tempSelectedUrl) {
      alert("Please select an image first!");
      return;
    }
    if (!assname.trim()) {
      alert("Please enter an AI name!");
      return;
    }
    const data = {
      name: assname,
      url: tempSelectedUrl,
    };
    setselectedAi(data);
    localStorage.setItem("selectedAI", JSON.stringify(data));
  };

  const speak = (text, lang = "hi-IN") => {
    if (!text || text.trim() === "") return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(lang.split("-")[0]));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Voice recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = voiceLang;
    recognitionRef.current = recognition;

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log("User said:", transcript);
      
      const detectedLang = isHindi(transcript) ? "hi-IN" : "en-US";
      const savedAI = JSON.parse(localStorage.getItem("selectedAI")) || {};
      const aiName = savedAI?.name || "Assistant";
      
      const response = await Gemniapi(transcript, user?.name || "User", aiName);
      console.log("AI Response:", response);
      
      if (response?.reply && response.reply.trim() !== "") {
        const replyLang = response?.lang || detectedLang;
        speak(response.reply, replyLang);
      } else {
        const fallback = detectedLang === "hi-IN" ? "Kya karoon aapke liye?" : "What can I do for you?";
        speak(fallback, detectedLang);
      }
      
      if (response?.url) window.open(response.url, "_blank");
      
      if (response?.deeplink) {
        window.location.href = response.deeplink;
        setTimeout(() => {
          if (response?.url) window.open(response.url, "_blank");
        }, 2000);
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech error:", event.error);
      if (event.error === "network" && shouldRunRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 1000);
      }
    };

    recognition.onend = () => {
      if (shouldRunRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (e) {}
        }, 300);
      }
    };
  }, [voiceLang, user]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      shouldRunRef.current = false;
      recognition.stop();
      setIsListening(false);
    } else {
      shouldRunRef.current = true;
      try {
        recognition.lang = voiceLang;
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.log("Start error:", e);
      }
    }
  };

  const toggleLang = () => {
    const newLang = voiceLang === "en-US" ? "hi-IN" : "en-US";
    setVoiceLang(newLang);
    
    if (isListening) {
      shouldRunRef.current = false;
      recognitionRef.current?.stop();
      setTimeout(() => {
        shouldRunRef.current = true;
        try {
          recognitionRef.current.lang = newLang;
          recognitionRef.current.start();
        } catch (e) {}
      }, 300);
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎙️</span>
            <h2>Voice<span>AI</span></h2>
          </div>
          <p className="welcome-text">Welcome, {user.name}</p>
        </div>

        <div className="config-section">
          <h4>Configure Assistant</h4>
          
          <div className="input-group">
            <label>AI Name</label>
            <input
              type="text"
              placeholder="e.g., Vega, Jarvis, Alexa"
              value={assname}
              onChange={(e) => setassname(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label>Select Avatar</label>
            <div className="avatar-grid">
              {[
                "https://t3.ftcdn.net/jpg/09/40/72/30/360_F_940723032_ymlwbOQkZOpEmqvxOCwEl8l0Ggx6xUdQ.jpg",
                "https://imgcdn.stablediffusionweb.com/2024/12/1/0f930cb6-d399-4735-9b30-e35d024e3efd.jpg",
                "https://img.freepik.com/premium-photo/face-that-has-word-ai-it_872754-2069.jpg",
                "https://img.freepik.com/premium-photo/face-female-robot-artificial-intelligence-concept_1106493-21089.jpg"
              ].map((url, idx) => (
                <div
                  key={idx}
                  className={`avatar-option ${tempSelectedUrl === url ? "selected" : ""}`}
                  onClick={() => handleImageClick(url)}
                >
                  <img src={url} alt={`Avatar ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
          
          <button className="create-btn" onClick={handleCreateAI}>
            Create Assistant
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="user-info" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email || `${user.name}@example.com`}</span>
            </div>
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/profile")}>👤 Profile</button>
              <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {selectedAi ? (
          <>
            {/* Top Bar */}
            <div className="top-bar">
              <div className="greeting">
                <h1>Hello, {user.name} 👋</h1>
                <p>Your assistant {selectedAi.name} is ready</p>
              </div>
              <div className="controls">
                <button className="lang-btn" onClick={toggleLang}>
                  {voiceLang === "hi-IN" ? "🇮🇳 Hindi" : "🇺🇸 English"}
                </button>
                <button 
                  className={`voice-btn ${isListening ? "active" : ""}`}
                  onClick={toggleListening}
                >
                  <span>{isListening ? "🔴" : "🎤"}</span>
                  <span>{isListening ? "Listening..." : "Start Voice"}</span>
                </button>
              </div>
            </div>

            {/* AI Avatar Display */}
            <div className="ai-display">
              <div className={`ai-avatar-container ${isAiSpeaking ? "speaking" : isListening ? "listening" : ""}`}>
                <img src={selectedAi.url} alt={selectedAi.name} className="ai-avatar-image" />
                {(isAiSpeaking || isListening) && (
                  <div className="status-overlay">
                    {isAiSpeaking ? "🔊 Speaking..." : "🎧 Listening..."}
                  </div>
                )}
              </div>
              <div className="ai-info">
                <h2>{selectedAi.name}</h2>
                <div className="status-badge">
                  <span className={`status-dot ${isAiSpeaking ? "speaking" : isListening ? "listening" : "idle"}`}></span>
                  <span>{isAiSpeaking ? "Speaking" : isListening ? "Listening" : "Idle"}</span>
                </div>
              </div>
            </div>

            {/* Animation Section */}
            <div className="animations">
              <div className={`animation-card ${isListening && !isAiSpeaking ? "active" : ""}`}>
                <div className="animation-icon">🎤</div>
                <img src={imagelisting} alt="Listening" className="animation-gif" />
                <p>Voice Input</p>
              </div>
              <div className={`animation-card ${isAiSpeaking ? "active" : ""}`}>
                <div className="animation-icon">🔊</div>
                <img src={imagereply} alt="Speaking" className="animation-gif" />
                <p>AI Response</p>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <h3>No Assistant Configured</h3>
            <p>Create your AI assistant from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mainpage;