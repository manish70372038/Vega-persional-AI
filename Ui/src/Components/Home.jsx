import { useState } from "react";
import { Sigh, Login } from "./Auth.page";
import { useNavigate } from "react-router-dom";
import "./CssFiles/Home.css";

function Home() {
  const navigate = useNavigate();
  const [page, setPage] = useState("signup");

  return (
    <div className="home-dark">
      {/* Simple Dark Background with subtle gradient */}
      <div className="dark-bg"></div>

      {/* Navbar */}
      <nav className="dark-navbar">
        <div className="nav-left">
          <div className="logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text"><h1>Vega</h1></span>
            <span className="logo-ai"><h1>AI</h1></span>
          </div>
          <div className="beta-tag">Beta</div>
        </div>
        <div className="nav-right">
          <button className="nav-link" onClick={() => navigate("/Dashboard")}>
            Dashboard
          </button>
          <button
            className={`nav-link ${page === "login" ? "active" : ""}`}
            onClick={() => setPage("login")}
          >
            Login
          </button>
          <button
            className={`nav-link ${page === "signup" ? "active" : ""}`}
            onClick={() => setPage("signup")}
          >
            Signup
          </button>
        </div>
      </nav>

      
      <div className="dark-main">
        
        <div className="hero-simple">
          <div className="hero-badge-simple">
            <span></span>Vega AI Assistant
          </div>
          <h1 className="hero-title-simple">
            Your Personal
            <span className="highlight"> Vega AI Assistant</span>
          </h1>
          <p className="hero-desc-simple">
            Vega AI helps you work smarter, not harder. Get instant answers,
            automate tasks, and boost productivity.
          </p>
          <div className="feature-list-simple">
            <div className="feature-simple">
              <span className="check">✓</span> Smart conversations
            </div>
            <div className="feature-simple">
              <span className="check">✓</span> 24/7 availability
            </div>
            <div className="feature-simple">
              <span className="check">✓</span> Privacy focused
            </div>
          </div>
          <div className="stats-simple">
            <div>
              <h4>10K+</h4>
              <p>Users</p>
            </div>
            <div>
              <h4>4.9</h4>
              <p>Rating</p>
            </div>
            <div>
              <h4>Free</h4>
              <p>To start</p>
            </div>
          </div>
        </div>

        <div className="auth-section-simple">
          <div className="auth-card-simple">
            <div className="auth-header-simple"></div>
            
            <div className="auth-forms-simple">
             {page === "login" && <Login />}
             {page === "signup" && <Sigh />}
            </div>
            <div className="auth-footer-simple">
              <p>
                {page === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  className="switch-btn-simple"
                  onClick={() => setPage(page === "login" ? "signup" : "login")}
                >
                  {page === "login" ? "Sign Up" : "Login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
