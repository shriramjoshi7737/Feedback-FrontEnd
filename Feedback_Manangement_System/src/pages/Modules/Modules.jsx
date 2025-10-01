import React, { useState, useEffect } from "react";
//import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Api from "../../services/api";

function AddModule() {
  const [moduleName, setModuleName] = useState("");
  const [duration, setDuration] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const modulesPerPage = 5;

  const token = localStorage.getItem("token");

  useEffect(() => {
    Api.get("GetAllCourse", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setCourses(res.data))
      .catch((err) => {
        console.error("Error fetching courses:", err);
        toast.error("Failed to load courses");
      });
  }, [token]);

  const fetchModules = () => {
    Api.get("Modules", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setModules(res.data))
      .catch((err) => {
        console.error("Error fetching modules:", err);
        toast.error("Failed to load modules");
      });
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newModule = {
      module_name: moduleName.trim(),
      duration: parseInt(duration, 10),
      course_id: courseId ? parseInt(courseId, 10) : null,
    };

    try {
      await Api.post("Modules", newModule, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("✅ Module added successfully!");
      setModuleName("");
      setDuration("");
      setCourseId("");
      fetchModules();
    } catch (error) {
      console.error(
        "Error adding module:",
        error.response?.data || error.message
      );
      toast.error("Failed to add module");
    }
  };

  const indexOfLastModule = currentPage * modulesPerPage;
  const indexOfFirstModule = indexOfLastModule - modulesPerPage;
  const currentModules = modules.slice(indexOfFirstModule, indexOfLastModule);

  const totalPages = Math.ceil(modules.length / modulesPerPage);

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-center mb-4">Add Module</h2>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm mb-4">
        <div className="mb-3">
          <label className="form-label">Module Name</label>
          <input
            type="text"
            className="form-control"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Duration (hours)</label>
          <input
            type="number"
            className="form-control"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min={1}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Select Course</label>
          <select
            className="form-select"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          >
            <option value="">-- Select Course --</option>
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Add Module
        </button>
      </form>

      {/* Module List */}
      <h3 className="text-center mb-3">Module List</h3>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Module Name</th>
            <th>Duration</th>
            <th>Course</th>
          </tr>
        </thead>
        <tbody>
          {currentModules.length > 0 ? (
            currentModules.map((m, i) => (
              <tr key={m.module_id}>
                <td>{indexOfFirstModule + i + 1}</td>
                <td>{m.module_name}</td>
                <td>{m.duration} hours</td>
                <td>
                  {courses.find((c) => c.course_id === m.course_id)
                    ?.course_name || "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No modules found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default AddModule;
