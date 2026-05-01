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
  const [selectedAi, setselectedAi] = useState("");
  const [tempSelectedUrl, setTempSelectedUrl] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en-US");
  const recognitionRef = useRef(null);
  const shouldRunRef = useRef(false);
  const isProcessingRef = useRef(false); // ← duplicate response rokne ke liye

  const user = useUser();

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
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

  const speak = (text, lang = "en-US") => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.15;
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
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

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
        const lastResult = event.results[event.results.length - 1];

        // Fix 1 — sirf final result lo, duplicate rokne ke liye
        if (!lastResult.isFinal) return;

        // Fix 2 — agar already processing ho toh skip karo
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const transcript = lastResult[0].transcript.trim();
        console.log("User bola:", transcript);

        const detectedLang = isHindi(transcript) ? "hi-IN" : "en-US";
        console.log("Detected lang:", detectedLang);

        try {
          const response = await askAI(transcript);
          console.log("AI Response:", response);

          // Reply speak karo
          if (response?.reply) {
            const replyLang = response?.lang || detectedLang;
            speak(response.reply, replyLang);
          }

          // URL nikalo — dono jagah se check karo
          const finalUrl = response?.url || response?.data?.url;
          const finalDeeplink = response?.deeplink || response?.data?.deeplink;

          // Fix 3 — open_app alag handle karo
          if (response?.action === "open_app") {
            if (finalDeeplink) {
              window.location.href = finalDeeplink;
              setTimeout(() => {
                if (finalUrl) window.open(finalUrl, "_blank");
              }, 2000);
            } else if (finalUrl) {
              window.open(finalUrl, "_blank");
            }
          } else if (finalUrl) {
            // YouTube, Google, Weather, News sab
            window.open(finalUrl, "_blank");
          }

        } catch (err) {
          console.log("AI Error:", err);
        } finally {
          // Processing complete — next request ke liye unlock karo
          isProcessingRef.current = false;
        }
      };

      recognition.onerror = (event) => {
        console.log("Speech error:", event.error);
        isProcessingRef.current = false;
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

        <main className="content-area">
          {selectedAi ? (
            <>
              <div className="voice-control">
                <div className="welcome-text">
                  <h2>Hello, {user.name}</h2>
                  <p>Your assistant is ready</p>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button onClick={toggleLang} className="voice-btn"
                    style={{ background: voiceLang === "hi-IN" ? "#f97316" : "#6366f1" }}>
                    <span>{voiceLang === "hi-IN" ? "🇮🇳" : "🇺🇸"}</span>
                    <span>{voiceLang === "hi-IN" ? "Hindi" : "English"}</span>
                  </button>

                  <button
                    onClick={toggleListening}
                    className={`voice-btn ${isListening ? "active" : ""}`}
                  >
                    <span>{isListening ? "🔴" : "🎤"}</span>
                    <span>{isListening ? "Listening..." : "Start Voice"}</span>
                  </button>
                </div>
              </div>

              <div className="ai-showcase">
                <div className={`ai-avatar ${isAiSpeaking ? "speaking" : isListening ? "listening" : ""}`}>
                  <img src={selectedAi.url} alt={selectedAi.name} />
                  {(isAiSpeaking || isListening) && (
                    <div className="status-indicator">
                      {isAiSpeaking ? "🔊 Speaking..." : "🎧 Listening..."}
                    </div>
                  )}
                </div>
                <div className="ai-details">
                  <h3>{selectedAi.name}</h3>
                  <div className="status-badge">
                    <span className={`status-icon ${isAiSpeaking ? "speaking" : isListening ? "listening" : "idle"}`}></span>
                    <span>{isAiSpeaking ? "Speaking" : isListening ? "Listening" : "Idle"}</span>
                  </div>
                </div>
              </div>

              <div className="animation-section">
                <div className={`animation-item ${isListening && !isAiSpeaking ? "active" : ""}`}>
                  <div className="animation-icon">🎤</div>
                  <div className="animation-gif">
                    <img src={imagelisting} alt="listening" />
                  </div>
                  <span>User Input</span>
                </div>
                <div className={`animation-item ${isAiSpeaking ? "active" : ""}`}>
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