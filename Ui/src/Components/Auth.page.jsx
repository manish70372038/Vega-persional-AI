import React, { useState } from "react";
import "./CssFiles/Signup.css";
import apibackend from "../apibackend";
export function Sigh() {
 
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setmessage] = useState("");
  const [error, seterror] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apibackend}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      console.log(data.message);
      if (res.ok) {
        setmessage("Signup successfully ✅");
        seterror("");
        setTimeout(() => {
          window.location.href = "/Dashboard";
        }, 1500);
      } else {
        seterror(data.message || "Signup failed ❌");
        setmessage("");
      }
    } catch (error) {
      console.log("Sighup failed..", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="form-card">
        <div className="form-header">
          <i className="fas fa-user-plus"></i>
          <h2>Create Account</h2>
          <p>Join Nexus AI today</p>
          {message && <p className="success-msg">{message}</p>}
          {error && <p className="error-msg">{error}</p>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <i className="fas fa-user"></i>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
          </div>
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              required
              onChange={(e) => setemail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setpassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating Account..." : "SIGN UP"}
          </button>
        </form>
        <div className="form-footer"></div>
      </div>
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mess, setmess] = useState("");
  const [err, seterr] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res2 = await fetch(`${apibackend}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data2 = await res2.json();
      console.log(data2.message);
      if (res2.ok) {
        setmess("Login successfully ✅");
        seterr("");
        setTimeout(() => {
          window.location.href = "/Dashboard";
        }, 1500);
      } else {
        seterr(data2.message || "Login failed ❌");
        setmess("");
      }
    } catch (error) {
      console.log("Login failed", error);
    } finally {
      setLoading(false);
    }
  };
  {
    mess && <p className="success-msg">{mess}</p>;
  }
  {
    err && <p className="error-msg">{err}</p>;
  }
  return (
    <div className="login-container">
      <div className="form-card">
        <div className="form-header">
          <i className="fas fa-sign-in-alt"></i>
          <h2>Welcome Back</h2>
          {mess && <p className="success-msg">{mess}</p>}
          {err && <p className="error-msg">{err}</p>}
          <p>Login to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>
        <div className="form-footer"></div>
      </div>
    </div>
  );
}

function Profile() {

  return (
    <div>
      <span>
        <h1>my profile</h1>
        
      </span>
    </div>
  );
}

export default Profile;
