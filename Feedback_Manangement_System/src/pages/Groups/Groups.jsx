import React, { useState, useEffect } from "react";
import Api from "../../services/api"; // your axios instance
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CourseGroupManager() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [existingGroups, setExistingGroups] = useState([]); // groups fetched from backend
  const [newGroups, setNewGroups] = useState([]); // groups added by user
  const token = localStorage.getItem("token");

  // Fetch courses on load
  useEffect(() => {
    Api.get("GetAllCourse", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setCourses(res.data))
      .catch((err) => {
        console.error("Error fetching courses", err);
        toast.error("Failed to load courses");
      });
  }, []);

  // Fetch groups for selected course
  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setExistingGroups([]);
    setNewGroups([]);

    if (!courseId) return;

    try {
      const res = await Api.get(`Groups/ByCourse/${courseId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.length > 0) {
        setExistingGroups(res.data.map((g) => g.group_name || g));
      } else {
        setExistingGroups([]);
      }
    } catch (error) {
      console.error("Error fetching course groups", error);
      toast.error("Failed to fetch course groups");
    }
  };

  // Add new group input
  const handleAddGroup = () => {
    setNewGroups([...newGroups, ""]);
  };

  // Handle new group name change
  const handleNewGroupChange = (index, value) => {
    const updated = [...newGroups];
    updated[index] = value;
    setNewGroups(updated);
  };

  // Remove new group input
  const handleDeleteNewGroup = (index) => {
    const updated = [...newGroups];
    updated.splice(index, 1);
    setNewGroups(updated);
  };

  // Submit only new groups
  const handleSubmit = async () => {
    if (!selectedCourse || newGroups.length === 0) {
      toast.error("Add at least one new group before saving.");
      return;
    }

    const payload = {
      course_id: Number(selectedCourse),
      groups: newGroups.filter((g) => g.trim() !== ""), // only new groups
    };

    try {
      await Api.post("Groups/addGroups", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("New groups saved successfully!");
      setNewGroups([]); // clear new group inputs after saving
      handleCourseChange({ target: { value: selectedCourse } }); // refresh existing groups
    } catch (error) {
      console.error("Error saving new groups", error);
      toast.error("Failed to save groups.");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h3>Course Groups Management</h3>

      {/* Course Dropdown */}
      <div className="form-group mt-3">
        <label>Select Course:</label>
        <select
          className="form-control"
          value={selectedCourse}
          onChange={handleCourseChange}
        >
          <option value="">-- Select --</option>
          {courses.map((c) => (
            <option key={c.course_id} value={c.course_id}>
              {c.course_name}
            </option>
          ))}
        </select>
      </div>

      {/* Existing Groups - Read Only */}
      {existingGroups.length > 0 && (
        <div className="mt-3">
          <h5>Existing Groups:</h5>
          <ul className="list-group">
            {existingGroups.map((g, idx) => (
              <li key={idx} className="list-group-item">
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add New Group Button */}
      {selectedCourse && (
        <button className="btn btn-primary mt-3" onClick={handleAddGroup}>
          Add Group
        </button>
      )}

      {/* New Group Inputs */}
      {newGroups.map((g, idx) => (
        <div key={idx} className="d-flex align-items-center mt-2">
          <input
            type="text"
            className="form-control"
            placeholder={`New Group ${idx + 1}`}
            value={g}
            onChange={(e) => handleNewGroupChange(idx, e.target.value)}
          />
          <button
            className="btn btn-danger ms-2"
            onClick={() => handleDeleteNewGroup(idx)}
          >
            Delete
          </button>
        </div>
      ))}

      {/* Submit */}
      {newGroups.length > 0 && (
        <button className="btn btn-success mt-3" onClick={handleSubmit}>
          Save New Groups
        </button>
      )}
    </div>
  );
}

export default CourseGroupManager;
