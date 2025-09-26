import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import Api from '../../services/api';

function SubmittedFeedbackForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const { feedbackData } = location.state || {};
    
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchSubmittedData = async () => {
            if (!feedbackData || !feedbackData.feedbackGroupId) {
                setError("No feedback data provided.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const studentRollNo = JSON.parse(localStorage.getItem('user'))?.id;

            try {
                const response = await Api.get(
                    `Feedback/GetSubmittedFeedbackDetailsForView/${feedbackData.feedbackGroupId}/${studentRollNo}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}` 
                        }
                    }
                );
                
                const data = await response.data;

                if (!data || !data.answers) {
                    throw new Error("Invalid response format.");
                }
                
                setAnswers(data.answers);
            } catch (e) {
                console.error("Error fetching submitted feedback data:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmittedData();
    }, [feedbackData]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Box sx={{ width: '100%', maxWidth: '700px' }}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                    Submitted Feedback
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                    {feedbackData?.feedbackTypeName} - {feedbackData?.courseName} ({feedbackData?.staffName})
                </Typography>

                <Box sx={{ p: 4, borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f5f5f5' }}>
                    {answers.map((answer, index) => (
                        <Box key={answer.questionId} sx={{ mb: 4, p: 3, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <strong>Question {index + 1}:</strong> {answer.questionText}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                **Your Answer:** {answer.answerText}
                            </Typography>
                        </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button variant="outlined" color="secondary" onClick={() => navigate('/app/student-feedback-history')}>
                            Go Back
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default SubmittedFeedbackForm;