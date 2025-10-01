import React from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Api from "../../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ScheduleFeedbackList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const [pagination, setPagination] = React.useState({
    page: 0,
    pageSize: 5,
  });

  const lastTotalCountRef = React.useRef(null);

  // fetch function
  const fetchFeedbacks = async ({ page, pageSize }) => {
    const res = await Api.get(
      `Feedback/GetFeedbackPaged?pageNumber=${page + 1}&pageSize=${pageSize}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data, totalCount } = res.data;

    const enriched = await Promise.all(
      (data || []).map(async (f) => {
        try {
          const summary = await Api.get(
            `StudentApi/FeedbackSubmit/${f.feedbackGroupId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return {
            ...f,
            filledby: summary.data.submittedCount,
            remaining: summary.data.remainingCount,
          };
        } catch {
          return { ...f, filledby: 0, remaining: 0 };
        }
      })
    );

    return { rows: enriched, totalCount };
  };

  const { data, isFetching } = useQuery({
    queryKey: ["feedbacks", pagination.page, pagination.pageSize],
    queryFn: () =>
      fetchFeedbacks({ page: pagination.page, pageSize: pagination.pageSize }),
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  React.useEffect(() => {
    if (data?.totalCount != null) lastTotalCountRef.current = data.totalCount;
  }, [data]);

  const rowCount = data?.totalCount ?? lastTotalCountRef.current ?? 0;
  const rows = data?.rows ?? [];

  // delete record
  const handleDelete = (feedbackGroupId) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this record?</p>
        <div className="d-flex gap-2 mt-2">
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              try {
                await Api.delete(
                  `Feedback/DeleteFeedbackGroup/${feedbackGroupId}`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
                toast.dismiss();
                toast.success("Record deleted successfully!");
              } catch (error) {
                const message =
                  error?.response?.data?.message ||
                  error?.message ||
                  "Failed to delete record.";
                toast.dismiss();
                toast.error(message);
              }
            }}
          >
            Yes
          </Button>
          <Button variant="secondary" size="sm" onClick={() => toast.dismiss()}>
            No
          </Button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false }
    );
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-center mb-3">Schedule Feedback List</h2>

      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="primary"
          onClick={() => navigate("/app/schedule-feedback-form")}
        >
          Schedule Feedback
        </Button>
      </div>

      <div className="table-responsive">
        <Table bordered hover striped className="align-middle">
          <thead className="table-dark">
            <tr>
              {/* <th>ID</th> */}
              <th>Course</th>
              <th>Module</th>
              <th>Type</th>
              <th>Staff</th>
              <th>Group</th>
              <th>Session</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Filled By</th>
              <th>Remaining</th>
              {/* <th>Status</th> */}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan="13" className="text-center">
                  <Spinner animation="border" size="sm" /> Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="13" className="text-center">
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.feedbackGroupId ?? row.Id ?? row.feedbackId}>
                  {/* <td>{row.feedbackGroupId}</td> */}
                  <td
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {row.courseName}
                  </td>
                  <td
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {row.moduleName}
                  </td>
                  <td>{row.feedbackTypeName}</td>
                  <td>{row.staffName}</td>
                  <td>{row.groupName?.trim() || "-"}</td>
                  <td>{row.session}</td>
                  <td>{formatDate(row.startDate)}</td>
                  <td>{formatDate(row.endDate)}</td>
                  <td>
                    <a href={`student-list/${row.feedbackGroupId}`}>
                      {row.filledby}
                    </a>
                  </td>
                  <td>
                    <a href={`remaining/${row.feedbackGroupId}`}>
                      {row.remaining}
                    </a>
                  </td>
                  {/* <td>{row.status}</td> */}
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          const start = new Date(row.startDate);
                          const now = new Date();
                          if (start <= now) {
                            toast.error(
                              "You cannot update feedback after start date."
                            );
                            return;
                          }
                          navigate(
                            `/app/update-feedback-form/${row.feedbackId}`,
                            {
                              state: { feedbackId: row.feedbackId },
                            }
                          );
                        }}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(row.feedbackGroupId)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button
          disabled={pagination.page === 0}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
          }
        >
          Previous
        </Button>
        <span>
          Page {pagination.page + 1} of{" "}
          {Math.ceil(rowCount / pagination.pageSize) || 1}
        </span>
        <Button
          disabled={(pagination.page + 1) * pagination.pageSize >= rowCount}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}
