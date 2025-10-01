import React, { useEffect, useState } from "react";
import Api from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function StaffList() {
  const [staffList, setStaffList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 👈 Pagination size
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchStaffList = async () => {
    try {
      const res = await Api.get("staff/getAllStaff", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setStaffList(res.data);
    } catch (err) {
      console.error("Error fetching staff list:", err);
      toast.error("Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = staffList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(staffList.length / itemsPerPage);

  return (
    <div className="container mt-5">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="card shadow-lg p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">👥 Staff List</h3>
          <button
            className="btn btn-success"
            onClick={() => navigate("/app/staff/add")} // 👈 Navigate to Add Staff Page
          >
            + Add Staff
          </button>
        </div>

        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((staff, index) => (
                <tr key={staff.staff_id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{staff.first_name}</td>
                  <td>{staff.last_name}</td>
                  <td>{staff.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No staff found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(totalPages).keys()].map((page) => (
              <li
                key={page + 1}
                className={`page-item ${currentPage === page + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default StaffList;
