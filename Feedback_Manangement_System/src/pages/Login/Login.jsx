import React, { useState, useEffect, useContext } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RoleContext } from "../../App";

function Login() {
  const { setRole } = useContext(RoleContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setLoginRole] = useState("student");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // 👈 state for toggle

  // ✅ Load saved credentials if remember me was used
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    const savedPassword = localStorage.getItem("rememberPassword");
    //const savedRole = localStorage.getItem("rememberRole");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      // setLoginRole(savedRole);
      setRemember(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await api.post("Login", {
        email,
        password,
      });

      if (response.data && response.data.message === "Login successful.") {
        const user = response.data?.users || response.data?.user;
        const token = response.data?.token;
        if (!user || !token) {
          setError("User data or token not found.");
          return;
        }
        // console.log("user:", user);

        setRole(user.role.toLowerCase());
        // If remember me checked → save credentials
        if (remember) {
          localStorage.setItem("rememberEmail", email);
          localStorage.setItem("rememberPassword", password);
          // localStorage.setItem("rememberRole", role);
        } else {
          // ❌ Clear if not checked
          localStorage.removeItem("rememberEmail");
          localStorage.removeItem("rememberPassword");
          // localStorage.removeItem("rememberRole");
        }

        // ✅ Save user info in localStorage (for session)
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        if (user.role.toLowerCase() === "admin") {
          navigate("/app/feedback-dashboard");
        } else if (
          user.role.toLowerCase() === "trainer" ||
          user.role.toLowerCase() === "staff"
        ) {
          navigate("/app/staff-dashboard");
        } else if (user.role.toLowerCase() === "student") {
          navigate("/app/student-pending-feedbacklist");
        } else {
          navigate("/app");
        }
      } else {
        setError("Invalid login details.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email, password.");
    }
  };

  return (
    <>
      <div className="container">
        <h2 className="page-header text-center mt-3">Login</h2>
        <div className="login-form">
          <div className="mb-3">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              className="form-control"
            />
          </div>

          <div className="mb-3" style={{ position: "relative" }}>
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"} // 👈 toggle type
              className="form-control"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "28px",
                cursor: "pointer",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="mb-3">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <label htmlFor="remember" style={{ marginLeft: 8 }}>
              Remember Me
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          <div className="mb-3 text-center ">
            <div className="mb-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <p>
              New user? <Link to="/register-student">Register here</Link>
            </p>
            <button className="btn btn-success" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
