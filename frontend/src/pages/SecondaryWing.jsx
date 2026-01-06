import React from "react";
import "./SecondaryWing.css";
import { useNavigate } from "react-router-dom";

const SecondaryWing = () => {
    const navigate = useNavigate();

    const classes = [
        { title: "Class 9", path: "/class/9" },
        { title: "Class 10", path: "/class/10" }
    ];

    return (
        <div className="secondary-container">
            <h1 className="secondary-title">Secondary Wing</h1>

            <div className="secondary-cards">
                {classes.map((cls, index) => (
                    <div
                        key={index}
                        className="secondary-card"
                        onClick={() => navigate(cls.path)}
                    >
                        {cls.title}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SecondaryWing;
