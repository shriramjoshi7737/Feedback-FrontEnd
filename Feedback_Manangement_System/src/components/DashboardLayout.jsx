import React, { useState, useContext } from "react";
import {
    Drawer,
    List,
    ListItemIcon,
    Box,
    Collapse,
    ListItemButton,
    Avatar
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";       // Feedback Dashboard
import FeedbackIcon from "@mui/icons-material/Feedback";         // Feedback
import CategoryIcon from "@mui/icons-material/Category";         // Feedback Type
import EventNoteIcon from "@mui/icons-material/EventNote";       // Schedule Feedback
import AssessmentIcon from "@mui/icons-material/Assessment";     // Reports
import BarChartIcon from "@mui/icons-material/BarChart";         // Coursewise Report
import SummarizeIcon from "@mui/icons-material/Summarize";       // Feedback Summary
import PersonAddIcon from "@mui/icons-material/PersonAdd";       // Add Staff
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";     // Add Module
import MenuBookIcon from "@mui/icons-material/MenuBook";         // Add Course
import GroupsIcon from "@mui/icons-material/Groups";             // Add Group
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd"; // My Feedbacks (Trainer)
import PendingActionsIcon from "@mui/icons-material/PendingActions"; // Pending Feedback
import HistoryIcon from "@mui/icons-material/History";           // Feedback History
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate, Outlet } from "react-router-dom";
import { RoleContext } from "../App";

function DashboardLayout() {
    const [openReports, setOpenReports] = useState(false);
    const [openFeedbackSummary, setOpenFeedbackSummary] = useState(false);
    const [openStudentFeedback, setOpenStudentFeedback] = useState(false);
    const navigate = useNavigate();

    const { role } = useContext(RoleContext);
    const user = JSON.parse(localStorage.getItem("user"));
   const username = user
  ? `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())  // ✅ capitalize first letter of each word
  : "Guest";

    const currentRole = role || (user ? user.role : null);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        console.log("Logout Successful");
        navigate("/");
    };

    const drawerWidth = 250;

    return (
        <Box sx={{ display: "flex" }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth },
                }}
            >
                {/* User Header */}
<Box
  sx={{
    bgcolor: (theme) => theme.palette.primary.main,
    color: (theme) => theme.palette.primary.contrastText,
    display: "flex",
    alignItems: "center",
    height: 64,
    px: 2,
    fontWeight: 600,
    fontSize: 22,
    letterSpacing: 1.2,
  }}
>
  {user?.image ? (
    <Avatar
      src={user.image}
      alt={username}
      sx={{ width: 40, height: 40, mr: 1.5 }} // 🔹 added right margin
    />
  ) : (
    <AccountCircleIcon sx={{ fontSize: 40, mr: 1.5 }} /> // 🔹 same spacing
  )}
  {username} {/* 🔹 Capitalize first letter */}
</Box>


                {/* Sidebar Menu */}
                <Box sx={{ flexGrow: 1 }}>
                    <List>
                        {/* Admin Menu */}
                        {currentRole?.toLowerCase() === "admin" && (
                            <>
                                <ListItemButton onClick={() => navigate("/app/feedback-dashboard")}>
                                    <ListItemIcon><DashboardIcon /></ListItemIcon>
                                    Feedback Dashboard
                                </ListItemButton>

                                <ListItemButton onClick={() => navigate("/app/feedback-type-list")}>
                                    <ListItemIcon><CategoryIcon /></ListItemIcon>
                                    Feedback Type
                                </ListItemButton>

                                <ListItemButton onClick={() => navigate("/app/schedule-Feedback-List")}>
                                    <ListItemIcon><EventNoteIcon /></ListItemIcon>
                                    Schedule Feedback
                                </ListItemButton>

                                {/* Reports */}
                                <ListItemButton onClick={() => setOpenReports(!openReports)}>
                                    <ListItemIcon><AssessmentIcon /></ListItemIcon>
                                    Reports
                                    {openReports ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                                <Collapse in={openReports}>
                                    <List>
                                        <ListItemButton onClick={() => navigate("/app/coursewise-report")} sx={{ pl: 8 }}>
                                            <ListItemIcon><BarChartIcon /></ListItemIcon>
                                            Coursewise Report
                                        </ListItemButton>
                                    </List>
                                </Collapse>

                                {/* Feedback Summary */}
                                <ListItemButton onClick={() => setOpenFeedbackSummary(!openFeedbackSummary)}>
                                    <ListItemIcon><SummarizeIcon /></ListItemIcon>
                                    Feedback Summary
                                    {openFeedbackSummary ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                                <Collapse in={openFeedbackSummary}>
                                    <List>
                                        <ListItemButton onClick={() => navigate("/app/faculty-feedback-summary")} sx={{ pl: 8 }}>
                                            Faculty Feedback Summary
                                        </ListItemButton>
                                        <ListItemButton onClick={() => navigate("/app/per-faculty-feedback-summary")} sx={{ pl: 8 }}>
                                            Per-Faculty Feedback Summary
                                        </ListItemButton>
                                    </List>
                                </Collapse>

                                <ListItemButton onClick={() => navigate("/app/staff/add")}>
                                    <ListItemIcon><PersonAddIcon /></ListItemIcon>
                                    Add Staff
                                </ListItemButton>

                                <ListItemButton onClick={() => navigate("/app/add-module")}>
                                    <ListItemIcon><LibraryAddIcon /></ListItemIcon>
                                    Add Module
                                </ListItemButton>

                                <ListItemButton onClick={() => navigate("/app/add-course")}>
                                    <ListItemIcon><MenuBookIcon /></ListItemIcon>
                                    Add Course
                                </ListItemButton>

                                <ListItemButton onClick={() => navigate("/app/add-group")}>
                                    <ListItemIcon><GroupsIcon /></ListItemIcon>
                                    Add Group
                                </ListItemButton>
                            </>
                        )}

                        {/* Trainer Menu */}
                        {currentRole?.toLowerCase() === "trainer" && (
                            <ListItemButton onClick={() => navigate("/app/staff-dashboard")}>
                                <ListItemIcon><AssignmentIndIcon /></ListItemIcon>
                                My Feedbacks
                            </ListItemButton>
                        )}

                        {/* Student Menu */}
                        {currentRole?.toLowerCase() === "student" && (
                            <>
                                <ListItemButton onClick={() => setOpenStudentFeedback(!openStudentFeedback)}>
                                    <ListItemIcon><FeedbackIcon /></ListItemIcon>
                                    Feedback
                                    {openStudentFeedback ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                                <Collapse in={openStudentFeedback}>
                                    <List>
                                        <ListItemButton onClick={() => navigate("/app/student-pending-feedbacklist")} sx={{ pl: 8 }}>
                                            <ListItemIcon><PendingActionsIcon /></ListItemIcon>
                                            Pending
                                        </ListItemButton>
                                        <ListItemButton onClick={() => navigate("/app/student-feedback-history")} sx={{ pl: 8 }}>
                                            <ListItemIcon><HistoryIcon /></ListItemIcon>
                                            History
                                        </ListItemButton>
                                    </List>
                                </Collapse>
                            </>
                        )}
                    </List>
                </Box>

                {/* Logout */}
                <Box>
                    <List>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon /></ListItemIcon>
                            Logout
                        </ListItemButton>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: "background.default",
                    p: 3,
                    width: "100%",
                    minHeight: "100vh",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default DashboardLayout;
