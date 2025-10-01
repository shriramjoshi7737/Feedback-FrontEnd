import React, { useEffect, useState } from "react";
import Api from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

export default function CourseWiseReport() {
  const [reportData, setReportData] = useState([]);
  const [feedbackTypes, setFeedbackTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [midType, setMidType] = useState("");
  const [endType, setEndType] = useState("");
  const [infraType, setInfraType] = useState("");

  const token = localStorage.getItem("token");

  // Fetch coursewise report
  useEffect(() => {
    Api.get("Feedback/CourseWiseReportWithRating", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setReportData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching coursewise report:", err);
        setLoading(false);
      });
  }, [token]);

  // Fetch feedback types for dropdowns
  useEffect(() => {
    Api.get("FeedbackType/GetFeedbackType", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setFeedbackTypes(res.data);
      })
      .catch((err) => {
        console.error("Error fetching feedback types:", err);
      });
  }, [token]);

  // Fetch all courses
  useEffect(() => {
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
      });
  }, [token]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // ---- Dropdown Data Split ----
  const midTypes = feedbackTypes.filter((t) =>
    t.feedback_type_title.toLowerCase().includes("mid")
  );
  const endTypes = feedbackTypes.filter((t) =>
    t.feedback_type_title.toLowerCase().includes("end")
  );
  const infraTypes = feedbackTypes.filter((t) =>
    t.feedback_type_title.toLowerCase().includes("infra")
  );

  // ---- Filtering Logic ----
  let filteredModules = [];
  if (selectedCourse) {
    const course = reportData.find((c) => c.courseName === selectedCourse);

    if (course) {
      filteredModules = course.modules.map((m) => {
        // Only check if dropdown is selected, else "-"
        const mid = midType
          ? m.feedbackTypes.find((ft) => ft.feedbackTypeTitle === midType)
              ?.averageRating
          : "-";

        const end = endType
          ? m.feedbackTypes.find((ft) => ft.feedbackTypeTitle === endType)
              ?.averageRating
          : "-";

        const infra = infraType
          ? m.feedbackTypes.find((ft) => ft.feedbackTypeTitle === infraType)
              ?.averageRating
          : "-";

        return {
          moduleName: m.moduleName,
          midModule: mid || "-",
          moduleEnd: end || "-",
          infrastructure: infra || "-",
        };
      });
    }
  }

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">Coursewise Feedback Report</h3>

      {/* Filters */}
      <div className="row mb-3">
        {/* Mid Module */}
        <div className="col-md-3 mb-2">
          <label className="form-label fw-bold">Mid Module</label>
          <select
            className="form-select"
            value={midType}
            onChange={(e) => setMidType(e.target.value)}
          >
            <option value="">Select Mid</option>
            {midTypes.map((t) => (
              <option key={t.feedback_type_id} value={t.feedback_type_title}>
                {t.feedback_type_title}
              </option>
            ))}
          </select>
        </div>

        {/* Module End */}
        <div className="col-md-3 mb-2">
          <label className="form-label fw-bold">Module End</label>
          <select
            className="form-select"
            value={endType}
            onChange={(e) => setEndType(e.target.value)}
          >
            <option value="">Select End</option>
            {endTypes.map((t) => (
              <option key={t.feedback_type_id} value={t.feedback_type_title}>
                {t.feedback_type_title}
              </option>
            ))}
          </select>
        </div>

        {/* Infra End */}
        <div className="col-md-3 mb-2">
          <label className="form-label fw-bold">Infra End</label>
          <select
            className="form-select"
            value={infraType}
            onChange={(e) => setInfraType(e.target.value)}
          >
            <option value="">Select Infra</option>
            {infraTypes.map((t) => (
              <option key={t.feedback_type_id} value={t.feedback_type_title}>
                {t.feedback_type_title}
              </option>
            ))}
          </select>
        </div>

        {/* Course */}
        <div className="col-md-3 mb-2">
          <label className="form-label fw-bold">Course</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_name}>
                {c.course_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-primary">
            <tr>
              <th>Sr.No</th>
              <th>Module Name</th>
              <th>Mid Module</th>
              <th>End Module</th>
              <th>Infrastructure</th>
            </tr>
          </thead>
          <tbody>
            {selectedCourse && filteredModules.length > 0 ? (
              filteredModules.map((m, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{m.moduleName}</td>
                  <td>{m.midModule}</td>
                  <td>{m.moduleEnd}</td>
                  <td>{m.infrastructure}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Please select a course to view data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
