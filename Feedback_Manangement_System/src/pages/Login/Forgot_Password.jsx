import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Api from "../../services/api";

function Forgot_Password() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async () => {
    // ✅ Frontend validation
    if (!email || !password || !confirmPassword) {
      setError("All fields are required!");
      setSuccess("");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setSuccess("");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      setSuccess("");
      return;
    }

    try {
      setError("");
      const response = await Api.post("/Forgot-Password", {
        email,
        password,
      });

      if (response.data?.message !== "Invalid email.") {
        setSuccess(response.data.message);
        setTimeout(() => {
          navigate("/"); // redirect only if success
        }, 1500);
      } else {
        setError(response.data.message); // show error, no redirect
      }
    } catch (err) {
      console.error(err);
      setError("Password reset failed. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="container">
      <h2 className="page-header text-center mt-3">Forgot Password</h2>
      <div className="login-form">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="mb-3">
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            className="form-control"
          />
        </div>

        {/* Password */}
        <div className="mb-3" style={{ position: "relative" }}>
          <label>Password</label>
          <div className="input-group">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="form-control"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "6px",
                cursor: "pointer",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-3" style={{ position: "relative" }}>
          <label>Confirm Password</label>
          <div className="input-group">
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              className="form-control"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "6px",
                cursor: "pointer",
              }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="mb-3 text-center">
          <div className="mb-3">
            Already have an account yet? <Link to="/">Login here</Link>
          </div>
          <button className="btn btn-success" onClick={handleUpdate}>
            Update
          </button>
          <button
            className="btn btn-warning"
            style={{ marginLeft: 10 }}
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Forgot_Password;
