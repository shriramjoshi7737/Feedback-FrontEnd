import React, { useEffect, useState } from "react";
import Api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function FacultyFeedbackSummary() {
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [courseTypes, setCourseTypes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [courseCycle, setCourseCycle] = useState([]);
    const [feedbackTypes, setFeedbackTypes] = useState([]);
    const [selectedCourseType, setSelectedCourseType] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedCycle, setSelectedCycle] = useState("");
    const [chartData, setChartData] = useState(null);

    const token = localStorage.getItem("token");

    const fetchCourseTypes = async () => {
        try{
            const response = await Api.get("GetCourseTypes",
                {
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    },
                }
            );
            setCourseTypes(response.data || []);
        }catch(e){
            console.log("Failed to load course types:", e);
            setCourseTypes([]);
        }
    };

    const handleCourseTypeChange = async (value) => {
    setSelectedCourseType(value);

        if (value && value !== "Course Type") {
            try {
            const res = await Api.get(`GetCoursesByType/${value}`,
                {
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    },
                }
            );
            setCourses(res.data || []);
            } catch (error) {
            console.error("Failed to load courses:", error);
            setCourses([]);
            }
        } else {
            setCourses([]); 
        }
    };
    
    const fetchFeedbackTypes = async () => {
        try{
            const response = await Api.get("FeedbackType/GetFeedbackType",
                {
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    },
                }
            );
            setFeedbackTypes(response.data || []);
        }catch(e){
            console.log("Failed to load feedback types:", e);
            setFeedbackTypes([]);
        }
    };

    useEffect(() => {
        fetchCourseTypes();
        fetchFeedbackTypes();
    },[])

    const handleTypeChange = (id) => {
        setSelectedTypes((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        if(selectedCourseType == "CDAC") {
            setCourseCycle(["Mar-Aug", "Sep-Feb"]);
        } else if(selectedCourseType == "Modular Batch" || selectedCourseType == "Pre-CAT") {
            setCourseCycle(["1 Month"]);
        } else {
            setCourseCycle([]);
        }

        setSelectedCycle("");
    }, [selectedCourseType])

    const handleGenerate = async () => {
        try {
            if (!selectedCourseType || !selectedCourse || selectedTypes.length === 0) {
                toast.warning("Please select Course Type, Course, and at least one Feedback Type!");
                return;
            }

            const feedbackTypeIds = selectedTypes.join(",");

            const response = await Api.get(
                `FeedbackReport/PerFacultyFeedbackSummary?courseType=${selectedCourseType}&courseId=${selectedCourse}&feedbackTypeIds=${feedbackTypeIds},`,
                {
                    headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = response.data || [];

            setChartData({
                labels: result.map((r) => r.staffName),
                datasets: [
                    {
                        label: "Average Rating (out of 5)",
                        data: result.map((r) => r.averageRating),
                        backgroundColor: "rgba(54, 162, 235, 0.7)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1,
                    },
                ],
            });
        } catch (err) {
            console.error("Error fetching chart data:", err);
        }
    };

    return (
        <>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="container ">
            <h2 className="page-header text-center mt-3 ">Per Faculty Feedback Summary</h2>
            <div className="row mb-3 mt-3">
                <div className="col">
                    <select 
                        className="form-select"
                        value={selectedCourseType}
                        onChange={(e) => {handleCourseTypeChange(e.target.value)}}
                    >
                        <option>Course Type</option>
                        {courseTypes.map((ct, idx) => (
                            <option key={idx} value={ct}>
                                {ct}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col">
                    <select 
                        className="form-select"
                        value={selectedCourse}
                        onChange={(e) => {setSelectedCourse(e.target.value)}}
                    >
                        <option value="">Course</option>
                        {courses.map((c) => (
                            <option key={c.course_id} value={c.course_id}>
                                {c.course_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col">
                    <select 
                        className="form-select"
                        value={selectedCycle}
                        onChange={(e) => setSelectedCycle(e.target.value)}
                    >
                        <option>Course Cycle</option>
                        {courseCycle.map((cycle, idx) => (
                            <option key={idx} value={cycle}>
                                {cycle}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mb-3 fw-bold">Select Type(s):</div>
            <div className="row mb-3">
                {feedbackTypes.map((ft) => (
                    <div className="col-md-6 mb-2" key={ft.feedback_type_id}>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`type${ft.feedback_type_id}`}
                                checked={selectedTypes.includes(ft.feedback_type_id)}
                                onChange={() => handleTypeChange(ft.feedback_type_id)}
                            />
                            <label className="form-check-label" htmlFor={`type${ft.feedback_type_id}`}>
                                {ft.feedback_type_title}
                            </label>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mb-4">
                <button className="btn" style={{ background: "#00ff00", minWidth: 120 }} onClick={handleGenerate}>
                    Generate
                </button>
            </div>
            <hr />
            <div className="d-flex justify-content-center mt-4">
                <div style={{ width: "100%", maxWidth: "900px" }}> 
                    {chartData ? (
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: "top" },
                                    title: { display: true, text: "Faculty Average Ratings" },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 5,
                                        ticks: { stepSize: 1 },
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p className="text-center text-muted">Click Generate to view the chart</p>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

export default FacultyFeedbackSummary;