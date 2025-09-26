import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import "./Component.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Api from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FeedbackTypeList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const token = localStorage.getItem("token");

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

  const handleAddClick = () => {
    navigate("/app/feedback-type-form");
  };

  const handleEdit = (id) => {
    navigate(`/app/feedback-type-form/${id}`);
  };

  const confirmDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this feedback type?</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDelete(id)}
          >
            Yes
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => toast.dismiss()}
          >
            No
          </Button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

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

  const columns = [
    { field: "feedback_type_id", headerName: "ID", width: 50 },
    {
      field: "feedback_type_title",
      headerName: "Title",
      flex: 1,
      renderHeader: () => <strong>Title</strong>,
    },
    {
      field: "feedback_type_description",
      headerName: "Description",
      flex: 1,
      renderHeader: () => <strong>Description</strong>,
    },
    {
      field: "group",
      headerName: "Group",
      flex: 1,
      renderCell: (params) => params.value || "-",
      renderHeader: () => <strong>Group</strong>,
    },
    {
      field: "is_staff",
      headerName: "Staff",
      flex: 1,
      renderCell: (params) => (params.value ? "Yes" : "No"),
      renderHeader: () => <strong>Staff</strong>,
    },
    {
      field: "is_session",
      headerName: "Session",
      flex: 1,
      renderCell: (params) => (params.value ? "Yes" : "No"),
      renderHeader: () => <strong>Session</strong>,
    },
    {
      field: "behaviour",
      headerName: "Behaviour",
      flex: 1,
      renderCell: (params) => (params.value ? "Compulsory" : "Optional"),
      renderHeader: () => <strong>Behaviour</strong>,
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row.feedback_type_id)}
          >
            <EditIcon />
          </Button>
          <Button
            color="error"
            size="small"
            onClick={() => confirmDelete(params.row.feedback_type_id)}
          >
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="container">
      <h2 className="table-header text-center mt-3">Feedback Type List</h2>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" color="primary" onClick={handleAddClick}>
          Add Feedback Type
        </Button>
      </Box>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.feedback_type_id}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Box>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
