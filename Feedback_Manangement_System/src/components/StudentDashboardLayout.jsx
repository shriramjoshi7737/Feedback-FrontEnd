import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Box,
  AppBar,
  Toolbar,
  Typography,
  ListItemButton,
  Collapse,
  Avatar
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import { Outlet, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WavingHandIcon from "@mui/icons-material/WavingHand";

function StudentDashboardLayout() {
  const navigate = useNavigate();
  const [openFeedback, setOpenFeedback] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user ? `${user.first_name} ${user.last_name}` : "Student";

  const drawerWidth = 240;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

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
        <Toolbar
          sx={{
            bgcolor: (theme) => theme.palette.success.main,
            color: (theme) => theme.palette.primary.contrastText,
            fontWeight: 600,
            fontSize: 30,
          }}
        >
          <WavingHandIcon sx={{ color: "burlywood", mr: 2 }} />
          Welcome
        </Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <List>
            <ListItemButton onClick={() => setOpenFeedback(!openFeedback)}>
              <ListItemIcon>
                <PendingActionsIcon />
              </ListItemIcon>
              <ListItemText primary="Feedback" />
              {openFeedback ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openFeedback}>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => navigate("/app/student-pending-feedbacklist")}
                >
                  <ListItemIcon>
                    <PendingActionsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Pending" />
                </ListItemButton>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => navigate("/app/student-feedback-history")}
                >
                  <ListItemIcon>
                    <HistoryEduIcon />
                  </ListItemIcon>
                  <ListItemText primary="History" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>
        </Box>
        <Box>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <AppBar
  position="sticky"
  sx={{
    bgcolor: "success.main",
    zIndex: (theme) => theme.zIndex.drawer + 1,
  }}
>
  <Toolbar sx={{ justifyContent: "space-between" }}>
    {/* Left side - keep empty or app name if needed */}
    <Typography variant="h5" sx={{ fontWeight: 600 }}>

    </Typography>

    {/* Right side - username + avatar */}
    <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
        {username}
      </Typography>

      {user?.image ? (
        <Avatar
          src={user.image}
          alt={username}
          sx={{ width: 40, height: 40 }}
        />
      ) : (
        <AccountCircleIcon fontSize="large" />
      )}
    </Box>
  </Toolbar>
</AppBar>


        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default StudentDashboardLayout;
