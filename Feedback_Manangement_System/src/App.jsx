import { createContext, useEffect, useState } from 'react'
import FeedbackTypeList from "./pages/feedback/FeedbackTypeList";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Outlet } from 'react-router-dom';
import AddQuestionForm from "./pages/feedback/AddQuestionForm";
import ScheduleFeedbackList from "./pages/feedback/ScheduleFeedbackList";
import StudentFeedbackForm from './pages/Student/StudentFeedbackForm';
import StudentList from "./pages/feedback/StudentList";
import FeedbackTypeForm from './pages/feedback/FeedbackTypeForm';
import ScheduleFeedbackForm from './pages/feedback/ScheduleFeedbackForm';
import FacultyFeedbackSummary from './pages/feedback/PerFacultyFeedbackSummary';
import FeedbackDashboard from './pages/Dashboard/Feedbackdashbaord';
import Login from './pages/Login/Login';
import Faculty_Feedback_summary from './pages/Reports/Faculty_Feedback_summary';
import Home from './pages/Home/Home';
import StaffDashboard from './pages/Staff/StaffDashboard';
import Coursewise_Report from './pages/Reports/Coursewise_Report';
import Forgot_Password from './pages/Login/Forgot_Password';
import StudentPendingFeedbackList from './pages/Student/StudentPendingFeedbackList';
import StudentFeedbackHistoryList from './pages/Student/StudentFeedbackHistoryList';
import UpdateFeedbackForm from './pages/feedback/UpdateFeedbackForm';
import SubmittedFeedbackForm from './pages/Student/SubmittedFeedbackForm';
import StudentForm from './pages/Student/StudentForm';
import StaffForm from './pages/Staff/StaffForm';
import AddCourse from './pages/Courses/Courses';
import AddGroups from './pages/Groups/Groups';
import AddModule from './pages/Modules/Modules';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const RoleContext = createContext();

function App() {

   const [role, setRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role) {
      setRole(user.role);
    }
  }, []);

  const ProtectedRoute = ({ allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role))
      return <Navigate to="/app/feedback-dashboard" replace />;

    return <Outlet />;
  };

  return (
    <div>
      {/* <DashboardLayout/> */}
      <RoleContext.Provider value={{ role, setRole }} >
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<Forgot_Password />} />
            <Route path="/register-student" element={<StudentForm />} />

            <Route path="/app" element={<Home />}>
              <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
                <Route path="feedback-type-list" element={<FeedbackTypeList />} />
                <Route path="feedback-type-form" element={<FeedbackTypeForm />} />               {/* Create */}
                <Route path="feedback-type-form/:id" element={<FeedbackTypeForm />} />           {/* Update */}
                <Route path="add-question" element={<AddQuestionForm />} />                      {/* Create */}
                <Route path="add-question/:id" element={<AddQuestionForm />} />                  {/* Update */}
                <Route path="schedule-feedback-list" element={<ScheduleFeedbackList />} />
                <Route path="student-list/:feedbackGroupId" element={<StudentList />} />
                <Route path="remaining/:feedbackGroupId" element={<StudentList />} />
                <Route path="staff/add" element={<StaffForm />} />
                <Route path="schedule-feedback-form" element={<ScheduleFeedbackForm />} />
                <Route path="update-feedback-form/:feedbackId" element={<UpdateFeedbackForm />} />
                <Route path="per-faculty-feedback-summary" element={<FacultyFeedbackSummary />} />
                <Route path="feedback-dashboard" element={<FeedbackDashboard />} />
                <Route path="faculty-feedback-summary" element={<Faculty_Feedback_summary />} />
                <Route path="coursewise-report" element={<Coursewise_Report />} />
                <Route path="add-course" element={<AddCourse />} /> 
                <Route path="add-module" element={<AddModule />}/>
                <Route path="add-group" element={<AddGroups />} />

              </Route>
              <Route element={<ProtectedRoute allowedRoles={["student"]}/>}>
                <Route path="student-pending-feedbacklist" element={<StudentPendingFeedbackList />} />
                <Route path="student-feedback-history" element={<StudentFeedbackHistoryList />} />
                <Route path="student-feedback-form" element={<StudentFeedbackForm />} />
                <Route path="submitted-feedback-form" element={<SubmittedFeedbackForm />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["Trainer"]}/>}>
                <Route path="staff-dashboard" element={<StaffDashboard />} />
              </Route>
            </Route>
          </Routes>
        </Router>

        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      </RoleContext.Provider>
    </div>
  );
}
export default App;

