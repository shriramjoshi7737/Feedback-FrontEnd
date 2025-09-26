import DashboardLayout from "../../components/DashboardLayout";
import StudentDashboardLayout from "../../components/StudentDashboardLayout";
import './Home.css'
import { Outlet } from 'react-router-dom'

function Home() {
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role?.toLowerCase();

    return (
        <div className="flex">
      {role === "student" ? (
        <StudentDashboardLayout />
      ) : (
        <DashboardLayout />
      )}
      <main className="flex-1">
        {/* <Outlet /> child pages will render here */}
      </main>
    </div>
    );
}

export default Home;