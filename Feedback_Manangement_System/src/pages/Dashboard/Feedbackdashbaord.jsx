import React, { useEffect, useMemo, useState } from "react";
import "./Feedbackdashbaord.css";
import { getCourses } from "../../services/course";
import Api from "../../services/api";

function FeedbackDashboard() {
  const [courses, setCourses] = useState([]);
  const [feedbackTypes, setFeedbackTypes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedFeedbackType, setSelectedFeedbackType] = useState("");
  const [rows, setRows] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch on mount
  useEffect(() => {
    fetchCourses();
    fetchFeedbackTypes();
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await Api.get("FeedbackReport/course-feedback-report", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const mapped = response.data.map((item, index) => {
        const d = item.date ? new Date(item.date) : null;
        const formattedDate = d
          ? `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${d.getFullYear()}`
          : "";

        return {
          id: index,
          date: formattedDate,
          course: item.courseName,
          feedbacktype: item.feedbackTypeName,
          group: item.groups?.toLowerCase() === "single" ? "Theory" : "Lab",
          sessions: item.sessions ?? 0,
          rating: item.rating ? Number(item.rating).toFixed(2) : "",
        };
      });
      setRows(mapped);
    } catch (error) {
      console.error("Failed to load feedbacks:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
    }
  };

  const fetchFeedbackTypes = async () => {
    try {
      const response = await Api.get("FeedbackType/GetFeedbackType", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbackTypes(response.data || []);
    } catch (error) {
      console.error("Failed to load feedback types:", error);
    }
  };

  // ---------- Filtering ----------
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const courseMatch =
        !selectedCourse ||
        row.course.toLowerCase() ===
          courses
            .find((c) => String(c.course_id) === String(selectedCourse))
            ?.course_name.toLowerCase();

      const typeMatch =
        !selectedFeedbackType ||
        row.feedbacktype.toLowerCase() ===
          feedbackTypes
            .find(
              (ft) =>
                String(ft.feedback_type_id) === String(selectedFeedbackType)
            )
            ?.feedback_type_title.toLowerCase();

      return courseMatch && typeMatch;
    });
  }, [rows, selectedCourse, selectedFeedbackType, courses, feedbackTypes]);

  return (
    <div className="container">
      <h2 className="text-center mt-3">Feedback Dashboard</h2>

      {/* Filters */}
      <div className="d-flex gap-3 mt-4 mb-3">
        {/* Course Dropdown */}
        <select
          name="courseId"
          className="form-select"
          style={{ minWidth: "200px" }}
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.course_id} value={String(course.course_id)}>
              {course.course_name}
            </option>
          ))}
        </select>

        {/* Feedback Type Dropdown */}
        <select
          className="form-select"
          style={{ minWidth: "250px" }}
          value={selectedFeedbackType}
          onChange={(e) => setSelectedFeedbackType(e.target.value)}
        >
          <option value="">Select Feedback Type</option>
          {feedbackTypes.map((ft) => (
            <option
              key={ft.feedback_type_id}
              value={String(ft.feedback_type_id)}
            >
              {ft.feedback_type_title}
            </option>
          ))}
        </select>
      </div>

      <hr />

      {/* Bootstrap Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Feedback Type</th>
              <th>Group</th>
              <th>Sessions</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No records found
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {row.course}
                  </td>
                  <td>{row.feedbacktype}</td>
                  <td>{row.group}</td>
                  <td>{row.sessions}</td>
                  <td>{row.rating}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeedbackDashboard;
