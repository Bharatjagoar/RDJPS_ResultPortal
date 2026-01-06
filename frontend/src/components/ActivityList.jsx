import React, { useEffect, useState } from "react";
import { getTeacherActivities } from "../utils/adminApi.js";
import "./ActivityList.css";


const ActivityList = ({ teacher }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teacher) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await getTeacherActivities(teacher._id);
        setActivities(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [teacher]);

  if (!teacher) {
    return <p>Select a teacher to view activity</p>;
  }

  return (
    <div className="activity-section">
      <h3>Activity for {teacher.username}</h3>

      {loading && <p>Loading activities...</p>}

      {!loading && activities.length === 0 && (
        <p>No activities found</p>
      )}

      <ul className="activity-list">
        {activities.map((act) => (
          <li key={act._id}>
            <div>
              <strong>{act.action}</strong> – {act.entity}
            </div>
            <div className="desc">{act.description}</div>
            <div className="time">
              {new Date(act.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;
