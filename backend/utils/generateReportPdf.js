const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const { extractClassAndSection, getSectionFullName, getAcademicSession } = require("../utils/utility");


let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--allow-file-access-from-files"
      ]
    });

    console.log("✅ Puppeteer launched once");

    browserInstance.on("disconnected", () => {
      console.log("⚠ Puppeteer browser disconnected. Resetting instance.");
      browserInstance = null;
    });
  }

  return browserInstance;
}
const templatePath = path.join(__dirname, "../templates/reportCard.ejs");

const cssFilePath = path.join(__dirname, "../public/ReportCard.css");
const cssContent = fs.readFileSync(cssFilePath, "utf8");
const logoFilePath = path.join(__dirname, "../public/logo.jpeg");
const logoBase64 = fs.readFileSync(logoFilePath).toString("base64");
const bgFilePath = path.join(__dirname, "../public/background.jpg");
const bgBase64 = fs.readFileSync(bgFilePath).toString("base64");

const cssContent2 = cssContent.replace(
  /background-image:\s*url\([^)]+\);/,
  `background-image: url("data:image/png;base64,${bgBase64}");`
);


const generateReportPdf = async (student, classId, section) => {



  const subjectEntries = Object.entries(student.subjects || {});

  const dynamicFields = Array.from(
    new Set(
      subjectEntries.flatMap(([_, marks]) =>
        Object.keys(marks).filter(
          key => key.toLowerCase() !== "total"
        )
      )
    )
  );
  console.log("Sample marks keys:", Object.keys(subjectEntries[0]?.[1] || {}));

  const isGradeBased =
    subjectEntries.length > 0 &&
    Object.keys(subjectEntries[0][1]).length === 1 &&
    subjectEntries[0][1].hasOwnProperty("grade");

  const classNumber = parseInt(student.class);

  const REPORT_WEIGHTAGE = {
    6: { internals: 30, midterm: 20, finalterm: 50, total: 100 },
    7: { internals: 30, midterm: 20, finalterm: 50, total: 100 },
    8: { internals: 30, midterm: 20, finalterm: 50, total: 100 },
    9: { internals: 20, midterm: 30, finalterm: 50, total: 100 },
    10: { internals: 20, midterm: 30, finalterm: 50, total: 100 },
    11: { ut: 10, midterm: "20/25", finalterm: "40/45", project: 20, practical: 30, total: 100 }
  };


  const weightage = REPORT_WEIGHTAGE[classNumber] || {};
  const { className: excelClass, section: excelSection } = extractClassAndSection(student.class);
  const isPrimary = classNumber <= 5;
  section = getSectionFullName(excelClass, excelSection);
  classId = excelClass;
  // Per-subject max map for split columns (Class 11)
  const subjectMaxMap = {};

  if (classNumber === 11) {
    subjectEntries.forEach(([subject, marks]) => {
      const keys = Object.keys(marks).map(k => k.toLowerCase());
      const hasProject = keys.includes("project") || keys.includes("asl");
      const hasPractical = keys.includes("practical");

      subjectMaxMap[subject] = {
        midterm: hasProject ? 25 : 20,
        finalterm: hasProject ? 45 : 40,
      };
    });
  }

  console.log(student.class)
  console.log("Dynamic Fields:", dynamicFields);
  const html = await ejs.renderFile(templatePath, {
    student,
    classId,
    section,
    subjectEntries,
    dynamicFields,
    weightage,
    subjectMaxMap,   // 👈 ADD THIS
    isGradeBased,
    isPrimary,
    academicSession: getAcademicSession(),
    cssContent2,
    logoBase64
  });

  const browser = await getBrowser();

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(60000);
  await page.setDefaultTimeout(60000);

  try {
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    const pdfUint8Array = await page.pdf({
      format: "A4",
      printBackground: true
    });

    return Buffer.from(pdfUint8Array);

  } finally {
    await page.close();
  }
};

module.exports = generateReportPdf;