import '../StudentDashboard.css';
import '../StudentDashboard2.css';
import '../../../theme.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, getRemovedEvents } from '../../../utils/eventsStore';
import { getJobs, getInternships, applyForJob } from '../../../utils/jobsStore';
import { getClubs } from '../../../utils/clubsStore';
import MarksheetUpload from '../MarksheetUpload';
import AIMarksheetUpload from '../MarksheetUpload';
import { getStudentProfile, saveStudentProfile, saveSkills, saveExperiences, saveCertificates, saveMarksheets, uploadFile } from '../../../api/profiles';
import { toast } from '../../Toast';

const DEPARTMENTS = [
  'Computer Science & Engineering', 'Information Technology',
  'Electronics & Communication', 'Mechanical Engineering',
  'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Other'
];

function MeritListContent() {
  const students = [
    { rank: 1, name: 'Sneha Patel', id: 'IT2021001', dept: 'Information Technology', subject: 'Web Technologies', marks: '95/100', percent: '95%', grade: 'O', medal: 'gold' },
    { rank: 2, name: 'Rahul Sharma', id: 'CSE2021001', dept: 'Computer Science', subject: 'Data Structures', marks: '92/100', percent: '92%', grade: 'O', medal: 'silver' },
    { rank: 3, name: 'Ananya Reddy', id: 'ECE2021001', dept: 'Electronics', subject: 'Digital Circuits', marks: '91/100', percent: '91%', grade: 'O', medal: 'bronze' },
    { rank: 4, name: 'Arjun Mehta', id: 'IT2021045', dept: 'Information Technology', subject: 'Web Technologies', marks: '89/100', percent: '89%', grade: 'A+' },
    { rank: 5, name: 'Priya Singh', id: 'CSE2021002', dept: 'Computer Science', subject: 'Data Structures', marks: '88/100', percent: '88%', grade: 'A+' },
    { rank: 6, name: 'Demo Student', id: 'STU2024001', dept: 'Computer Science', subject: 'Data Structures', marks: '87/100', percent: '87%', grade: 'A+' },
    { rank: 7, name: 'Amit Kumar', id: 'CSE2021003', dept: 'Computer Science', subject: 'Data Structures', marks: '85/100', percent: '85%', grade: 'A' },
    { rank: 8, name: 'Kavya Nair', id: 'CSE2021004', dept: 'Computer Science', subject: 'Data Structures', marks: '82/100', percent: '82%', grade: 'A' },
    { rank: 9, name: 'Rohan Gupta', id: 'IT2021002', dept: 'Information Technology', subject: 'Web Technologies', marks: '78/100', percent: '78%', grade: 'B+' },
    { rank: 10, name: 'Vikram Joshi', id: 'ME2021001', dept: 'Mechanical', subject: 'Thermodynamics', marks: '76/100', percent: '76%', grade: 'B+' },
    { rank: 11, name: 'Divya Sharma', id: 'ECE2021002', dept: 'Electronics', subject: 'Digital Circuits', marks: '73/100', percent: '73%', grade: 'B' }
  ];

  return (
    <div className="merit-list-content">
      <div className="merit-header">
        <div>
          <h2>Merit List</h2>
          <p>{students.length} students</p>
        </div>
        <button className="export-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Excel
        </button>
      </div>
      <div className="merit-filters">
        <input type="text" placeholder="Search by name or enrollment..." className="merit-search" />
        <select className="merit-select"><option>All Departments</option></select>
        <select className="merit-select"><option>All Semesters</option></select>
        <button className="sort-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
          Highest First
        </button>
      </div>
      <div className="top-performers">
        {students.slice(0, 3).map(student => (
          <div key={student.rank} className="performer-card">
            <div className="medal-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill={student.medal === 'gold' ? '#fbbf24' : student.medal === 'silver' ? '#9ca3af' : '#3b82f6'}>
                <circle cx="12" cy="8" r="6"/><path d="M15.5 2L12 8l3.5 2L18 4z"/><path d="M8.5 2L12 8 8.5 10 6 4z"/>
              </svg>
            </div>
            <h3>{student.name}</h3>
            <p>{student.id}</p>
            <div className="performer-score">{student.percent}</div>
            <div className="performer-grade">{student.grade}</div>
          </div>
        ))}
      </div>
      <div className="merit-table-container">
        <table className="merit-table">
          <thead>
            <tr>
              <th>#</th>
              <th>STUDENT</th>
              <th>DEPARTMENT</th>
              <th>SUBJECT</th>
              <th>MARKS</th>
              <th>%</th>
              <th>GRADE</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.rank}>
                <td>{student.rank}</td>
                <td>
                  <div className="student-cell">
                    <strong>{student.name}</strong>
                    <span>{student.id}</span>
                  </div>
                </td>
                <td>{student.dept}</td>
                <td>{student.subject}</td>
                <td>{student.marks}</td>
                <td>{student.percent}</td>
                <td><span className={`grade-badge grade-${student.grade.replace('+', 'plus').toLowerCase()}`}>{student.grade}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MeritListContent;
