import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export const generateReportCard = (student, classId, section) => {
    const doc = new jsPDF();

    // =========================
    // HEADER
    // =========================
    doc.setFontSize(16);
    doc.text("RUKMANI DEVI JAIPURIA PUBLIC SCHOOL", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.text("Student Academic Report Card", 105, 22, { align: "center" });

    // =========================
    // STUDENT INFO
    // =========================
    doc.setFontSize(11);
    doc.text(`Name: ${student.name}`, 15, 35);
    doc.text(`Class: ${classId} ${section}`, 15, 42);
    doc.text(`Roll No: ${student.examRollNo}`, 15, 49);

    // =========================
    // SUBJECT TABLE
    // =========================
    const tableBody = [];
    let grandTotal = 0;
    let subjectCount = 0;
    let result = "PASS";

    Object.entries(student.subjects || {}).forEach(([subject, marks]) => {
        const internals = marks.internals || 0;
        const mid = marks.midTerm || 0;
        const final = marks.finalTerm || 0;
        const total = internals + mid + final;

        if (internals || mid || final) {
            subjectCount++;
            grandTotal += total;

            if (total < 33) result = "FAIL";

            tableBody.push([
                subject,
                internals,
                mid,
                final,
                total
            ]);
        }
    });

    autoTable(doc, {
        startY: 60,
        head: [["Subject", "Internals (20)", "Mid (30)", "Final (50)", "Total (100)"]],
        body: tableBody
    });


    // =========================
    // GRAND TOTAL & RESULT
    // =========================
    const maxTotal = subjectCount * 100;
    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(11);
    doc.text(`Grand Total: ${grandTotal} / ${maxTotal}`, 15, finalY);
    doc.text(`Result: ${result}`, 15, finalY + 8);

    // =========================
    // FOOTER
    // =========================
    doc.setFontSize(9);
    doc.text(
        "This is a computer-generated report card. Signature not required.",
        105,
        285,
        { align: "center" }
    );

    // =========================
    // DOWNLOAD
    // =========================
    doc.save(`${student.name}_Report_Card.pdf`);
};
