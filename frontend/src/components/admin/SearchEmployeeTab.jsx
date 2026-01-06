import { useState } from "react";
import TeacherSearch from "../TeacherSearch";
import ActivityList from "../ActivityList";

const SearchEmployeeTab = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  return (
    <>
      <TeacherSearch onSelect={setSelectedTeacher} />
      <ActivityList teacher={selectedTeacher} />
    </>
  );
};

export default SearchEmployeeTab;
