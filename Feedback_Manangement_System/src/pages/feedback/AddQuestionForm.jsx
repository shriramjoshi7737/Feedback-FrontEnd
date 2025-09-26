import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

function AddQuestionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // FeedbackType ID for update
  const isUpdate = Boolean(id);

  const formData = location.state?.formData || {};
  const initialQuestions = location.state?.questions || [];

  const [text, setText] = useState("");
  const [type, setType] = useState("");
  const [questions, setQuestions] = useState(initialQuestions);

  const handleAdd = () => {
    if (!text.trim() || !type) {
      toast.warning("⚠️ Please enter question text and type");
      return;
    }

    // ✅ Match backend DTO (question, questionType)
    const newQuestion = {
      question: text,
      questionType: type,
    };

    const updatedQuestions = [...questions, newQuestion];

    // Show success toast
    toast.success("✅ Question added successfully!");

    // Navigate back to FeedbackTypeForm with updated questions
    setTimeout(() => {
      navigate("/app/feedback-type-form" + (isUpdate ? `/${id}` : ""), {
        state: { formData, questions: updatedQuestions, isUpdate, id },
      });
    }, 800); // Small delay so user sees toast
  };

  return (
    <div className="container mt-4 p-4 border rounded bg-light">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />

      <h4 className="text-center mb-4">Add Question</h4>

      <div className="mb-3">
        <label className="form-label">Question</label>
        <input
          type="text"
          className="form-control"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Type</label>
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="mcq">MCQ</option>
          <option value="rating">Rating</option>
          <option value="descriptive">Descriptive</option>
        </select>
      </div>

      <div className="text-center">
        <button className="btn btn-primary me-2" onClick={handleAdd}>
          Add & Back
        </button>
        <button className="btn btn-danger" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AddQuestionForm;
