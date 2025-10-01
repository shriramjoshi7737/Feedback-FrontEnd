import React, { useState, useContext } from "react";
import {
  Drawer,
  List,
  ListItemIcon,
  Box,
  Collapse,
  ListItemButton,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FeedbackIcon from "@mui/icons-material/Feedback";
import CategoryIcon from "@mui/icons-material/Category";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import SummarizeIcon from "@mui/icons-material/Summarize";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate, Outlet } from "react-router-dom";
import { RoleContext } from "../App";

function DashboardLayout() {
  const [openReports, setOpenReports] = useState(false);
  const [openFeedbackSummary, setOpenFeedbackSummary] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const { role } = useContext(RoleContext);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user
    ? `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Guest";

  const currentRole = role || (user ? user.role : null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const drawerWidth = 250;
  const isMobile = useMediaQuery("(max-width:900px)");

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {!isMobile && (
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
              sx={{ width: 40, height: 40, mr: 1.5 }}
            />
          ) : (
            <AccountCircleIcon sx={{ fontSize: 40, mr: 1.5 }} />
          )}
          {username}
        </Box>
      )}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List>
          {/* Admin Menu */}
          {currentRole?.toLowerCase() === "admin" && (
            <>
              <ListItemButton
                onClick={() => handleNavigate("/app/feedback-dashboard")}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                Feedback Dashboard
              </ListItemButton>

              <ListItemButton
                onClick={() => navigate("/app/feedback-type-list")}
              >
                <ListItemIcon>
                  <CategoryIcon />
                </ListItemIcon>
                Feedback Type
              </ListItemButton>

              <ListItemButton
                onClick={() => navigate("/app/schedule-Feedback-List")}
              >
                <ListItemIcon>
                  <EventNoteIcon />
                </ListItemIcon>
                Schedule Feedback
              </ListItemButton>

              {/* Reports */}
              <ListItemButton onClick={() => setOpenReports(!openReports)}>
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                Reports
                {openReports ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openReports}>
                <List>
                  <ListItemButton
                    onClick={() => navigate("/app/coursewise-report")}
                    sx={{ pl: 8 }}
                  >
                    <ListItemIcon>
                      <BarChartIcon />
                    </ListItemIcon>
                    Coursewise Report
                  </ListItemButton>
                </List>
              </Collapse>

              {/* Feedback Summary */}
              <ListItemButton
                onClick={() => setOpenFeedbackSummary(!openFeedbackSummary)}
              >
                <ListItemIcon>
                  <SummarizeIcon />
                </ListItemIcon>
                Feedback Summary
                {openFeedbackSummary ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openFeedbackSummary}>
                <List>
                  <ListItemButton
                    onClick={() => navigate("/app/faculty-feedback-summary")}
                    sx={{ pl: 8 }}
                  >
                    Faculty Feedback Summary
                  </ListItemButton>
                  <ListItemButton
                    onClick={() =>
                      navigate("/app/per-faculty-feedback-summary")
                    }
                    sx={{ pl: 8 }}
                  >
                    Per-Faculty Feedback Summary
                  </ListItemButton>
                </List>
              </Collapse>

              <ListItemButton onClick={() => navigate("/app/staff-list")}>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                Add Staff
              </ListItemButton>

              <ListItemButton onClick={() => navigate("/app/add-module")}>
                <ListItemIcon>
                  <LibraryAddIcon />
                </ListItemIcon>
                Add Module
              </ListItemButton>

              <ListItemButton onClick={() => navigate("/app/add-course")}>
                <ListItemIcon>
                  <MenuBookIcon />
                </ListItemIcon>
                Add Course
              </ListItemButton>

              <ListItemButton onClick={() => navigate("/app/add-group")}>
                <ListItemIcon>
                  <GroupsIcon />
                </ListItemIcon>
                Add Group
              </ListItemButton>
            </>
          )}

          {/* Staff Menu */}
          {currentRole?.toLowerCase() === "trainer" && (
            <ListItemButton onClick={() => navigate("/app/staff-dashboard")}>
              <ListItemIcon>
                <AssignmentIndIcon />
              </ListItemIcon>
              My Feedbacks
            </ListItemButton>
          )}
        </List>
      </Box>

      <Box>
        <List>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            Logout
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar for Mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{ zIndex: 1201, height: 64, justifyContent: "center" }}
        >
          <Toolbar sx={{ minHeight: 64 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
              {user?.image ? (
                <Avatar
                  src={user.image}
                  alt={username}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
              ) : (
                <AccountCircleIcon sx={{ fontSize: 32, mr: 1 }} />
              )}
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {username}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          <Toolbar sx={{ minHeight: 64 }} />
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

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
        {isMobile && <Toolbar sx={{ minHeight: 64 }} />}
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;
