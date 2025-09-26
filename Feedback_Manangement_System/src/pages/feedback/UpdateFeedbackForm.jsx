import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { getCourses } from "../../services/course";
import { getStaff } from "../../services/staff";
import Api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UpdateFeedbackForm() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [feedbackTypes, setFeedbackTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupType, setGroupType] = useState(""); // "single" | "multiple"

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    feedbackTypeId: "",
    courseId: "",
    moduleId: "",
    staffId: "",
    session: 0,
  });

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
    fetchFeedbackDetails(); // will also fetch feedback types for detected groupType
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const fetchModulesByCourse = async (courseId) => {
    try {
      if (!courseId) {
        setModules([]);
        return [];
      }
      const response = await Api.get(`Modules/ByCourse/${courseId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data || [];
      setModules(data);
      return data;
    } catch (error) {
      console.error("Failed to load modules by course:", error);
      setModules([]);
      toast.error("Failed to load modules");
      return [];
    }
  };

  const fetchFaculties = async () => {
    try {
      const data = await getStaff();
      setFaculties(data || []);
    } catch (error) {
      console.error("Failed to load faculties:", error);
      toast.error("Failed to load faculties");
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
      return response.data || [];
    } catch (error) {
      console.error("Failed to load groups:", error);
      toast.error("Failed to load groups");
      return [];
    }
  };

  const isoDateForInput = (dateString) => {
    if (!dateString) return "";
    const m = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return "";
    const year = m[1],
      month = m[2],
      day = m[3];
    return `${year}-${month}-${day}`;
  };

  const fetchFeedbackDetails = async () => {
    try {
      const response = await Api.get(`Feedback/GetByFeedback/${feedbackId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const feedback = response.data;

      if (!feedback) return;

      const detectedGroupType =
        feedback.feedbackGroups && feedback.feedbackGroups.length > 1
          ? "multiple"
          : "single";
      setGroupType(detectedGroupType);

      await fetchFeedbackTypes(detectedGroupType);

      let modulesForCourse = [];
      if (feedback.courseId) {
        modulesForCourse = await fetchModulesByCourse(feedback.courseId);
      } else {
        setModules([]);
      }

      const staffFromTop = feedback.staffId ?? null;
      const staffFromGroups =
        feedback.feedbackGroups && feedback.feedbackGroups.length > 0
          ? feedback.feedbackGroups.find((fg) => fg.staffId != null)?.staffId ?? null
          : null;
      const staffIdToUse = staffFromTop ?? staffFromGroups;

      setFormData({
        startDate: isoDateForInput(feedback.startDate),
        endDate: isoDateForInput(feedback.endDate),
        feedbackTypeId: feedback.feedbackTypeId != null ? String(feedback.feedbackTypeId) : "",
        courseId: feedback.courseId != null ? String(feedback.courseId) : "",
        moduleId: feedback.moduleId != null ? String(feedback.moduleId) : "",
        staffId: staffIdToUse != null ? String(staffIdToUse) : "",
        session: feedback.session ?? 0,
      });

      if (feedback.feedbackGroups && feedback.feedbackGroups.length > 0) {
        const courseGroups = await fetchGroupsByCourse(feedback.courseId);
        const mapped = feedback.feedbackGroups.map((fg) => {
          const groupInfo =
            fg.groupId != null ? courseGroups.find((g) => g.group_id === fg.groupId) : null;
          return {
            feedbackGroupId: fg.feedbackGroupId,
            groupId: fg.groupId ?? null,
            groupName: groupInfo?.group_name ?? (fg.groupId == null ? "-" : `Group ${fg.groupId}`),
            staffId: fg.staffId != null ? String(fg.staffId) : "",
          };
        });
        setGroups(mapped);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error("Failed to fetch feedback details:", error);
      toast.error("Failed to fetch feedback details");
    }
  };

  const fetchFeedbackTypes = async (type) => {
    try {
      if (!type) {
        setFeedbackTypes([]);
        return;
      }
      const response = await Api.get(`FeedbackType/ByGroup/${type}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbackTypes(response.data || []);
    } catch (error) {
      console.error("Failed to load feedback types:", error);
      toast.error("Failed to load feedback types");
    }
  };

  useEffect(() => {
    if (faculties.length > 0 && formData.staffId) {
      const exists = faculties.some((f) => String(f.staff_id) === formData.staffId);
      if (!exists) {
        setFormData((p) => ({ ...p, staffId: "" }));
      }
    }
  }, [faculties]); // eslint-disable-line

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStaffSelect = (groupId, staffId) => {
    setGroups((prev) =>
      prev.map((g) => (g.groupId === groupId ? { ...g, staffId: String(staffId) } : g))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Start Date cannot be greater than End Date!");
      return;
    }

    if (groupType === "multiple" && groups.some((g) => !g.staffId)) {
      toast.error("Please select staff for all groups before submitting.");
      return;
    }

    const payload = {
      feedbackId: Number(feedbackId),
      courseId: Number(formData.courseId),
      moduleId: Number(formData.moduleId),
      feedbackTypeId: Number(formData.feedbackTypeId),
      session: Number(formData.session),
      startDate: formData.startDate,
      endDate: formData.endDate,
      staffId: groupType === "single" ? Number(formData.staffId) : null,
      feedbackGroups:
        groupType === "multiple"
          ? groups.map((g) => ({
              feedbackGroupId: g.feedbackGroupId,
              groupId: g.groupId,
              staffId: Number(g.staffId),
            }))
          : [],
    };

    try {
      await Api.put(`Feedback/Update/${feedbackId}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Feedback updated successfully!");
      navigate("/app/schedule-feedback-list");
    } catch (error) {
      console.error("Error updating feedback:", error);
      const msg = error?.response?.data?.message || "Failed to update feedback.";
      toast.error(msg);
    }
  };

  const selectedStaffIds = groups.map((g) => g.staffId).filter(Boolean);

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h4 className="text-center mb-4">UPDATE FEEDBACK</h4>
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
                <option key={type.feedbackTypeId} value={String(type.feedbackTypeId)}>
                  {type.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Course:</label>
            <select name="courseId" className="form-select" value={formData.courseId || ""} disabled>
              {courses.map((course) => (
                <option key={course.course_id} value={String(course.course_id)}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Module + Staff (single) */}
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
                <option key={mod.module_id} value={String(mod.module_id)}>
                  {mod.module_name}
                </option>
              ))}
            </select>
          </div>

          {groupType === "single" && (
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
                  <option key={fac.staff_id} value={String(fac.staff_id)}>
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

        {/* Group List (multiple) */}
        {groupType === "multiple" && (
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
                {groups.map((group) => (
                  <tr key={group.feedbackGroupId ?? `${group.groupId}`}>
                    <td>{group.groupName ?? "-"}</td>
                    <td>
                      <select
                        className="form-select"
                        value={group.staffId || ""}
                        onChange={(e) => handleStaffSelect(group.groupId, e.target.value)}
                        required
                      >
                        <option value="">Select Staff</option>
                        {faculties
                          .filter(
                            (fac) =>
                              !selectedStaffIds.includes(String(fac.staff_id)) ||
                              String(fac.staff_id) === group.staffId
                          )
                          .map((fac) => (
                            <option key={fac.staff_id} value={String(fac.staff_id)}>
                              {fac.first_name} {fac.last_name}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
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

        <div className="text-center">
          <button type="submit" className="btn btn-primary me-3">
            UPDATE
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

export default UpdateFeedbackForm;
