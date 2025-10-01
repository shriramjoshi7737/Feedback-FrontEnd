import React, { useState, useEffect } from "react";
//import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Api from "../../services/api";

function AddCourse() {
  const [courseName, setCourseName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5;

  const token = localStorage.getItem("token");

  const fetchCourses = () => {
    Api.get("GetAllCourse", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setCourses(res.data);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        toast.error("❌ Failed to load courses.");
      });
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const newCourse = {
      course_name: courseName.trim(),
      start_date: startDate,
      end_date: endDate,
      duration: parseInt(duration, 10),
      course_type: courseType.trim(),
    };

    try {
      await Api.post("AddCourse", newCourse, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Course added successfully!");

      setCourseName("");
      setStartDate("");
      setEndDate("");
      setDuration("");
      setCourseType("");
      fetchCourses();
    } catch (error) {
      console.error(
        "Error adding course:",
        error.response?.data || error.message
      );

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("⚠️ Validation errors occurred.");
      } else {
        setErrors(["Something went wrong while adding the course."]);
        toast.error("❌ Failed to add course.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  const totalPages = Math.ceil(courses.length / coursesPerPage);

  return (
    <div className="container mt-4">
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <h2 className="text-center">Add Course</h2>

      {errors.length > 0 && (
        <div className="alert alert-danger">
          <ul className="mb-0">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm mb-4">
        <div className="mb-3">
          <label className="form-label">Course Name</label>
          <input
            type="text"
            className="form-control"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Duration (in days)</label>
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
          <label className="form-label">Course Type</label>
          <input
            type="text"
            className="form-control"
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Course"}
        </button>
      </form>

      {/* Course List */}
      <h3 className="text-center mb-3">Course List</h3>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Course Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Duration</th>
            <th>Course Type</th>
          </tr>
        </thead>
        <tbody>
          {currentCourses.length > 0 ? (
            currentCourses.map((c, index) => (
              <tr key={c.course_id}>
                <td>{indexOfFirstCourse + index + 1}</td>
                <td>{c.course_name}</td>
                <td>{new Date(c.start_date).toLocaleDateString()}</td>
                <td>{new Date(c.end_date).toLocaleDateString()}</td>
                <td>{c.duration} days</td>
                <td>{c.course_type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No courses found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
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

export default AddCourse;
