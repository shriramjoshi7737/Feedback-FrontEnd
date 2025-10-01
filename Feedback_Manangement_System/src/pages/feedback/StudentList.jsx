import React, { useEffect, useState } from "react";
import Api from "../../services/api";
import { useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function StudentList() {
  const { feedbackGroupId } = useParams();
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const isSubmittedPage = location.pathname.includes("student-list");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = isSubmittedPage
          ? `StudentApi/Submitted/${feedbackGroupId}`
          : `StudentApi/NotSubmitted/${feedbackGroupId}`;

        const res = await Api.get(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setRows(res.data || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        toast.error("Failed to load student data. Please try again.");
      }
      setLoading(false);
    };

    fetchData();
  }, [feedbackGroupId, isSubmittedPage]);

  const exportPDF = () => {
    if (!rows || rows.length === 0) {
      toast.warning("No data available to export!");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = [
      "Sr No",
      "Roll No",
      "First Name",
      "Last Name",
      "Email ID",
      "Group Name",
    ];
    const tableRows = [];

    rows.forEach((row, index) => {
      tableRows.push([
        index + 1,
        row.student_rollno || "",
        row.first_name || "",
        row.last_name || "",
        row.email || "",
        row.groupName || "",
      ]);
    });

    // Title
    doc.setFontSize(14);
    doc.text(
      isSubmittedPage ? "Filled Student List" : "Remaining Student List",
      14,
      15
    );

    // Table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    // Add timestamp in filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = isSubmittedPage
      ? `filled_students_${timestamp}.pdf`
      : `remaining_students_${timestamp}.pdf`;

    doc.save(filename);
    toast.success("PDF exported successfully!");
  };

  // Pagination helpers
  const totalPages = Math.ceil(rows.length / pageSize);
  const paginatedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container my-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-center mb-4">
        {isSubmittedPage ? "Filled Student List" : "Remaining Student List"}
      </h2>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={exportPDF}>
          Export to PDF
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Roll No</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email ID</th>
              <th>Group Name</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.student_rollno}</td>
                  <td>{row.first_name}</td>
                  <td>{row.last_name}</td>
                  <td>{row.email}</td>
                  <td>{row.groupName || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Page {page} of {totalPages || 1}
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>

          <select
            className="form-select form-select-sm"
            style={{ width: "80px" }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
