import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import Api from "../../services/api";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { IconButton } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@mui/material";

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
      "ID",
      "Course",
      "Date",
      "Module",
      "Type",
      "Session",
      "Rating",
    ];
    const tableRows = [
      [
        row.id,
        row.course,
        row.date,
        row.module,
        row.type,
        row.session,
        row.rating,
      ],
    ];
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save(`feedback_report_${row.id}.pdf`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "course",
      headerName: "Course",
      flex: 1,
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Course</span>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Date</span>
      ),
    },
    {
      field: "module",
      headerName: "Module",
      flex: 0.5,
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Module</span>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Type</span>
      ),
    },
    {
      field: "session",
      headerName: "Session",
      flex: 0.5,
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Session</span>
      ),
    },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1,
      renderCell: (params) => (
        <span style={{ fontWeight: "bold", color: "#1976d2" }}>
          {params.value ?? "N/A"}
        </span>
      ),
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>rating</span>
      ),
    },
    {
      field: "pdf",
      headerName: "PDF Report",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDownloadPdf(params.row)}>
          <PictureAsPdfIcon />
        </IconButton>
      ),
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>PDF Report</span>
      ),
    },
  ];

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
              ratings: [f.rating ?? 0], // store ratings in array
            };
          } else {
            acc[key].ratings.push(f.rating ?? 0);
          }
          return acc;
        }, {});

        const feedbackArray = Object.values(grouped).map((item, index) => ({
          id: index + 1, // unique row id for DataGrid
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
            : "N/A", // average rating rounded to 2 decimals
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
  //   useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   const token = localStorage.getItem("token");
  //   if (!user || !user.id) return;

  //   const fetchScheduledFeedback = async () => {
  //     try {
  //       const response = await Api.get(`/staff/${user.id}/scheduledFeedback`, {
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${token}`, // 👈 add token here
  //           },
  //         });;

  //       // Use backend rating directly
  //       const feedbackData = response.data.map((f, index) => ({
  //  id: `${f.feedbackId}_${index}`, // ✅ unique even if feedbackId repeats
  //   course: f.courseName,
  //   date: f.startDate,
  //   module: f.moduleName,
  //   type: f.feedbackTypeName,
  //   session: f.session,
  //   feedbackTypeId: f.feedback_type_id,
  //   rating: f.rating ?? "N/A",
  // }));
  //       setRows(feedbackData);
  //     } catch (error) {
  //       console.error("Error fetching scheduled feedback:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchScheduledFeedback();
  // }, []);

  return (
    <div className="container">
      <h2 className="table-header text-center mt-3">My Feedbacks</h2>
      <p className="text-center text-muted">
        Feedbacks you have received till today
      </p>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadFullPdf}
        >
          Download PDF
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
          padding: 2,
          borderRadius: 1,
        }}
      ></Box>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5 },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
}
