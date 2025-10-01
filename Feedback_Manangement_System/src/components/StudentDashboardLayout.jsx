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
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [openFeedback, setOpenFeedback] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user ? `${user.first_name} ${user.last_name}` : "Student";

  const drawerWidth = 240;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar
        sx={{
          display: isDesktop ? "flex" : "none",
          bgcolor: (theme) => theme.palette.success.main,
          color: (theme) => theme.palette.primary.contrastText,
          fontWeight: 600,
          fontSize: 30,
        }}
      >
        <WavingHandIcon sx={{ color: "burlywood", mr: 2 }} />
        Welcome
      </Toolbar>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List>
          <ListItemButton onClick={() => setOpenFeedback(!openFeedback)}>
            <ListItemIcon>
              <PendingActionsIcon />
            </ListItemIcon>
            <ListItemText primary="Feedback" />
            {openFeedback ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openFeedback} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() =>
                  handleNavigation("/app/student-pending-feedbacklist")
                }
              >
                <ListItemIcon>
                  <PendingActionsIcon />
                </ListItemIcon>
                <ListItemText primary="Pending" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() =>
                  handleNavigation("/app/student-feedback-history")
                }
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
      <Box sx={{ borderTop: 1, borderColor: "divider", p: 1 }}>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: "error.main" }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "success.main",
          zIndex: (theme) =>
            isDesktop ? theme.zIndex.drawer + 1 : theme.zIndex.appBar,
          width: isDesktop ? `calc(100% - ${drawerWidth}px)` : "100%",
          ml: isDesktop ? `${drawerWidth}px` : 0,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {!isDesktop && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginLeft: isDesktop ? "auto" : 0,
            }}
          >
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

      <Box
        component="nav"
        sx={{ width: isDesktop ? drawerWidth : 0, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default StudentDashboardLayout;
