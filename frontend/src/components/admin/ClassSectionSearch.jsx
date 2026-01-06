import { useState } from "react";
import "./ClassSectionSearch.css";

const ClassSectionSearch = ({ onSearch }) => {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!className || !section) {
      alert("Please enter both class and section");
      return;
    }

    onSearch({
      className: className.trim(),
      section: section.toUpperCase().trim(),
    });
  };

  return (
    <form className="class-section-form" onSubmit={handleSubmit}>
      <h3>Search Marks Verification</h3>

      <div className="form-group">
        <input
          type="text"
          placeholder="Class (e.g. 9)"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Section (e.g. A)"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />
      </div>

      <button type="submit">Search</button>
    </form>
  );
};

export default ClassSectionSearch;
