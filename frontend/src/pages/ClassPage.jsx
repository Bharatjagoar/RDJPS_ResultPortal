import React from "react";
import "./ClassPage.css";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const ClassPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();

  const options = [
    // { title: "Upload Marks Manually", path: `/class/${classId}/manual` },
    { title: "Upload Marks via Excel", path: `/class/${classId}/excel` },
    { title: "Student Records", path: `/class/${classId}/records`}
  ];

  return (
    <>
      <Navbar />
      <div className="class-container">
        <h1 className="class-title">Class {classId}</h1>

        <div className="class-cards">
          {options.map((opt, index) => (
            <div
              key={index}
              className="class-card"
              onClick={() => navigate(opt.path)}
            >
              {opt.title}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ClassPage;