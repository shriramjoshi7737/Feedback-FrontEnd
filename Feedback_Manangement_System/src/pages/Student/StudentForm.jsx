import { useState, useEffect } from "react";
import Api from "../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function StudentForm() {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate(); 
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    groupId: "",
    courseId: "",
    profileImage: null,
  });

  // Reset form when page loads
  useEffect(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      groupId: "",
      courseId: "",
      profileImage: null,
    });
  }, []);

  // Fetch courses
  useEffect(() => {
    Api.get("GetAllCourse")
      .then((res) => setCourses(res.data))
      .catch((err) => {
        console.error("Error fetching courses:", err);
        toast.error("Failed to fetch courses");
      });
  }, []);

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setFormData({ ...formData, courseId, groupId: "" });

    if (courseId) {
      try {
        const res = await Api.get(`Groups/ByCourse/${courseId}`);
        setGroups(res.data);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setGroups([]);
        toast.error("Failed to fetch groups");
      }
    } else {
      setGroups([]);
    }
  };

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

    const { firstName, lastName, email, password, courseId } = formData;
    if (!firstName || !lastName || !email || !password || !courseId) {
      toast.warning("Please fill all required fields");
      return;
    }

    const data = new FormData();
    data.append("FirstName", formData.firstName);
    data.append("LastName", formData.lastName);
    data.append("Email", formData.email);
    data.append("Password", formData.password);
    data.append("CourseId", formData.courseId);
    if (formData.groupId) data.append("GroupId", formData.groupId);
    if (formData.profileImage) data.append("profileImage", formData.profileImage);

    try {
      const res = await Api.post("StudentApi/UploadProfile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Student registered successfully!");
      console.log(res.data);

      navigate("/login");
    } catch (err) {
      console.error("Error creating student:", err);
      toast.error("Error creating student");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h3 className="text-center mb-4">📝 Register Student</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="row">
            {/* First Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                autoComplete="off"
              />
            </div>

            {/* Last Name */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                autoComplete="off"
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
              autoComplete="off"
            />
          </div>

          {/* Password with show/hide */}
          <div className="mb-3">
            <label className="form-label">Password *</label>
            <div className="input-group">
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
                  top: "5px",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Course */}
          <div className="mb-3">
            <label className="form-label">Course *</label>
            <select
              className="form-select"
              name="courseId"
              value={formData.courseId}
              onChange={handleCourseChange}
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </div>

          {/* Group */}
          <div className="mb-3">
            <label className="form-label">Group (optional)</label>
            <select
              className="form-select"
              name="groupId"
              value={formData.groupId}
              onChange={handleChange}
              disabled={!groups.length}
            >
              <option value="">-- Select Group --</option>
              {groups.map((g) => (
                <option key={g.group_id} value={g.group_id}>
                  {g.group_name}
                </option>
              ))}
            </select>
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

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button type="submit" className="btn btn-success">
              Register
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentForm;
