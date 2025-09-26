import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { getCourses } from "../../services/course";
import { getModules } from "../../services/Module";
import { getStaff } from "../../services/staff";
import Api from "../../services/api";
import { toast } from "react-toastify";

function ScheduleFeedbackForm() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [feedbackTypes, setFeedbackTypes] = useState([]);
  const [groups, setGroups] = useState([]);

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    feedbackTypeId: "",
    courseId: "",
    moduleId: "",
    staffId: "",
    session: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.formData) {
      setFormData(location.state.formData);
    }
  }, [location.state]);

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
    fetchFeedbackTypes();
  }, []);

  const fetchFeedbackTypes = async () => {
    try {
      const response = await Api.get("FeedbackType/GetFeedbackType", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbackTypes(response.data);
    } catch (error) {
      console.error("Failed to load feedback types:", error);
      toast.error("Failed to load feedback types.");
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load courses.");
    }
  };

  const fetchModulesByCourse = async (courseId) => {
    try {
      if (!courseId) {
        setModules([]);
        return;
      }
      const response = await Api.get(`Modules/ByCourse/${courseId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setModules(response.data);
    } catch (error) {
      console.error("Failed to load modules:", error);
      toast.error("Failed to load modules.");
      setModules([]);
    }
  };

  const fetchFaculties = async () => {
    try {
      const data = await getStaff();
      setFaculties(data);
    } catch (error) {
      console.error("Failed to load faculties:", error);
      toast.error("Failed to load faculties.");
    }
  };

  const fetchGroupsByCourse = async (courseId) => {
    try {
      const response = await Api.get(`Groups/ByCourse/${courseId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const mappedGroups = response.data.map((g) => ({
        groupId: g.group_id,
        groupName: g.group_name,
        staffId: "",
      }));
      setGroups(mappedGroups);
    } catch (error) {
      console.error("Failed to load groups:", error);
      toast.error("Failed to load groups.");
      setGroups([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "feedbackTypeId") {
      setGroups([]);
    }

    if (name === "courseId") {
      if (value) {
        fetchGroupsByCourse(value);
        fetchModulesByCourse(value);
      } else {
        setGroups([]);
        setModules([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Start Date cannot be greater than End Date!");
      return;
    }

    const selectedFeedbackType = feedbackTypes.find(
      (t) => t.feedback_type_id === Number(formData.feedbackTypeId)
    );

    if (
      selectedFeedbackType?.group?.toLowerCase() === "multiple" &&
      groups.some((g) => !g.staffId)
    ) {
      toast.error("Please select staff for all groups before submitting.");
      return;
    }

    const payload = {
      courseId: Number(formData.courseId),
      moduleId: Number(formData.moduleId),
      feedbackTypeId: Number(formData.feedbackTypeId),
      session: Number(formData.session),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: "active",
      staffId:
        selectedFeedbackType?.group?.toLowerCase() === "single"
          ? Number(formData.staffId)
          : null,
      feedbackGroups:
        selectedFeedbackType?.group?.toLowerCase() === "multiple"
          ? groups.map((g) => ({
              groupId: g.groupId,
              staffId: Number(g.staffId),
            }))
          : [],
    };

    try {
      await Api.post("Feedback/Schedule", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Feedback scheduled successfully!");
      navigate("/app/schedule-feedback-list");
    } catch (error) {
      console.error("Error scheduling feedback:", error);
      toast.error("Failed to schedule feedback. Please try again.");
    }
  };

  const selectedFeedbackType = feedbackTypes.find(
    (t) => t.feedback_type_id === Number(formData.feedbackTypeId)
  );

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">SCHEDULE FEEDBACK</h4>
      <form className="p-4 rounded shadow" onSubmit={handleSubmit}>
        {/* Dates */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">From Date:</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">To Date:</label>
            <input
              type="date"
              name="endDate"
              className="form-control"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Type + Course */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Type:</label>
            <select
              name="feedbackTypeId"
              className="form-select"
              value={formData.feedbackTypeId || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Feedback Type</option>
              {feedbackTypes.map((type) => (
                <option
                  key={type.feedback_type_id}
                  value={type.feedback_type_id}
                >
                  {type.feedback_type_title}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Course:</label>
            <select
              name="courseId"
              className="form-select"
              value={formData.courseId || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Module + Staff (for single mode) */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Module:</label>
            <select
              name="moduleId"
              className="form-select"
              value={formData.moduleId || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Module</option>
              {modules.map((mod) => (
                <option key={mod.module_id} value={mod.module_id}>
                  {mod.module_name}
                </option>
              ))}
            </select>
          </div>

          {selectedFeedbackType?.group?.toLowerCase() === "single" && (
            <div className="col-md-6">
              <label className="form-label">Staff:</label>
              <select
                name="staffId"
                className="form-select"
                value={formData.staffId || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Faculty</option>
                {faculties.map((fac) => (
                  <option key={fac.staff_id} value={fac.staff_id}>
                    {fac.first_name} {fac.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Session */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Session:</label>
            <input
              type="number"
              name="session"
              className="form-control"
              value={formData.session}
              onChange={handleChange}
              min={0}
            />
          </div>
        </div>

        {/* Group List (only for multiple) */}
        {selectedFeedbackType?.group?.toLowerCase() === "multiple" && (
          <div className="container mt-4">
            <h4>Group List</h4>
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Group Name</th>
                  <th>Staff Member</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, index) => {
                  const selectedStaffIds = groups
                    .map((g, i) => (i !== index ? g.staffId : null))
                    .filter((id) => id !== null);

                  return (
                    <tr key={group.groupId}>
                      <td>{group.groupName}</td>
                      <td>
                        <select
                          className="form-select"
                          value={group.staffId || ""}
                          onChange={(e) => {
                            const newGroups = [...groups];
                            newGroups[index].staffId = parseInt(e.target.value);
                            setGroups(newGroups);
                          }}
                          required
                        >
                          <option value="">Select Staff</option>
                          {faculties
                            .filter(
                              (fac) => !selectedStaffIds.includes(fac.staff_id)
                            )
                            .map((fac) => (
                              <option key={fac.staff_id} value={fac.staff_id}>
                                {fac.first_name} {fac.last_name}
                              </option>
                            ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {groups.length === 0 && (
                  <tr>
                    <td colSpan="2" className="text-center">
                      No Groups available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Buttons */}
        <div className="text-center">
          <button type="submit" className="btn btn-primary me-3">
            SUBMIT
          </button>
          <button
            type="button"
            onClick={() => navigate("/app/schedule-feedback-list")}
            className="btn btn-danger"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleFeedbackForm;
