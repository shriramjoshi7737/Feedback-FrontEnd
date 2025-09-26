import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Typography, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Api from '../../services/api';

function StudentFeedbackHistoryList() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

    const token = localStorage.getItem("token");

    const columns = [
    { field: 'feedbackGroupId', headerName: 'ID', width: 60 },
    {
        field: 'feedbackTypeName', // Match API response
        headerName: 'Type',
        sortable: false,
        width: 280,
        renderHeader: () => (
            <span style={{ color: "black", fontWeight: "bold" }}>Type</span>
        ),
    },
    {
        field: 'courseName', // Match API response
        headerName: 'Course',
        width: 120,
        renderHeader: () => (
            <span style={{ color: "black", fontWeight: "bold" }}>Course</span>
        ),
    },
    {
        field: 'moduleName', // Match API response
        headerName: 'Module',
        width: 100,
        renderHeader: () => (
            <span style={{ color: "black", fontWeight: "bold" }}>Module</span>
        ),
    },
    {
        field: 'staffName',
        headerName: 'Faculty',
        width: 150,
        renderHeader: () => (
            <span style={{ color: "black", fontWeight: "bold" }}>Faculty</span>
        ),
    },
    {
        field: 'session',
        headerName: 'Session',
        width: 100,
        renderHeader: () => (
            <span style={{ color: "black", fontWeight: "bold" }}>Session</span>
        ),
    },
    {
        field: "actions",
        headerName: "Action",
        width: 100,
        renderHeader: () => (
            <span style={{ color: "black", fontWeight: "bold" }}>Action</span>
        ),
        renderCell: (params) => (
            <Typography
                color="primary"
                style={{ cursor: 'pointer'}}
                onClick={() => handleView(params.row)}
            >
                View
            </Typography>
        ),
    }
];

    const handleView = (row) => {
        console.log("row", row);
        navigate('/app/submitted-feedback-form', {state: {feedbackData: row}})
    };

    useEffect(() => {
        const fetchSubmittedFeedbacks = async () => {
            setLoading(true);
            setError(null);
            
            let studentData = null;
            try 
            {
                const loginStudent = localStorage.getItem('user');
                if(loginStudent)
                {
                    studentData = JSON.parse(loginStudent);
                }
            }
            catch(e)
            {
                console.error("Failed to parse user data from localStorage:", e);
                setError("An error occurred with user data. Please try logging in again.");
                setLoading(false);
                return;
            }

            const studentRollNo = studentData ? studentData.id : null;
            if(!studentRollNo)
            {
                setError("Could not find student ID. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                const response = await Api.get(
                    `Feedback/GetSubmittedFeedbackHistory/${studentRollNo}`,
                    {
                        params: {
                            page: paginationModel.page + 1,
                            pageSize: paginationModel.pageSize
                        },
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}` 
                        }
                    }
                );
                
                const { data, totalCount } = response.data;
                
                const formattedData = data.map(item => ({
                    ...item,
                    id: item.feedbackGroupId 
                }));

                setRows(formattedData);
                setRowCount(totalCount);
            } catch (e) {
                console.error("Failed to fetch pending feedbacks:", e);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmittedFeedbacks();
    }, [paginationModel, token]); 

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <div className='container'>
            <h2 className="table-header text-center mt-3">Feedback History</h2>
            <Box sx={{ height: 400, width: '99%', mt: 5 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row.feedbackGroupId}
                    pagination
                    paginationMode="server"
                    rowCount={rowCount}
                    pageSizeOptions={[5]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    disableRowSelectionOnClick
                    initialState={{
                        sorting: {
                            sortModel: [{field: "feedbackGroupId", sort: "desc"}]
                        }
                    }}
                    loading={loading} 
                />
            </Box>
        </div>
    );
}

export default StudentFeedbackHistoryList;