// Mainpage.jsx - Dark Theme No Scroll Design
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CssFiles/Mainpage.css";
import useUser from "./userdata";
import askAI from "./gemini";
import apibackend from "../apibackend";
import imagelisting from "../assets/ai-input.gif";
import imagereply from "../assets/ai-output.gif";

function Mainpage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [assname, setassname] = useState("");
  const [selectedAi, setselectedAi] = useState("");
  const [tempSelectedUrl, setTempSelectedUrl] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const shouldRunRef = useRef(false);

  const user = useUser();

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

  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.log("Speech Recognition supported nahi hai.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;

      recognition.onresult = async (event) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript.trim();
        console.log("User bola:", transcript);

        const savedAI = JSON.parse(localStorage.getItem("selectedAI")) || {};
        const aiName = savedAI?.name || "";

        if (aiName && transcript.toLowerCase().includes(aiName.toLowerCase())) {
          console.log("✅ AI name mila — calling AI...");
          const response = await askAI(transcript);
          console.log("response", response);

          if (response?.reply) speak(response.reply);
          if (response?.url) window.open(response.url, "_blank");
          if (response?.deeplink) {
            window.location.href = response.deeplink;
            setTimeout(() => {
              if (response?.url) window.open(response.url, "_blank");
            }, 2000);
          }
        } else {
          console.log("❌ AI name nahi mila — chup raho");
        }
      };

      recognition.onerror = (event) => {
        console.log("Speech error:", event.error);
      };

      recognition.onend = () => {
        if (shouldRunRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {}
          }, 300);
        }
      };
    } catch (err) {
      console.log("Speech Recognition Error:", err);
    }
  }, []);

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
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.log("Start error:", e);
      }
    }
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
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-brand">
          <span className="brand-icon"></span>
          <span className="brand-name">Vega <span>AI</span></span>
        </div>
        <div className="nav-menu">
          <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="user-avatar">
              <span>{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            <span className="user-name">{user.name}</span>
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/profile")} className="dropdown-item">
                <span>👤</span>
                <span>Profile</span>
              </button>
              <button onClick={handleLogout} className="dropdown-item logout">
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="main-layout">
        {/* Side Panel - AI Configuration */}
        <aside className="config-panel">
          <div className="panel-header">
            <h3>AI Assistant</h3>
            <p>Configure your companion</p>
          </div>

          <div className="config-form">
            <div className="form-group">
              <label>AI Name</label>
              <input
                type="text"
                placeholder="Enter name..."
                value={assname}
                onChange={(e) => setassname(e.target.value)}
                className="name-input"
              />
            </div>

            <div className="form-group">
              <label>Select Avatar</label>
              <div className="avatar-grid">
                <div 
                  className={`avatar-card ${tempSelectedUrl === "https://t3.ftcdn.net/jpg/09/40/72/30/360_F_940723032_ymlwbOQkZOpEmqvxOCwEl8l0Ggx6xUdQ.jpg" ? "selected" : ""}`}
                  onClick={() => handleImageClick("https://t3.ftcdn.net/jpg/09/40/72/30/360_F_940723032_ymlwbOQkZOpEmqvxOCwEl8l0Ggx6xUdQ.jpg")}
                >
                  <img src="https://t3.ftcdn.net/jpg/09/40/72/30/360_F_940723032_ymlwbOQkZOpEmqvxOCwEl8l0Ggx6xUdQ.jpg" alt="Avatar 1" />
                </div>
                <div 
                  className={`avatar-card ${tempSelectedUrl === "https://imgcdn.stablediffusionweb.com/2024/12/1/0f930cb6-d399-4735-9b30-e35d024e3efd.jpg" ? "selected" : ""}`}
                  onClick={() => handleImageClick("https://imgcdn.stablediffusionweb.com/2024/12/1/0f930cb6-d399-4735-9b30-e35d024e3efd.jpg")}
                >
                  <img src="https://imgcdn.stablediffusionweb.com/2024/12/1/0f930cb6-d399-4735-9b30-e35d024e3efd.jpg" alt="Avatar 2" />
                </div>
                <div 
                  className={`avatar-card ${tempSelectedUrl === "https://img.freepik.com/premium-photo/face-that-has-word-ai-it_872754-2069.jpg" ? "selected" : ""}`}
                  onClick={() => handleImageClick("https://img.freepik.com/premium-photo/face-that-has-word-ai-it_872754-2069.jpg")}
                >
                  <img src="https://img.freepik.com/premium-photo/face-that-has-word-ai-it_872754-2069.jpg" alt="Avatar 3" />
                </div>
                <div 
                  className={`avatar-card ${tempSelectedUrl === "https://img.freepik.com/premium-photo/face-female-robot-artificial-intelligence-concept_1106493-21089.jpg" ? "selected" : ""}`}
                  onClick={() => handleImageClick("https://img.freepik.com/premium-photo/face-female-robot-artificial-intelligence-concept_1106493-21089.jpg")}
                >
                  <img src="https://img.freepik.com/premium-photo/face-female-robot-artificial-intelligence-concept_1106493-21089.jpg" alt="Avatar 4" />
                </div>
              </div>
            </div>

            <button onClick={handleCreateAI} className="create-btn">
              Create Assistant
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="content-area">
          {selectedAi ? (
            <>
              {/* Voice Control Bar */}
              <div className="voice-control">
                <div className="welcome-text">
                  <h2>Hello, {user.name}</h2>
                  <p>Your assistant is ready</p>
                </div>
                <button 
                  onClick={toggleListening}
                  className={`voice-btn ${isListening ? 'active' : ''}`}
                >
                  <span>{isListening ? '🔴' : '🎤'}</span>
                  <span>{isListening ? 'Listening...' : 'Start Voice'}</span>
                </button>
              </div>

              {/* AI Display */}
              <div className="ai-showcase">
                <div className={`ai-avatar ${isAiSpeaking ? 'speaking' : isListening ? 'listening' : ''}`}>
                  <img 
                    src={selectedAi.url} 
                    alt={selectedAi.name}
                  />
                  {(isAiSpeaking || isListening) && (
                    <div className="status-indicator">
                      {isAiSpeaking ? '🔊 Speaking...' : '🎧 Listening...'}
                    </div>
                  )}
                </div>
                <div className="ai-details">
                  <h3>{selectedAi.name}</h3>
                  <div className="status-badge">
                    <span className={`status-icon ${isAiSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'}`}></span>
                    <span>{isAiSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Idle'}</span>
                  </div>
                </div>
              </div>

              {/* Animation Section */}
              <div className="animation-section">
                <div className={`animation-item ${isListening && !isAiSpeaking ? 'active' : ''}`}>
                  <div className="animation-icon">🎤</div>
                  <div className="animation-gif">
                    <img src={imagelisting} alt="listening" />
                  </div>
                  <span>User Input</span>
                </div>
                <div className={`animation-item ${isAiSpeaking ? 'active' : ''}`}>
                  <div className="animation-icon">🔊</div>
                  <div className="animation-gif">
                    <img src={imagereply} alt="speaking" />
                  </div>
                  <span>AI Response</span>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-assistant">
              <div className="empty-icon">🤖</div>
              <h3>No Assistant Configured</h3>
              <p>Create your AI assistant from the side panel</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Mainpage;