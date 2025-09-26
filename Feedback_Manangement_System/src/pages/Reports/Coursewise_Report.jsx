import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import Api from "../../services/api";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IconButton } from "@mui/material";


export default function CourseWiseReport() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [courseFilter, setCourseFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("");
const token = localStorage.getItem("token");
 
  useEffect(() => {

    Api.get("Feedback/CourseWiseReportWithRating",{
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        const flattened = [];
        let idCounter = 1;

        res.data.forEach((course) => {
          course.modules.forEach((module) => {
            module.feedbackTypes.forEach((ft) => {
              flattened.push({
                id: idCounter++,
                courseName: course.courseName,
                courseAverageRating: course.courseAverageRating,
                moduleName: module.moduleName,
                moduleAverageRating: module.moduleAverageRating,
                feedbackType: ft.feedbackTypeTitle,
                rating: ft.averageRating,
              });
            });
          });
        });

        setRows(flattened);
        setFilteredRows(flattened);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching coursewise report:", err);
        setLoading(false);
      });
  }, []);

 
  useEffect(() => {
    let filtered = rows;

    if (courseFilter) {
      filtered = filtered.filter((r) => r.courseName === courseFilter);
    }
    if (moduleFilter) {
      filtered = filtered.filter((r) => r.moduleName === moduleFilter);
    }
    if (feedbackFilter) {
      filtered = filtered.filter((r) => r.feedbackType === feedbackFilter);
    }

    setFilteredRows(filtered);
  }, [courseFilter, moduleFilter, feedbackFilter, rows]);


  const columns = [
    {
      field: "id",
      headerName: "Sr. No",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Sr. No</span>
      ),
    },
    {
      field: "courseName",
      headerName: "Course",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Course</span>
      ),
    },
    {
      field: "moduleName",
      headerName: "Module",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Module</span>
      ),
    },
    {
      field: "feedbackType",
      headerName: "Feedback Type",
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>Feedback Type</span>
      ),
    },
    {
      field: "courseAverageRating",
      headerName: "Course Avg Rating",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>
          Course Average Rating
        </span>
      ),
    },
    {
      field: "moduleAverageRating",
      headerName: "Module Avg Rating",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <span style={{ color: "black", fontWeight: "bold" }}>
          Module Average Rating
        </span>
      ),
    },
    {
      field: "rating",
      headerName: "Rating",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderHeader: () => (
        <div style={{ textAlign: "center" }}>
          <span style={{ color: "black", fontWeight: "bold" }}>Rating</span>
          <br />
          <span style={{ fontSize: "12px", color: "gray" }}>
            per feedback type
          </span>
        </div>
      ),
    },
  ];

  const downloadPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(16);
    doc.text("Course Wise Report with Ratings", 40, 40);

    const tableColumn = [
      "Sr. No",
      "Course",
      "Module",
      "Feedback Type",
      "Course Avg Rating",
      "Module Avg Rating",
      "Rating",
    ];
    const tableRows = filteredRows.map((row) => [
      row.id,
      row.courseName,
      row.moduleName,
      row.feedbackType,
      row.courseAverageRating,
      row.moduleAverageRating,
      row.rating,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: "grid",
      styles: { halign: "center", valign: "middle", fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210], textColor: "#fff", fontStyle: "bold" },
    });

    doc.save("CourseWiseReport.pdf");
  };

  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

 
  const uniqueCourses = [...new Set(rows.map((r) => r.courseName))];
  const uniqueModules =
    courseFilter !== ""
      ? [
          ...new Set(
            rows.filter((r) => r.courseName === courseFilter).map((r) => r.moduleName)
          ),
        ]
      : [];
  const uniqueFeedbacks =
    moduleFilter !== ""
      ? [
          ...new Set(
            rows
              .filter(
                (r) => r.courseName === courseFilter && r.moduleName === moduleFilter
              )
              .map((r) => r.feedbackType)
          ),
        ]
      : [];

  return (
    <Box sx={{ height: 650, width: "100%", mt: 4, px: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Course Wise Report with Ratings
      </Typography>
<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
    <IconButton color="primary" onClick={downloadPDF}>
    <PictureAsPdfIcon />
   </IconButton>
        </Box>
     
      <Grid container spacing={2} mb={2}>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={{ minWidth: 300 }}>
            <InputLabel sx={{ fontSize: "1.1rem" }}>Course</InputLabel>
            <Select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setModuleFilter("");
                setFeedbackFilter("");
              }}
              sx={{ fontSize: "1.1rem", height: 55 }}
              MenuProps={{
                PaperProps: {
                  sx: { fontSize: "1.1rem", minWidth: 300 },
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueCourses.map((c, i) => (
                <MenuItem key={i} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

       
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth disabled={!courseFilter} sx={{ minWidth: 300 }}>
            <InputLabel sx={{ fontSize: "1.1rem" }}>Module</InputLabel>
            <Select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setFeedbackFilter("");
              }}
              sx={{ fontSize: "1.1rem", height: 55 }}
              MenuProps={{
                PaperProps: {
                  sx: { fontSize: "1.1rem", minWidth: 300 },
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueModules.map((m, i) => (
                <MenuItem key={i} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

       
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth disabled={!moduleFilter} sx={{ minWidth: 300 }}>
            <InputLabel sx={{ fontSize: "1.1rem" }}>Feedback Type</InputLabel>
            <Select
              value={feedbackFilter}
              onChange={(e) => setFeedbackFilter(e.target.value)}
              sx={{ fontSize: "1.1rem", height: 55 }}
              MenuProps={{
                PaperProps: {
                  sx: { fontSize: "1.1rem", minWidth: 300 },
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueFeedbacks.map((f, i) => (
                <MenuItem key={i} value={f}>
                  {f}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      
      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
        autoHeight
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "15px",
          },
          "& .MuiDataGrid-cell": {
            fontSize: "14px",
            textAlign: "center",
          },
        }}
      />
    </Box>
  );
}
