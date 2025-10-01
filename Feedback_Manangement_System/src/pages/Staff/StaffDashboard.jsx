import React, { useEffect, useState } from "react";
import Api from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "react-bootstrap";

export default function StaffDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDownloadFullPdf = () => {
    const doc = new jsPDF();
    doc.text("Staff Feedback Report", 14, 15);
    const tableColumn = [
      "#",
      "Course",
      "Date",
      "Module",
      "Type",
      "Session",
      "Rating",
    ];
    const tableRows = rows.map((row, index) => [
      index + 1,
      row.course,
      row.date,
      row.module,
      row.type,
      row.session,
      row.rating ?? "N/A",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("feedback_report_full.pdf");
  };

  const handleDownloadPdf = (row) => {
    const doc = new jsPDF();
    doc.text("Staff Feedback Report", 14, 15);
    const tableColumn = [
      "#",
      "Course",
      "Date",
      "Module",
      "Type",
      "Session",
      "Rating",
    ];
    const tableRows = [
      [
        1,
        row.course,
        row.date,
        row.module,
        row.type,
        row.session,
        row.rating ?? "N/A",
      ],
    ];
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save(`feedback_report_${row.id}.pdf`);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !user.id) return;

    const fetchScheduledFeedback = async () => {
      try {
        const response = await Api.get(`/staff/${user.id}/scheduledFeedback`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const grouped = response.data.reduce((acc, f) => {
          const key = `${f.moduleName}_${f.feedback_type_id}`;
          if (!acc[key]) {
            acc[key] = {
              course: f.courseName,
              date: f.startDate || f.createdAt || null,
              module: f.moduleName,
              type: f.feedbackTypeName,
              session: f.session,
              feedbackTypeId: f.feedback_type_id,
              ratings: [f.rating ?? 0],
            };
          } else {
            acc[key].ratings.push(f.rating ?? 0);
          }
          return acc;
        }, {});

        const feedbackArray = Object.values(grouped).map((item, index) => ({
          id: index + 1,
          course: item.course,
          date: item.date ? new Date(item.date).toLocaleDateString() : "N/A",
          module: item.module,
          type: item.type,
          session: item.session,
          feedbackTypeId: item.feedbackTypeId,
          rating: item.ratings.length
            ? Math.round(
                (item.ratings.reduce((a, b) => a + b, 0) /
                  item.ratings.length) *
                  100
              ) / 100
            : "N/A",
        }));

        setRows(feedbackArray);
      } catch (error) {
        console.error("Error fetching scheduled feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledFeedback();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-2">My Feedbacks</h2>
      <p className="text-center text-muted mb-4">
        Feedbacks you have received till today
      </p>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={handleDownloadFullPdf}>
          Download PDF
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Course</th>
                <th>Date</th>
                <th>Module</th>
                <th>Type</th>
                <th>Session</th>
                <th>Rating</th>
                <th>PDF Report</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.course}</td>
                    <td>{row.date}</td>
                    <td>{row.module}</td>
                    <td>{row.type}</td>
                    <td>{row.session}</td>
                    <td>{row.rating ?? "N/A"}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDownloadPdf(row)}
                      >
                        <i
                          className="bi bi-file-earmark-pdf-fill"
                          style={{ fontSize: "18px" }}
                        ></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No feedbacks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
