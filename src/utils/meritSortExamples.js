/**
 * Merit-Based Sorting - Usage Examples
 * 
 * This file demonstrates how to use the merit-based sorting system
 */

import { 
  sortStudentsByMerit, 
  getStudentRank,
  calculateCGPA,
  calculateTrend 
} from './meritSort';

/**
 * Example 1: Basic Usage - Sort Students by Merit
 */
export async function exampleBasicSorting() {
  const students = [
    {
      id: 'kf23cs164',
      name: 'Rahul Sharma',
      sgpaList: [8.4, 8.7, 9.1]
    },
    {
      id: 'kf23cs165',
      name: 'Priya Patel',
      sgpaList: [8.5, 8.6, 9.1]
    },
    {
      id: 'kf23cs166',
      name: 'Amit Kumar',
      sgpaList: [9.0, 8.8, 8.9]
    }
  ];

  const rankedStudents = await sortStudentsByMerit(students);
  
  console.log('Ranked Students:');
  rankedStudents.forEach(student => {
    console.log(`Rank ${student.rank}: ${student.name}`);
    console.log(`  CGPA: ${student.cgpa.toFixed(2)}`);
    console.log(`  Current SGPA: ${student.currentSGPA.toFixed(2)}`);
    console.log(`  Trend: ${student.trend.toFixed(3)}`);
    console.log(`  MicroPrecision: ${student.microPrecision.toFixed(10)}`);
  });

  return rankedStudents;
}

/**
 * Example 2: Get Individual Student Rank
 */
export async function exampleGetStudentRank() {
  const allStudents = [
    { id: 'kf23cs164', name: 'Rahul', sgpaList: [8.4, 8.7, 9.1] },
    { id: 'kf23cs165', name: 'Priya', sgpaList: [8.5, 8.6, 9.1] },
    { id: 'kf23cs166', name: 'Amit', sgpaList: [9.0, 8.8, 8.9] }
  ];

  const targetStudent = { id: 'kf23cs164', name: 'Rahul', sgpaList: [8.4, 8.7, 9.1] };
  
  const studentWithRank = await getStudentRank(targetStudent, allStudents);
  
  console.log(`${studentWithRank.name} is ranked #${studentWithRank.rank}`);
  
  return studentWithRank;
}

/**
 * Example 3: First Semester Students (No Trend)
 */
export async function exampleFirstSemester() {
  const students = [
    { id: 'kf24cs101', name: 'New Student 1', sgpaList: [9.2] },
    { id: 'kf24cs102', name: 'New Student 2', sgpaList: [9.2] },
    { id: 'kf24cs103', name: 'New Student 3', sgpaList: [8.8] }
  ];

  const rankedStudents = await sortStudentsByMerit(students);
  
  console.log('First Semester Rankings (Trend = 0 for all):');
  rankedStudents.forEach(student => {
    console.log(`Rank ${student.rank}: ${student.name} - CGPA: ${student.cgpa.toFixed(2)}`);
  });

  return rankedStudents;
}

/**
 * Example 4: Tie-Breaking Scenario
 */
export async function exampleTieBreaking() {
  // Two students with identical academic records
  const students = [
    { id: 'kf23cs201', name: 'Student A', sgpaList: [8.5, 8.7, 9.0] },
    { id: 'kf23cs202', name: 'Student B', sgpaList: [8.5, 8.7, 9.0] }
  ];

  const rankedStudents = await sortStudentsByMerit(students);
  
  console.log('Tie-Breaking with MicroPrecision:');
  rankedStudents.forEach(student => {
    console.log(`Rank ${student.rank}: ${student.name} (ID: ${student.id})`);
    console.log(`  MicroPrecision: ${student.microPrecision}`);
  });

  return rankedStudents;
}

/**
 * Example 5: Integration with Student Store
 */
export async function exampleWithStudentStore(studentsFromStore) {
  // Assuming students from store have sgpaList field
  // If not, you need to add it to your student data model
  
  const studentsWithSGPA = studentsFromStore.map(student => ({
    ...student,
    // Example: If you have semester-wise marks, convert to SGPA
    sgpaList: student.sgpaList || [8.5, 8.7, 9.0] // Default for demo
  }));

  const rankedStudents = await sortStudentsByMerit(studentsWithSGPA);
  
  return rankedStudents;
}

/**
 * Example 6: Display Merit List Component Data
 */
export async function prepareMeritListData(students) {
  const rankedStudents = await sortStudentsByMerit(students);
  
  return rankedStudents.map(student => ({
    rank: student.rank,
    id: student.id,
    name: student.name,
    cgpa: student.cgpa.toFixed(2),
    currentSGPA: student.currentSGPA.toFixed(2),
    trend: student.trend >= 0 ? `+${student.trend.toFixed(2)}` : student.trend.toFixed(2),
    department: student.dept || student.department,
    email: student.email
  }));
}

/**
 * Example 7: Filter Top Performers
 */
export async function getTopPerformers(students, topN = 10) {
  const rankedStudents = await sortStudentsByMerit(students);
  return rankedStudents.slice(0, topN);
}

/**
 * Example 8: Calculate Statistics
 */
export async function calculateMeritStatistics(students) {
  const rankedStudents = await sortStudentsByMerit(students);
  
  const cgpaList = rankedStudents.map(s => s.cgpa);
  const avgCGPA = cgpaList.reduce((a, b) => a + b, 0) / cgpaList.length;
  const maxCGPA = Math.max(...cgpaList);
  const minCGPA = Math.min(...cgpaList);
  
  return {
    totalStudents: rankedStudents.length,
    averageCGPA: avgCGPA.toFixed(2),
    highestCGPA: maxCGPA.toFixed(2),
    lowestCGPA: minCGPA.toFixed(2),
    topRanker: rankedStudents[0]
  };
}
