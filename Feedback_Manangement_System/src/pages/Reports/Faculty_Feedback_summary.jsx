import React, { useEffect, useState } from "react";
import Api from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  // Dropdown selections
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedFeedbackType, setSelectedFeedbackType] = useState("");
  const [summary, setSummary] = useState({
    submitted: 0,
    remaining: 0,
    rating: 0,
  });

  const [rows, setRows] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch on mount
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await Api.get("Feedback/FeedbackDashboard-Rating", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data || [];
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to load feedbacks:", error);
    }
  };

  // Dropdown data
  const courses = [...new Set(feedbacks.map((f) => f.courseName))];
  const modules = selectedCourse
    ? [
        ...new Set(
          feedbacks
            .filter((f) => f.courseName === selectedCourse)
            .map((f) => f.moduleName)
        ),
      ]
    : [];
  const faculties = selectedModule
    ? [
        ...new Set(
          feedbacks
            .filter(
              (f) =>
                f.courseName === selectedCourse &&
                f.moduleName === selectedModule
            )
            .map((f) => f.staffName)
        ),
      ]
    : [];
  const feedbackTypes = selectedFaculty
    ? [
        ...new Set(
          feedbacks
            .filter(
              (f) =>
                f.courseName === selectedCourse &&
                f.moduleName === selectedModule &&
                f.staffName === selectedFaculty
            )
            .map((f) => f.feedbackTypeName)
        ),
      ]
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB");
  };

  const getDateRange = () => {
    const filtered = feedbacks.filter(
      (f) =>
        (!selectedCourse || f.courseName === selectedCourse) &&
        (!selectedModule || f.moduleName === selectedModule) &&
        (!selectedFaculty || f.staffName === selectedFaculty) &&
        (!selectedFeedbackType || f.feedbackTypeName === selectedFeedbackType)
    );

    if (filtered.length === 0) return "";

    const startDates = filtered.map((f) => new Date(f.startDate));
    const endDates = filtered.map((f) => new Date(f.endDate));

    const minStart = new Date(Math.min(...startDates));
    const maxEnd = new Date(Math.max(...endDates));

    return `${formatDate(minStart)} to ${formatDate(maxEnd)}`;
  };

  const matchedFeedback = feedbacks.find(
    (f) =>
      f.courseName === selectedCourse &&
      f.moduleName === selectedModule &&
      f.staffName === selectedFaculty &&
      f.feedbackTypeName === selectedFeedbackType
  );

  const feedbackId = matchedFeedback?.feedbackId || 0;
  const feedbackTypeId = matchedFeedback?.feedbackTypeId || 0;
  const feedbackGroupId = matchedFeedback?.feedbackGroupId || 0;

  const getQuestionRating = async () => {
    if (!selectedCourse) return toast.error("Please select a Course");
    if (!selectedModule) return toast.error("Please select a Module");
    if (!selectedFaculty) return toast.error("Please select a Faculty");
    if (!selectedFeedbackType)
      return toast.error("Please select a Feedback Type");
    if (!getDateRange())
      return toast.error("Invalid Date Range for this selection");

    try {
      const response = await Api.post(
        "FeedbackReport/FacultyFeedbackSummary",
        {
          staff_name: selectedFaculty,
          module_name: selectedModule,
          course_name: selectedCourse,
          type_name: selectedFeedbackType,
          date: getDateRange(),
          feedbackTypeId,
          feedbackId,
          feedbackGroupId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data || {};

      setSummary({
        submitted: data.submitted || 0,
        remaining: data.remaining || 0,
        rating: data.rating ? data.rating.toFixed(2) : 0,
      });

      const processedRows = (data.questions || [])
        .filter((q) => q.questionType === "mcq" || q.questionType === "rating")
        .map((item, index) => ({
          id: index + 1,
          question: item.questionText,
          excellent: item.excellent,
          good: item.good,
          satisfactory: item.average,
          unsatisfactory: item.poor,
        }));

      setRows(processedRows);
    } catch (error) {
      console.error("Error fetching summary:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch feedback summary"
      );
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Faculty Feedback Summary", 14, 20);

    doc.setFontSize(12);
    doc.text(`Course: ${selectedCourse}`, 14, 30);
    doc.text(`Module: ${selectedModule}`, 14, 37);
    doc.text(`Faculty: ${selectedFaculty}`, 14, 44);
    doc.text(`Type: ${selectedFeedbackType}`, 14, 51);
    doc.text(`Date: ${getDateRange()}`, 14, 58);
    doc.text(`Submitted: ${summary.submitted}`, 14, 65);
    doc.text(`Remaining: ${summary.remaining}`, 14, 72);
    doc.text(`Rating: ${summary.rating}`, 14, 79);

    autoTable(doc, {
      startY: 90,
      head: [
        [
          "Sr.No",
          "Question",
          "Excellent",
          "Good",
          "Satisfactory",
          "Unsatisfactory",
        ],
      ],
      body: rows.map((r) => [
        r.id,
        r.question,
        r.excellent,
        r.good,
        r.satisfactory,
        r.unsatisfactory,
      ]),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("Feedback_Summary.pdf");
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Faculty Feedback Summary</h2>

      {/* Filter Section */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedModule("");
              setSelectedFaculty("");
              setSelectedFeedbackType("");
            }}
          >
            <option value="">Course</option>
            {courses.map((course, i) => (
              <option key={i} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setSelectedFaculty("");
              setSelectedFeedbackType("");
            }}
            disabled={!selectedCourse}
          >
            <option value="">Module</option>
            {modules.map((mod, i) => (
              <option key={i} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedFaculty}
            onChange={(e) => {
              setSelectedFaculty(e.target.value);
              setSelectedFeedbackType("");
            }}
            disabled={!selectedModule}
          >
            <option value="">Faculty</option>
            {faculties.map((fac, i) => (
              <option key={i} value={fac}>
                {fac}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedFeedbackType}
            onChange={(e) => setSelectedFeedbackType(e.target.value)}
            disabled={!selectedFaculty}
          >
            <option value="">Type</option>
            {feedbackTypes.map((ft, i) => (
              <option key={i} value={ft}>
                {ft}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4 mt-3">
          <input
            type="text"
            value={getDateRange()}
            readOnly
            className="form-control"
            placeholder="Start Date to End Date"
          />
        </div>
      </div>

      <div className="text-center mb-3">
        <button className="btn btn-success" onClick={getQuestionRating}>
          Search
        </button>
      </div>

      {/* Summary & Export */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>Feedback Submitted: {summary.submitted}</div>
        <div>Feedback Remaining: {summary.remaining}</div>
        <div>Rating: {summary.rating}</div>
        <button className="btn btn-primary" onClick={exportPDF}>
          Export
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-success">
            <tr>
              <th>Sr.No</th>
              <th>Question</th>
              <th>Excellent</th>
              <th>Good</th>
              <th>Satisfactory</th>
              <th>Unsatisfactory</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.question}</td>
                  <td>{r.excellent}</td>
                  <td>{r.good}</td>
                  <td>{r.satisfactory}</td>
                  <td>{r.unsatisfactory}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackDashboard;
