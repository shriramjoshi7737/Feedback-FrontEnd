import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

function FeedbackTypeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isUpdate = Boolean(id);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    feedbackTypeTitle: "",
    feedbackTypeDescription: "",
    isModule: false,
    group: "",
    isStaff: false,
    isSession: false,
    behaviour: false,
  });

  const [questions, setQuestions] = useState([]);

  // Restore from AddQuestionForm if navigated with state
  useEffect(() => {
    if (location.state?.formData) {
      setFormData(location.state.formData);
    }
    if (location.state?.questions) {
      setQuestions(location.state.questions);
    }
  }, [location.state]);

  // ✅ Fetch only if updating and NOT coming back from AddQuestionForm
  useEffect(() => {
    if (isUpdate && !location.state) {
      Api.get(`FeedbackType/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          const data = res.data;
          setFormData({
            feedbackTypeTitle: data.feedbackTypeTitle || "",
            feedbackTypeDescription: data.feedbackTypeDescription || "",
            isModule: data.isModule || false,
            group: data.group || "",
            isStaff: data.isStaff || false,
            isSession: data.isSession || false,
            behaviour: data.behaviour || false,
          });
          setQuestions(
            (data.questions || []).map((q) => ({
              question: q.question,
              questionType: q.questionType,
            }))
          );
        })
        .catch((err) => {
          console.error("Error fetching feedback type:", err.response || err);
          toast.error("❌ Failed to fetch feedback type data. Check backend/API.");
        });
    }
  }, [id, isUpdate, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      feedbackTypeTitle: formData.feedbackTypeTitle,
      feedbackTypeDescription: formData.feedbackTypeDescription,
      isModule: formData.isModule,
      group: formData.group,
      isStaff: formData.isStaff,
      isSession: formData.isSession,
      behaviour: formData.behaviour,
      questions: questions, // ✅ Keeps newly added questions
    };

    try {
      if (isUpdate) {
        await Api.put(`FeedbackType/${id}`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("✅ Feedback Type updated successfully!");
      } else {
        await Api.post("FeedbackType/CreateFeedbackType", payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("✅ Feedback Type created successfully!");
      }

      setTimeout(() => {
        navigate("/app/feedback-type-list");
      }, 1200);
    } catch (error) {
      console.error("Error saving feedback type:", error.response || error);
      toast.error("❌ Failed to save feedback type.");
    }
  };

  return (
    <div className="container">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />

      <h2 className="text-center mt-3 mb-3">
        {isUpdate ? "Update Feedback Type" : "Create Feedback Type"}
      </h2>

      <form className="p-4 border shadow-sm bg-light" onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="feedbackTypeTitle"
              value={formData.feedbackTypeTitle}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter title"
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label">Module</label>
            <select
              className="form-select"
              name="isModule"
              value={formData.isModule ? "Yes" : "No"}
              onChange={(e) =>
                setFormData({ ...formData, isModule: e.target.value === "Yes" })
              }
            >
              <option value="" disabled hidden>
                Select Module
              </option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <label className="form-label">Description</label>
            <input
              type="text"
              name="feedbackTypeDescription"
              value={formData.feedbackTypeDescription}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter description"
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label">Group</label>
            <select
              className="form-select"
              name="group"
              value={formData.group}
              onChange={handleChange}
            >
              <option value="">Select Group</option>
              <option>Single</option>
              <option>Multiple</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 mb-2">
            <label className="form-label">Staff</label>
            <select
              className="form-select"
              name="isStaff"
              value={formData.isStaff ? "Yes" : "No"}
              onChange={(e) =>
                setFormData({ ...formData, isStaff: e.target.value === "Yes" })
              }
            >
              <option value="" disabled hidden>
                Select Staff
              </option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <label className="form-label">Session</label>
            <select
              className="form-select"
              name="isSession"
              value={formData.isSession ? "Yes" : "No"}
              onChange={(e) =>
                setFormData({ ...formData, isSession: e.target.value === "Yes" })
              }
            >
              <option value="" disabled hidden>
                Select Session
              </option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <label className="form-label">Behaviour</label>
            <select
              className="form-select"
              name="behaviour"
              value={formData.behaviour ? "Compulsory" : "Optional"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  behaviour: e.target.value === "Compulsory",
                })
              }
            >
              <option>Compulsory</option>
              <option>Optional</option>
            </select>
          </div>
        </div>

        {/* Questions Section */}
        <h5 className="mt-4">Questions</h5>
        <button
          type="button"
          className="btn btn-primary mb-3"
          onClick={() =>
            navigate("/app/add-question" + (isUpdate ? `/${id}` : ""), {
              state: { formData, questions, isUpdate, id },
            })
          }
        >
          Add Questions
        </button>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.length > 0 ? (
              questions.map((q, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{q.question}</td>
                  <td>{q.questionType}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        setQuestions(questions.filter((_, i) => i !== index))
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No questions added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="text-center mb-4">
          <button type="submit" className="btn btn-success">
            {isUpdate ? "Update" : "Submit"}
          </button>
          <button
            type="button"
            className="btn btn-danger ms-2"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeedbackTypeForm;
