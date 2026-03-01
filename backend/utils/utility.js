const extractClassAndSection = (rawValue) => {
  if (!rawValue) return { className: null, section: null };

  const normalized = rawValue
    .toString()
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  // Handles: "9-A", "9 A", "9A"
  const match = normalized.match(/^(\d{1,2})\s*-?\s*([A-Z])$/);

  if (!match) return { className: null, section: null };

  return {
    className: match[1],
    section: match[2]
  };
};


const getSectionFullName = (classNumber, rawSection) => {
  if (!classNumber || !rawSection) {
    return null;
  }

  const section = rawSection.toString().trim().toUpperCase();
  const cls = Number(classNumber);

  // For Class 6–10
  if (cls >= 6 && cls <= 10) {
    const sectionMap = {
      T: "Tulip",
      L: "Lotus",
      D: "Dahlia",
      M: "Mogra",
    };

    return sectionMap[section] || null;
  }

  // For Class 11–12
  if (cls === 11 || cls === 12) {
    const streamMap = {
      S: "Science",
      C: "Commerce",
      A: "Arts",
    };

    return streamMap[section] || null;
  }

  return null;
};

const getAcademicSession = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 3 = April

  // If Jan–March → session started last year
  const startYear = month < 3 ? year - 1 : year;
  const endYearShort = (startYear + 1).toString().slice(-2);

  return `${startYear}-${endYearShort}`;
};



module.exports ={
    extractClassAndSection,
    getSectionFullName,
    getAcademicSession
}