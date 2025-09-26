import React, { useState, useEffect } from "react";
import Api from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function StaffForm() {
  const [staffroles, setStaffroles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    staffrole_id: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    profileImage: null,
  });

  // Fetch staff roles on load
  useEffect(() => {
    Api.get("staff/GetStaffRoles", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setStaffroles(res.data))
      .catch((err) => {
        console.error("Error fetching staff roles:", err);
        toast.error("Failed to load staff roles");
      });
  }, [token]);

  // Fetch staff list
  const fetchStaffList = async () => {
    try {
      const res = await Api.get("staff/getAllStaff", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setStaffList(res.data);
    } catch (err) {
      console.error("Error fetching staff list:", err);
      toast.error("Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      setFormData({ ...formData, profileImage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { staffrole_id, first_name, last_name, email, password } = formData;
    if (!staffrole_id || !first_name || !last_name || !email || !password) {
      toast.error("Please fill all required fields.");
      return;
    }

    const data = new FormData();
    data.append("staffrole_id", staffrole_id);
    data.append("first_name", first_name);
    data.append("last_name", last_name);
    data.append("email", email);
    data.append("password", password);
    if (formData.profileImage) data.append("profileImage", formData.profileImage);

    try {
      const res = await Api.post("staff/addStaff", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("✅ Staff created successfully!");
      console.log(res.data);

      // Reset form
      setFormData({
        staffrole_id: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        profileImage: null,
      });

      // Refresh staff list
      fetchStaffList();
    } catch (err) {
      console.error("Error creating staff:", err);
      toast.error("Failed to create staff");
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="card shadow-lg p-4 mb-5">
        <h3 className="text-center mb-4">👨‍🏫 Create Staff</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Staff Role */}
          <div className="mb-3">
            <label className="form-label">Staff Role *</label>
            <select
              className="form-select"
              name="staffrole_id"
              value={formData.staffrole_id}
              onChange={handleChange}
            >
              <option value="">-- Select Role --</option>
              {staffroles.map((role) => (
                <option key={role.staffrole_id} value={role.staffrole_id}>
                  {role.staffrole_name}
                </option>
              ))}
            </select>
          </div>

          {/* First & Last Name */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              autoComplete="new-email"
            />
          </div>

          {/* Password */}
          <div className="mb-3 position-relative">
            <label className="form-label">Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="new-password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "38px",
                cursor: "pointer",
                color: "#333",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Profile Image */}
          <div className="mb-3">
            <label className="form-label">Profile Image (optional)</label>
            <input
              type="file"
              className="form-control"
              name="profileImage"
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <div className="d-grid">
            <button type="submit" className="btn btn-success">
              Create Staff
            </button>
          </div>
        </form>
      </div>

      {/* Staff List */}
      <div className="card shadow-lg p-4">
        <h3 className="text-center mb-4">👥 Staff List</h3>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length > 0 ? (
              staffList.map((staff, index) => (
                <tr key={staff.staff_id}>
                  <td>{staff.staff_id}</td>
                  <td>{staff.first_name}</td>
                  <td>{staff.last_name}</td>
                  <td>{staff.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No staff found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffForm;
