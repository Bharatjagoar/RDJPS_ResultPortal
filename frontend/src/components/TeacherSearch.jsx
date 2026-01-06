import React, { useState } from "react";
import { searchTeachers } from "../utils/adminApi";
import "./TeacherSearch.css";


const TeacherSearch = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await searchTeachers(query);
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search teacher by username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Searching...</p>}

      <ul className="teacher-list">
        {results.map((teacher) => (
          <li
            key={teacher._id}
            onClick={() => onSelect(teacher)}
          >
            <strong>{teacher.username}</strong>
            <span>{teacher.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherSearch;
