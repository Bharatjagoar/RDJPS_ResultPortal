import React from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const HomePage = () => {
  const navigate = useNavigate();

  const wings = [
    { title: "Primary Wing", path: "/primary" },
    { title: "Middle Wing", path: "/middle" },
    { title: "Secondary Wing", path: "/secondary" },
    { title: "Senior Secondary Wing", path: "/senior-secondary" },
  ];

  return (
    <>
    <Navbar/>
    <div className="home-container">
      
      <h1 className="home-title">Rukmani Devi Jaipuria Public School</h1>

      <div className="cards-container">
        {wings.map((wing, index) => (
          <div
            key={index}
            className="wing-card"
            onClick={() => navigate(wing.path)}
          >
            {wing.title}
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default HomePage;
