/**
 * Complete Integration Example
 * Marksheet Extraction → SGPA Calculation → Merit Ranking
 */

import React, { useState, useEffect } from 'react';
import MarksheetUpload from './components/Student/MarksheetUpload';
import ManualMarksheetEntry from './components/Student/ManualMarksheetEntry';
import MeritList from './components/Teacher/MeritList';
import { sortStudentsByMerit } from './utils/meritSort';

/**
 * Example 1: Student Profile with Marksheet Upload
 */
export function StudentProfileWithMarksheet() {
  const [studentData, setStudentData] = useState({
    id: 'kf23cs164',
    name: 'Rahul Sharma',
    sgpaList: []
  });

  const handleMarksheetDataExtracted = (data) => {
    // Add new SGPA to student's list
    const updatedSGPAList = [...studentData.sgpaList, data.sgpa];
    
    setStudentData({
      ...studentData,
      sgpaList: updatedSGPAList
    });

    // Save to localStorage or Firebase
    saveStudentData({
      ...studentData,
      sgpaList: updatedSGPAList
    });

    alert(`Semester ${data.semester} SGPA (${data.sgpa}) added successfully!`);
  };

  return (
    <div>
      <h2>Upload Your Marksheets</h2>
      
      {/* Option 1: AI-Powered Upload */}
      <MarksheetUpload onDataExtracted={handleMarksheetDataExtracted} />
      
      {/* Option 2: Manual Entry */}
      <ManualMarksheetEntry onDataSaved={handleMarksheetDataExtracted} />
      
      {/* Display Current SGPA List */}
      <div className="sgpa-summary">
        <h3>Your Academic Record</h3>
        {studentData.sgpaList.map((sgpa, index) => (
          <div key={index}>
            Semester {index + 1}: {sgpa}
          </div>
        ))}
        <div>
          <strong>CGPA: {calculateCGPA(studentData.sgpaList)}</strong>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 2: Teacher Dashboard with Merit List
 */
export function TeacherDashboardWithMerit() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentsData();
  }, []);

  const loadStudentsData = async () => {
    // Load from Firebase or localStorage
    const studentsData = await fetchAllStudents();
    setStudents(studentsData);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Merit-Based Student Rankings</h2>
      <MeritList students={students} />
    </div>
  );
}

/**
 * Example 3: Complete Flow - Upload to Ranking
 */
export function CompleteAcademicSystem() {
  const [allStudents, setAllStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Step 1: Student uploads marksheet
  const handleNewMarksheet = async (studentId, semesterData) => {
    // Find student
    const student = allStudents.find(s => s.id === studentId);
    
    if (student) {
      // Add new SGPA
      student.sgpaList.push(semesterData.sgpa);
      
      // Step 2: Recalculate rankings
      const rankedStudents = await sortStudentsByMerit(allStudents);
      
      // Step 3: Update state
      setAllStudents(rankedStudents);
      
      // Step 4: Save to database
      await saveToDatabase(rankedStudents);
      
      // Step 5: Notify student of new rank
      const updatedStudent = rankedStudents.find(s => s.id === studentId);
      notifyStudent(updatedStudent, `Your new rank is #${updatedStudent.rank}`);
    }
  };

  return (
    <div>
      {/* Student View */}
      <StudentSection onMarksheetUpload={handleNewMarksheet} />
      
      {/* Teacher View */}
      <TeacherSection students={allStudents} />
    </div>
  );
}

/**
 * Example 4: Real-time Rank Updates
 */
export function RealTimeRankingSystem() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Listen for new marksheet uploads
    const unsubscribe = subscribeToMarksheetUploads((newData) => {
      updateRankingsRealTime(newData);
    });

    return () => unsubscribe();
  }, []);

  const updateRankingsRealTime = async (newMarksheetData) => {
    // Get updated student list
    const updatedStudents = await fetchAllStudents();
    
    // Recalculate rankings
    const rankedStudents = await sortStudentsByMerit(updatedStudents);
    
    // Update UI
    setStudents(rankedStudents);
    
    // Broadcast to all connected clients
    broadcastRankingUpdate(rankedStudents);
  };

  return <MeritList students={students} />;
}

