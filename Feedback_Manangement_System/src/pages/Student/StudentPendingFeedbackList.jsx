import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../services/api";

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center my-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const ErrorAlert = ({ error }) => (
  <div className="d-flex justify-content-center mt-4 mx-3">
    <div className="alert alert-danger w-100" role="alert">
      {error}
    </div>
  </div>
);

function StudentPendingFeedbackList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 5;
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: pageSize,
  });
  const [totalRowCount, setTotalRowCount] = useState(0);

  const token = localStorage.getItem("token");

  const tableHeaders = [
    { field: "feedbackGroupId", name: "ID" },
    { field: "feedbackTypeName", name: "Type" },
    { field: "courseName", name: "Course" },
    { field: "moduleName", name: "Module" },
    { field: "staffName", name: "Faculty" },
    { field: "session", name: "Session" },
    { field: "actions", name: "Action" },
  ];

  const handleOpenFill = (row) => {
    navigate("/app/student-feedback-form", { state: { feedbackData: row } });
  };

  const totalPages = Math.ceil(totalRowCount / paginationModel.pageSize);
  const currentPage = paginationModel.page + 1;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPaginationModel((prev) => ({ ...prev, page: newPage - 1 }));
    }
  };

  useEffect(() => {
    const fetchPendingFeedbacks = async () => {
      setLoading(true);
      setError(null);

      let studentData = null;
      try {
        const loginStudent = localStorage.getItem("user");
        if (loginStudent) {
          studentData = JSON.parse(loginStudent);
        }
      } catch (parseError) {
        console.error(
          "Failed to parse user data from localStorage:",
          parseError
        );
        setError(
          "An error occurred with user data. Please try logging in again."
        );
        setLoading(false);
        return;
      }

      const studentRollNo = studentData ? studentData.id : null;
      if (!studentRollNo) {
        setError("Could not find student ID. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await Api.get(
          `Feedback/GetScheduledFeedbackByStudent/${studentRollNo}?page=${
            paginationModel.page + 1
          }&pageSize=${paginationModel.pageSize}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.data;
        const scheduledData = data.data || [];

        const formattedData = scheduledData.map((item) => ({
          ...item,
          id: item.feedbackGroupId,
        }));

        setRows(formattedData);
        setTotalRowCount(data.totalCount);
      } catch (e) {
        console.error("Failed to fetch pending feedbacks:", e);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingFeedbacks();
  }, [paginationModel.page, token]);

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="container">
      <h2 className="text-center mt-3">Pending Feedback's</h2>
      <div className="row justify-content-center mt-4">
        <div className="col-12">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="table-responsive">
              {rows.length === 0 && !loading && (
                <div className="alert alert-info text-center" role="alert">
                  No pending feedback schedules found.
                </div>
              )}

              {rows.length > 0 && (
                <table className="table table-striped table-hover align-middle shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      {tableHeaders.map((header) => (
                        <th
                          key={header.field}
                          scope="col"
                          className={
                            header.field === "feedbackGroupId" ||
                            header.field === "courseName" ||
                            header.field === "moduleName" ||
                            header.field === "session"
                              ? "d-none d-md-table-cell"
                              : ""
                          }
                        >
                          {header.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="d-none d-md-table-cell">
                          {paginationModel.page * pageSize + index + 1}
                        </td>

                        <td>
                          <div className="fw-bold">{row.feedbackTypeName}</div>
                          <div className="d-md-none text-muted small mt-1">
                            <p className="mb-0">
                              <strong>Course:</strong> {row.courseName}
                            </p>
                            <p className="mb-0">
                              <strong>Module:</strong> {row.moduleName}
                            </p>
                            <p className="mb-0">
                              <strong>Session:</strong> {row.session}
                            </p>
                            <p className="mb-0">
                              <strong>Faculty:</strong> {row.staffName}
                            </p>
                          </div>
                        </td>

                        <td className="d-none d-md-table-cell">
                          {row.courseName}
                        </td>

                        <td className="d-none d-md-table-cell">
                          {row.moduleName}
                        </td>

                        <td>{row.staffName}</td>

                        <td className="d-none d-md-table-cell">
                          {row.session}
                        </td>

                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleOpenFill(row)}
                          >
                            Open & Fill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {totalRowCount > 0 && (
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 p-3 bg-light rounded shadow-sm">
                  <small className="text-muted mb-2 mb-md-0">
                    Showing{" "}
                    {Math.min(totalRowCount, (currentPage - 1) * pageSize + 1)}{" "}
                    to {Math.min(totalRowCount, currentPage * pageSize)} of{" "}
                    {totalRowCount} entries
                  </small>

                  <nav aria-label="Pagination">
                    <ul className="pagination pagination-sm mb-0">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      <li className="page-item active">
                        <button className="page-link" disabled>
                          {currentPage}
                        </button>
                      </li>
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentPendingFeedbackList;
