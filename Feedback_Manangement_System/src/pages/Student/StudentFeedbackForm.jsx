import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Box from "@mui/material/Box";
import { CircularProgress, Alert } from "@mui/material";
import Api from "../../services/api";

function StudentFeedbackForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const feedbackData = location.state?.feedbackData;
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if(!feedbackData)
        {
            setError("No feedback data found. Please go back to the list and select a feedback to fill.");
            setQuestionsLoading(false);
            return;
        }

        const fetchQuestions = async () => {
            try
            {
                const response = await Api.get(
                    `QuestionAnswer/GetAllQuestions/${feedbackData.feedbackTypeId}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}` 
                        }
                    }
                );

                const data = await response.data;
                setQuestions(data);
            }
            catch(e)
            {
                console.error("Failed to fetch questions:", e);
                setError("Failed to load questions. Please try again later.");
            }
            finally
            {
                setQuestionsLoading(false);
            }
        }
        fetchQuestions();
    }, [feedbackData, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        questions.forEach(q => {
            const answer = answers[q.question_id];
            if (!answer || (typeof answer === 'string' && answer.trim() === '') || (typeof answer === 'number' && answer === 0)) {
                newErrors[q.question_id] = `Please answer Q.${q.question_id}: ${q.question}`;
            }
        });

        if (Object.keys(newErrors).length === 0) {
            let studentData = null;
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    studentData = JSON.parse(storedUser);
                }
            } catch (parseError) {
                console.error("Failed to parse user data from localStorage:", parseError);
                toast.error("An error occurred with user data. Please try logging in again.");
                return;
            }

            const studentRollNo = studentData ? studentData.id : null;            

            if (!studentRollNo) {
                toast.error("Could not find student ID. Please log in again.");
                return;
            }
            
            const feedbackSubmissionData = {
                feedbackId: feedbackData.feedbackId,
                feedbackGroupId: feedbackData.feedbackGroupId,
                studentId: studentRollNo, 
                answers: answers
            };

            try
            {
                const response = await Api.post(
                    'QuestionAnswer/SubmitFeedbackAnswers',
                    feedbackSubmissionData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${token}`
                        },
                    }
                );

                toast.success("Feedback submitted successfully!");
                setTimeout(() => {
                    navigate('/app/student-pending-feedbacklist');
                }, 4000)
            }
            catch(e)
            {
                console.error("Failed to submit feedback:", e);
                toast.error("An error occurred while submitting feedback. Please try again.");
            }
        } else {
            console.error("Validation errors:", newErrors);
            toast.error("Please fill out all the questions.");
        }
    };

    const renderQuestionInput = (question) => {
        const value = answers[question.question_id] || "";
        
        if (question.question_type === "mcq") {
            const options = ["Excellent", "Good", "Average", "Poor"];
            return (
                <div className="bg-white rounded p-3" style={{ width: 180 }}>
                    {options.map(option => (
                        <div key={option} className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name={`q-${question.question_id}`}
                                id={`q-${question.question_id}-${option}`}
                                value={option}
                                checked={value === option}
                                onChange={() => setAnswers({...answers, [question.question_id]: option})}
                            />
                            <label className="form-check-label" htmlFor={`q-${question.question_id}-${option}`}>
                                {option}
                            </label>
                        </div>
                    ))}
                </div>
            );
        } else if (question.question_type === "rating") {
            return (
                <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            style={{
                                fontSize: 32,
                                cursor: "pointer",
                                color: value >= star ? "#f7c948" : "#ccc",
                            }}
                            onClick={() => setAnswers({...answers, [question.question_id]: star})}
                            role="button"
                            aria-label={`Rate ${star} star`}
                        >
                            ★
                        </span>
                    ))}
                </div>
            );
        } else if (question.question_type === "descriptive") {
            return (
                <textarea
                    className="form-control"
                    rows={2}
                    value={value}
                    onChange={(e) => setAnswers({...answers, [question.question_id]: e.target.value})}
                />
            );
        }
        return null;
    };

    if (questionsLoading) {
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

    console.log("Rendering with feedbackData:", feedbackData);
    console.log("Questions data:", questions);

    return (
        <div className="d-flex align-items-center justify-content-center">
            <div className="container py-4" style={{ maxWidth: 700 }}>
                <ToastContainer position="top-right" />
                <div className="text-center mb-3">
                    <button className="btn btn-primary" disabled style={{ minWidth: 300 }}>
                        STUDENT FEEDBACK FORM
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 rounded" style={{ background: "#ddd", border: "1px solid #333" }}>
                        <div className="row mb-3">
                            <div className="col-md-4 mb-2">
                                <label className="form-label fw-bold">Type:</label>
                                <span> {feedbackData.feedbackTypeName}</span>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label className="form-label fw-bold">Course:</label>
                                <span> {feedbackData.courseName}</span>
                            </div>
                            <div className="col-md-4 mb-2">
                                <label className="form-label fw-bold">Module:</label>
                                <span> {feedbackData.moduleName}</span>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-4 mb-2">
                                <label className="form-label fw-bold">Session:</label>
                                <span> {feedbackData.session}</span>
                            </div>
                            <div className="col-md-5 mb-2">
                                <label className="form-label fw-bold">Staff Name:</label>
                                <span> {feedbackData.staffName}</span>
                            </div>
                            <div className="col-md-3 mb-2">
                                <label className="form-label fw-bold">Group:</label>
                                <span> {feedbackData.groupName}</span>
                            </div>
                        </div>

                        {questions.map((question, index) => (
                            <div key={question.question_id} className="mb-3">
                                <label className="fw-bold">
                                    Q.{index + 1}. {question.question}
                                </label>
                                {renderQuestionInput(question)}
                            </div>
                        ))}
                        
                        <div className="text-center">
                            <button type="submit" className="btn btn-primary me-2">
                                Submit
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => navigate('/app/student-pending-feedbacklist')}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentFeedbackForm;