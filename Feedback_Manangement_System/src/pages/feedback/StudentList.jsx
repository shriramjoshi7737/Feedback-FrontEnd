import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Component.css";
import { useParams, useLocation } from "react-router-dom";
import Api from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const columns = [
  { field: "student_rollno", headerName: "Roll No", flex: 1 },
  { field: "first_name", headerName: "First Name", flex: 1 },
  { field: "last_name", headerName: "Last Name", flex: 1 },
  { field: "email", headerName: "Email ID", flex: 1 },
  { field: "groupName", headerName: "Group Name", flex: 1 },
];

export default function StudentList() {
  const { feedbackGroupId } = useParams();
  const location = useLocation();
  const [rows, setRows] = useState([]);

  const isSubmittedPage = location.pathname.includes("student-list");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
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

        const dataWithIds = res.data.map((s, index) => ({
          id: index + 1,
          ...s,
        }));

        setRows(dataWithIds);
      } catch (err) {
        console.error("Error fetching students:", err);
        toast.error("Failed to load student data. Please try again.");
      }
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
      "Roll No",
      "First Name",
      "Last Name",
      "Email ID",
      "Group Name",
    ];
    const tableRows = [];

    rows.forEach((row) => {
      tableRows.push([
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

  return (
    <div className="container">
      <h2 className="table-header text-center mt-3">
        {isSubmittedPage ? "Filled Student List" : "Remaining Student List"}
      </h2>

      <div className="d-flex justify-content-end mb-2">
        <Button variant="contained" color="primary" onClick={exportPDF}>
          Export to PDF
        </Button>
      </div>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
        />
      </Box>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
