import React from "react";
import "./WingPage.css";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const WingPage = () => {
  const navigate = useNavigate();
  const { wingName } = useParams();
  const { user } = useSelector((state) => state.auth);

  const wingData = {
    primary: {
      title: "Primary Wing",
      classes: [
        { title: "Class 1", path: "/class/1" },
        { title: "Class 2", path: "/class/2" },
        { title: "Class 3", path: "/class/3" },
        { title: "Class 4", path: "/class/4" },
        { title: "Class 5", path: "/class/5" },
      ],
    },
    middle: {
      title: "Middle Wing",
      classes: [
        { title: "Class 6", path: "/class/6" },
        { title: "Class 7", path: "/class/7" },
        { title: "Class 8", path: "/class/8" },
      ],
    },
    secondary: {
      title: "Secondary Wing",
      classes: [
        { title: "Class 9", path: "/class/9" },
        { title: "Class 10", path: "/class/10" },
      ],
    },
    "senior-secondary": {
      title: "Senior Secondary Wing",
      classes: [
        { title: "Class 11", path: "/class/11" },
        { title: "Class 12", path: "/class/12" },
      ],
    },
  };

  const currentWing = wingData[wingName];

  if (!currentWing) {
    return (
      <>
        <Navbar />
        <div className="wing-container">
          <h1 className="wing-title">Wing not found</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="wing-container">
        <h1 className="wing-title">{currentWing.title}</h1>

        <div className="wing-cards">
          {currentWing.classes.map((cls, index) => (
            <div
              key={index}
              className="wing-card"
              onClick={() => {
                if (user?.classTeacherOf?.className) {
                  const allowedClass = user.classTeacherOf.className;
                  const clickedClass = cls.path.split("/").pop();

                  if (clickedClass !== allowedClass) {
                    toast.error(
                      "Access denied: Non-class teacher entry prohibited"
                    );
                    return;
                  }
                }

                navigate(cls.path);
              }}
            >
              {cls.title}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WingPage;
