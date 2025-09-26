import React, { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import "./Feedbackdashbaord.css";
import { getCourses } from "../../services/course";
import Api from "../../services/api";

function FeedbackDashboard() {
  const [courses, setCourses] = useState([]);
  const [feedbackTypes, setFeedbackTypes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedFeedbackType, setSelectedFeedbackType] = useState("");
  const [rows, setRows] = useState([]);
  // const token = localStorage.getItem("token");

  const token = localStorage.getItem("token");
  // Columns
  const columns = [
    { field: "date", headerName: "Date", flex: 1 },
    { field: "course", headerName: "Course", flex: 1 },
    { field: "feedbacktype", headerName: "Feedback Type", flex: 1 },
    { field: "group", headerName: "Group", flex: 1 },
    { field: "sessions", headerName: "Sessions", flex: 1 },
    { field: "rating", headerName: "Rating", flex: 1 },
  ];

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
      <h2 className="page-header text-center mt-3">Feedback Dashboard</h2>
      <Box p={3} className="mb-5">
        <Box display="flex" justifyContent="flex-start" gap={2} mb={2}>
          {/* Course Dropdown */}
          <select
            name="courseId"
            className="form-select form-select-lg"
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
            className="form-select form-select-lg"
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
        </Box>

        <hr className="mb-4" />

        <div style={{ height: 400, background: "#fff" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
            disableSelectionOnClick
            autoHeight={false}
          />
        </div>
      </Box>
    </div>
  );
}

export default FeedbackDashboard;