/**
 * Helper Functions
 */

function calculateCGPA(sgpaList) {
  if (!sgpaList || sgpaList.length === 0) return 0;
  const sum = sgpaList.reduce((acc, sgpa) => acc + sgpa, 0);
  return (sum / sgpaList.length).toFixed(2);
}

async function saveStudentData(studentData) {
  // Save to localStorage
  localStorage.setItem(`student_${studentData.id}`, JSON.stringify(studentData));
  
  // Or save to Firebase
  // await firebase.firestore().collection('students').doc(studentData.id).set(studentData);
}

async function fetchAllStudents() {
  // Fetch from localStorage
  const students = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('student_')) {
      const data = JSON.parse(localStorage.getItem(key));
      students.push(data);
    }
  }
  return students;
  
  // Or fetch from Firebase
  // const snapshot = await firebase.firestore().collection('students').get();
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function saveToDatabase(students) {
  // Batch save to Firebase
  // const batch = firebase.firestore().batch();
  // students.forEach(student => {
  //   const ref = firebase.firestore().collection('students').doc(student.id);
  //   batch.set(ref, student);
  // });
  // await batch.commit();
  
  // Or save to localStorage
  students.forEach(student => {
    localStorage.setItem(`student_${student.id}`, JSON.stringify(student));
  });
}

function notifyStudent(student, message) {
  // Send notification
  console.log(`Notification to ${student.name}: ${message}`);
  
  // Could use:
  // - Email notification
  // - Push notification
  // - In-app notification
  // - SMS
}

function subscribeToMarksheetUploads(callback) {
  // Subscribe to Firebase real-time updates
  // return firebase.firestore().collection('marksheets')
  //   .onSnapshot(snapshot => {
  //     snapshot.docChanges().forEach(change => {
  //       if (change.type === 'added') {
  //         callback(change.doc.data());
  //       }
  //     });
  //   });
  
  // Or use custom event system
  window.addEventListener('marksheetUploaded', (e) => callback(e.detail));
  return () => window.removeEventListener('marksheetUploaded', callback);
}

function broadcastRankingUpdate(rankedStudents) {
  // Broadcast to all clients
  window.dispatchEvent(new CustomEvent('rankingsUpdated', { 
    detail: rankedStudents 
  }));
}

/**
 * Example 5: Bulk Marksheet Processing
 */
export async function processBulkMarksheets(studentId, marksheetFiles) {
  const results = [];
  
  for (let i = 0; i < marksheetFiles.length; i++) {
    const file = marksheetFiles[i];
    
    // Extract data
    const result = await extractMarksheetData(file);
    
    if (result.success) {
      results.push({
        semester: i + 1,
        sgpa: result.data.sgpa,
        subjects: result.data.subjects
      });
    }
  }
  
  // Build complete SGPA list
  const sgpaList = results.map(r => r.sgpa);
  
  // Update student record
  await updateStudentRecord(studentId, { sgpaList });
  
  // Recalculate rankings
  const allStudents = await fetchAllStudents();
  const rankedStudents = await sortStudentsByMerit(allStudents);
  
  return rankedStudents.find(s => s.id === studentId);
}

/**
 * Example 6: Export Merit List
 */
export async function exportMeritList(format = 'csv') {
  const students = await fetchAllStudents();
  const rankedStudents = await sortStudentsByMerit(students);
  
  if (format === 'csv') {
    const csv = convertToCSV(rankedStudents);
    downloadFile(csv, 'merit-list.csv', 'text/csv');
  } else if (format === 'pdf') {
    const pdf = await generatePDF(rankedStudents);
    downloadFile(pdf, 'merit-list.pdf', 'application/pdf');
  }
}

function convertToCSV(students) {
  const headers = ['Rank', 'Student ID', 'Name', 'CGPA', 'Current SGPA', 'Trend'];
  const rows = students.map(s => [
    s.rank,
    s.id,
    s.name,
    s.cgpa.toFixed(2),
    s.currentSGPA.toFixed(2),
    s.trend.toFixed(2)
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export {
  calculateCGPA,
  saveStudentData,
  fetchAllStudents,
  saveToDatabase,
  notifyStudent
};
