import React from "react";
import "./Component.css";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Api from "../../services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ScheduleFeedbackList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  const [paginationModel, setPaginationModel] = React.useState({
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
    queryKey: ["feedbacks", paginationModel.page, paginationModel.pageSize],
    queryFn: () =>
      fetchFeedbacks({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
      }),
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  React.useEffect(() => {
    if (data?.totalCount != null) lastTotalCountRef.current = data.totalCount;
  }, [data]);

  React.useEffect(() => {
    const nextPage = paginationModel.page + 1;
    const pageSize = paginationModel.pageSize;
    const totalCount = data?.totalCount ?? lastTotalCountRef.current ?? 0;

    if (nextPage * pageSize < totalCount) {
      queryClient.prefetchQuery({
        queryKey: ["feedbacks", nextPage, pageSize],
        queryFn: () => fetchFeedbacks({ page: nextPage, pageSize }),
      });
    }
  }, [paginationModel, data, queryClient]);

  const rowCount = data?.totalCount ?? lastTotalCountRef.current ?? 0;
  const rows = data?.rows ?? [];

  const handleAddClick = () => {
    navigate("/app/schedule-feedback-form");
  };

  const handleDelete = async (feedbackGroupId) => {
    // ✅ Custom confirmation with toast (instead of window.confirm)
    toast.info(
      <div>
        <p>Are you sure you want to delete this record?</p>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <Button
            variant="contained"
            color="error"
            size="small"
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
                console.error("Error deleting record:", error);
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
          <Button
            variant="outlined"
            size="small"
            onClick={() => toast.dismiss()}
          >
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

  const columns = [
    { field: "feedbackGroupId", headerName: "Id", width: 100, flex: 0.5 },
    { field: "courseName", headerName: "Course", flex: 1 },
    { field: "moduleName", headerName: "Module", flex: 1 },
    { field: "feedbackTypeName", headerName: "Type", flex: 1 },
    { field: "staffName", headerName: "Staff", flex: 1 },
    {
      field: "groupName",
      headerName: "Group",
      flex: 0.7,
      renderCell: (params) =>
        params.value && params.value.toString().trim() !== ""
          ? params.value
          : "-",
    },
    { field: "session", headerName: "Session", flex: 1 },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "filledby",
      headerName: "FilledBy",
      flex: 0.5,
      renderCell: (params) => (
        <a
          href={`student-list/${params.row.feedbackGroupId ?? params.row.Id}`}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          {params.value ?? "-"}
        </a>
      ),
    },
    {
      field: "remaining",
      headerName: "Remaining",
      flex: 0.5,
      renderCell: (params) => (
        <a
          href={`remaining/${params.row.feedbackGroupId ?? params.row.Id}`}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          {params.value ?? "-"}
        </a>
      ),
    },
    { field: "status", headerName: "Status", flex: 0.7 },
    {
      field: "actions",
      headerName: "Action",
      //flex: 2,
      width: 150,
      renderCell: (params) => {
        const idForRow = params.row.feedbackGroupId ?? params.row.Id;
        return (
          <>
            <Button
              color="primary"
              size="small"
              sx={{ mr: 1 }}
              onClick={() => {
                const start = new Date(params.row.startDate);
                const now = new Date();
                if (start <= now) {
                  toast.error("You cannot update feedback after start date.");
                  return;
                }
                navigate(`/app/update-feedback-form/${params.row.feedbackId}`, {
                  state: { feedbackId: params.row.feedbackId },
                });
              }}
            >
              <EditIcon />
            </Button>

            <Button
              color="error"
              size="small"
              onClick={() => handleDelete(idForRow)}
            >
              <DeleteIcon />
            </Button>
          </>
        );
      },
    },
  ];

  const onPaginationModelChange = (model) => {
    if (model.pageSize !== paginationModel.pageSize) {
      setPaginationModel({ page: 0, pageSize: model.pageSize });
      return;
    }
    if (model.page !== paginationModel.page) {
      setPaginationModel((prev) => ({ ...prev, page: model.page }));
    }
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="table-header text-center mt-3">Schedule Feedback List</h2>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
          padding: 2,
          borderRadius: 1,
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          sx={{ position: "absolute", right: 50 }}
          onClick={handleAddClick}
        >
          Schedule Feedback
        </Button>
      </Box>

      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.feedbackGroupId ?? row.Id ?? row.feedbackId}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          rowCount={rowCount}
          loading={isFetching}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
}
