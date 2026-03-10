import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "./PerformaUploadPage.css";
import { api } from "./utils";

const PerformaUploadPage = () => {

    const { classId } = useParams();

    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [performaData, setPerformaData] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));

    const className = user?.classTeacherOf?.className;
    const section = user?.classTeacherOf?.section;

    useEffect(() => {

        const fetchPerforma = async () => {

            try {

                const user = JSON.parse(localStorage.getItem("user"));

                const className = user?.classTeacherOf?.className;
                const section = user?.classTeacherOf?.section;

                const res = await api.get(`/performa/get/${className}/${section}`);
                console.log(res.data)
                setPerformaData(res.data);

            } catch (err) {

                console.error(err);

            }

        };

        fetchPerforma();

    }, []);
    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);

        const reader = new FileReader();

        reader.onload = (event) => {

            const data = event.target.result;

            const workbook = XLSX.read(data, { type: "binary" });

            const subjectsData = [];

            workbook.SheetNames.forEach((sheetName) => {

                const sheet = workbook.Sheets[sheetName];

                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                if (!rows.length) return;

                const headers = rows[4];     // header row
                const students = rows.slice(5);

                const parsedStudents = students.map((row) => {

                    const obj = {};

                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });

                    return obj;

                });

                subjectsData.push({
                    subject: sheetName,
                    students: parsedStudents
                });

            });

            console.log("Parsed Performa Data:", subjectsData);

            setParsedData(subjectsData);

        };

        reader.readAsBinaryString(uploadedFile);
    };



    const handleUpload = async () => {

        if (!parsedData.length) {
            toast.error("No data to upload");
            return;
        }

        if (!className || !section) {
            toast.error("Class or Section not assigned to teacher");
            return;
        }
        try {
            console.log(parsedData);
            await api.post(`/performa/upload/${className}/${section}`, {
                data: parsedData
            });

            toast.success("Performa uploaded successfully");
        } catch (err) {

            console.error(err);
            toast.error("Upload failed");

        }
    };



    return (
        <>
            <Navbar />

            <div className="performa-container">

                <h2 className="performa-title">Upload Performa (Excel)</h2>

                <div className="performa-upload-box">

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                    />

                    <button
                        className="performa-upload-btn"
                        onClick={handleUpload}
                    >
                        Upload
                    </button>

                </div>

                {parsedData.length > 0 && (
                    <div className="preview-box">

                        <h3>Preview</h3>

                        {parsedData.map((subject, index) => {

                            const headers = Object.keys(subject.students[0] || {});

                            return (
                                <div key={index} className="subject-preview">

                                    <h4>{subject.subject}</h4>
                                    <p>Students Loaded: {subject.students.length}</p>

                                    <div className="performa-table-container">

                                        <table className="performa-table">

                                            <thead>
                                                <tr>
                                                    {headers.map((header, i) => (
                                                        <th key={i}>{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {subject.students.map((student, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        {headers.map((header, colIndex) => (
                                                            <td key={colIndex}>{student[header]}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>

                                        </table>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

                {performaData.length > 0 && (

                    <div className="preview-box">

                        <h3>Stored Performa Data</h3>

                        {performaData.map((subjectBlock, index) => {

                            const headers = subjectBlock.headers;

                            return (

                                <div key={index} className="subject-preview">

                                    <h4>{subjectBlock.subject}</h4>

                                    <div className="performa-table-container">

                                        <table className="performa-table">

                                            <thead>
                                                <tr>
                                                    <th>Roll No</th>
                                                    <th>Name</th>
                                                    {headers.map((h, i) => (
                                                        <th key={i}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>

                                            <tbody>

                                                {subjectBlock.students.map((student, rowIndex) => (

                                                    <tr key={rowIndex}>

                                                        <td>{student.rollNo}</td>
                                                        <td>{student.name}</td>

                                                        {headers.map((h, colIndex) => (
                                                            <td key={colIndex}>
                                                                {student.marks[h]}
                                                            </td>
                                                        ))}

                                                    </tr>

                                                ))}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}


            </div>
        </>
    );
};

export default PerformaUploadPage;