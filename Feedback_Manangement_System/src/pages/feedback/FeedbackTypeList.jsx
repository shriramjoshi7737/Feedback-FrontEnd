import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Api from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FeedbackTypeList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch data
  const fetchFeedbackTypes = () => {
    Api.get("FeedbackType/GetFeedbackType", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        const mappedRows = res.data.map((item) => ({
          feedback_type_id: item.feedback_type_id,
          feedback_type_title: item.feedback_type_title,
          feedback_type_description: item.feedback_type_description,
          group: item.group,
          is_staff: item.is_staff,
          is_session: item.is_session,
          behaviour: item.behaviour,
        }));
        setRows(mappedRows);
      })
      .catch((err) => {
        console.error("Error fetching feedback types:", err);
        toast.error("Failed to fetch feedback types.");
      });
  };

  useEffect(() => {
    fetchFeedbackTypes();
  }, []);

  // Add button
  const handleAddClick = () => {
    navigate("/app/feedback-type-form");
  };

  // Edit
  const handleEdit = async (id) => {
    try {
      await Api.get(`FeedbackType/CheckEditable/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      navigate(`/app/feedback-type-form/${id}`);
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Unable to edit this feedback type.");
      }
    }
  };

  const confirmDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this record?</p>
        <div className="d-flex justify-content-center gap-2 mt-2">
          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              handleDelete(id);
              toast.dismiss();
            }}
          >
            Yes
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await Api.delete(`FeedbackType/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Feedback type deleted successfully!");
      fetchFeedbackTypes();
    } catch (err) {
      console.error("Error deleting feedback type:", err);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to delete feedback type. Please try again.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Feedback Type List</h2>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-primary" onClick={handleAddClick}>
          <i className="bi bi-plus-circle"></i> Add Feedback Type
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Group</th>
              <th>Staff</th>
              <th>Session</th>
              <th>Behaviour</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={row.feedback_type_id}>
                  <td>{index + 1}</td>
                  <td>{row.feedback_type_title}</td>
                  <td>{row.feedback_type_description}</td>
                  <td>{row.group || "-"}</td>
                  <td>{row.is_staff ? "Yes" : "No"}</td>
                  <td>{row.is_session ? "Yes" : "No"}</td>
                  <td>{row.behaviour ? "Compulsory" : "Optional"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(row.feedback_type_id)}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => confirmDelete(row.feedback_type_id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No feedback types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
