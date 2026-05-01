import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CssFiles/Mainpage.css";
import useUser from "./userdata";
import askAI from "./gemini";
import imagelisting from "../assets/ai-input.gif";
import imagereply from "../assets/ai-output.gif";
import apibackend from "../apibackend";

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

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

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
    await fetch(`${apibackend}/api/logout`, {
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
    const data = {
      name: assname || "Default AI",
      url: tempSelectedUrl,
    };
    setselectedAi(data);
    localStorage.setItem("selectedAI", JSON.stringify(data));
  };

  const speak = (text, lang = "hi-IN") => {
    if (!text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(lang.split("-")[0]));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.lang = voiceLang;
    if (isListening) {
      shouldRunRef.current = false;
      recognition.stop();
      setTimeout(() => {
        shouldRunRef.current = true;
        try { recognition.start(); } catch (e) {}
      }, 400);
    }
  }, [voiceLang]);

  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.log("Speech Recognition supported nahi hai.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = voiceLang;
      recognitionRef.current = recognition;

      recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        console.log("User bola:", transcript);

        const detectedLang = isHindi(transcript) ? "hi-IN" : "en-US";
        const savedAI = JSON.parse(localStorage.getItem("selectedAI")) || {};
        const aiName = savedAI?.name || "Assistant";

        const response = await askAI(transcript, user?.name, aiName);
        console.log("AI Response:", response);

        if (response?.reply) {
          const replyLang = response?.lang || detectedLang;
          speak(response.reply, replyLang);
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
    } catch (err) {
      console.log("Speech Recognition Error:", err);
    }
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
    setVoiceLang(prev => prev === "en-US" ? "hi-IN" : "en-US");
  };

  if (!user)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-brand">
          <div className="brand-logo">✨</div>
          <div className="brand-name">Neo<span>Voice</span></div>
        </div>
        <div className="nav-actions">
          <div className="lang-switch" onClick={toggleLang}>
            <span>{voiceLang === "hi-IN" ? "🇮🇳" : "🇺🇸"}</span>
            <span>{voiceLang === "hi-IN" ? "हिंदी" : "EN"}</span>
          </div>
          <div className="user-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.name}</span>
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/profile")} className="dropdown-item">
                👤 Profile
              </button>
              <button onClick={handleLogout} className="dropdown-item logout">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="main-container">
        {/* Left Sidebar - Config Panel */}
        <aside className="config-sidebar">
          <div className="config-header">
            <h3>Create Your AI</h3>
            <p>Personalize your assistant</p>
          </div>

          <div className="config-body">
            <div className="input-field">
              <label>Assistant Name</label>
              <input
                type="text"
                placeholder="e.g., Vega, Jarvis"
                value={assname}
                onChange={(e) => setassname(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label>Choose Avatar</label>
              <div className="avatar-selector">
                {[
                  "https://t3.ftcdn.net/jpg/09/40/72/30/360_F_940723032_ymlwbOQkZOpEmqvxOCwEl8l0Ggx6xUdQ.jpg",
                  "https://imgcdn.stablediffusionweb.com/2024/12/1/0f930cb6-d399-4735-9b30-e35d024e3efd.jpg",
                  "https://img.freepik.com/premium-photo/face-that-has-word-ai-it_872754-2069.jpg",
                  "https://img.freepik.com/premium-photo/face-female-robot-artificial-intelligence-concept_1106493-21089.jpg"
                ].map((url, idx) => (
                  <div
                    key={idx}
                    className={`avatar-opt ${tempSelectedUrl === url ? "active" : ""}`}
                    onClick={() => handleImageClick(url)}
                  >
                    <img src={url} alt={`avatar-${idx}`} />
                  </div>
                ))}
              </div>
            </div>

            <button className="create-assistant-btn" onClick={handleCreateAI}>
              Launch Assistant
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content-area">
          {selectedAi ? (
            <>
              {/* Welcome Header */}
              <div className="welcome-section">
                <div className="greeting-box">
                  <h1>Hey {user.name} 👋</h1>
                  <p>Your assistant is online & ready</p>
                </div>
                <button
                  onClick={toggleListening}
                  className={`mic-button ${isListening ? "active" : ""}`}
                >
                  <span>{isListening ? "🔴" : "🎤"}</span>
                  <span>{isListening ? "Listening..." : "Start Voice"}</span>
                </button>
              </div>

              {/* AI Character Display */}
              <div className="character-display">
                <div className={`character-card ${isAiSpeaking ? "speaking" : isListening ? "listening" : ""}`}>
                  <div className="character-glow"></div>
                  <img src={selectedAi.url} alt={selectedAi.name} className="character-img" />
                  <div className="character-status">
                    {isAiSpeaking ? "🔊 Speaking..." : isListening ? "🎧 Listening..." : "💤 Idle"}
                  </div>
                </div>
                <div className="character-info">
                  <h2>{selectedAi.name}</h2>
                  <div className="status-chip">
                    <span className={`status-led ${isAiSpeaking ? "speak" : isListening ? "listen" : "idle"}`}></span>
                    <span>{isAiSpeaking ? "Active" : isListening ? "Receiving" : "Standby"}</span>
                  </div>
                </div>
              </div>

              {/* Voice Activity Panel */}
              <div className="activity-panel">
                <div className={`activity-card ${isListening && !isAiSpeaking ? "active" : ""}`}>
                  <div className="activity-icon">🎙️</div>
                  <div className="activity-gif">
                    <img src={imagelisting} alt="input" />
                  </div>
                  <div className="activity-label">Voice Input</div>
                  <div className="activity-wave">
                    <span></span><span></span><span></span><span></span>
                  </div>
                </div>
                <div className={`activity-card ${isAiSpeaking ? "active" : ""}`}>
                  <div className="activity-icon">🔊</div>
                  <div className="activity-gif">
                    <img src={imagereply} alt="output" />
                  </div>
                  <div className="activity-label">AI Response</div>
                  <div className="activity-wave">
                    <span></span><span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-center">
              <div className="empty-illustration">🤖</div>
              <h3>No Assistant Configured</h3>
              <p>Set up your AI companion from the left panel</p>
              <div className="empty-hint">✨ Select avatar & give a name ✨</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Mainpage;