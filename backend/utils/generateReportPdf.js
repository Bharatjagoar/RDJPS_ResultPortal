const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const generateReportPdf = async (student, classId, section) => {

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

  const subjectEntries = Object.entries(student.subjects || {});

  const dynamicFields = Array.from(
    new Set(
      subjectEntries.flatMap(([_, marks]) =>
        Object.keys(marks).filter(key => key !== "total")
      )
    )
  );

  const isGradeBased =
    subjectEntries.length > 0 &&
    Object.keys(subjectEntries[0][1]).length === 1 &&
    subjectEntries[0][1].hasOwnProperty("grade");

  const classNumber = parseInt(student.class);
  const isPrimary = classNumber <= 5;

  const html = await ejs.renderFile(templatePath, {
    student,
    classId,
    section,
    subjectEntries,
    dynamicFields,
    isGradeBased,
    isPrimary,
    academicSession: "2025-26",
    cssContent2,
    logoBase64 // 👈 add this
  });

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--allow-file-access-from-files"
    ]
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0"
  });

  const pdfUint8Array = await page.pdf({
    format: "A4",
    printBackground: true
  });

  await browser.close();

  // Convert Uint8Array to Buffer
  return Buffer.from(pdfUint8Array);
};

module.exports = generateReportPdf;