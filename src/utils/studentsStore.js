const STUDENTS_KEY = 'campus_students';
const EXPIRY_YEARS = 4.5;

const saveStudentsInternal = (students) => {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving students:', e);
  }
};

const getDefaultStudents = () => {
  const now = Date.now();
  return [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.sharma@campus.edu', dept: 'Computer Science', skills: 'React, Node.js, Python', experience: '2 internships', score: 95, position: 'Frontend Developer Intern', type: 'Internship', createdAt: now },
    { id: 2, name: 'Priya Patel', email: 'priya.patel@campus.edu', dept: 'Information Technology', skills: 'Java, Spring Boot, AWS', experience: '1 internship', score: 92, position: 'Software Engineer Intern', type: 'Internship', createdAt: now },
    { id: 3, name: 'Amit Kumar', email: 'amit.kumar@campus.edu', dept: 'Computer Science', skills: 'Python, Django, ML', experience: '1 project', score: 88, position: 'Cloud Solutions Intern', type: 'Internship', createdAt: now },
    { id: 4, name: 'Sneha Reddy', email: 'sneha.reddy@campus.edu', dept: 'Electronics', skills: 'JavaScript, React, CSS', experience: 'Fresher', score: 85, position: 'Frontend Developer Intern', type: 'Internship', createdAt: now },
    { id: 5, name: 'Vikram Singh', email: 'vikram.singh@campus.edu', dept: 'Computer Science', skills: 'C++, DSA, Problem Solving', experience: 'Fresher', score: 82, position: 'Software Engineer Intern', type: 'Internship', createdAt: now },
    { id: 6, name: 'Ananya Gupta', email: 'ananya.gupta@campus.edu', dept: 'Computer Science', skills: 'Java, Spring, Microservices', experience: '3 internships', score: 98, position: 'SDE-1 Campus Hire', type: 'Job', createdAt: now },
    { id: 7, name: 'Rohan Mehta', email: 'rohan.mehta@campus.edu', dept: 'Information Technology', skills: 'Python, Django, PostgreSQL', experience: '2 internships', score: 94, position: 'Systems Engineer', type: 'Job', createdAt: now },
    { id: 8, name: 'Kavya Nair', email: 'kavya.nair@campus.edu', dept: 'Computer Science', skills: 'React, Node.js, MongoDB', experience: '2 internships', score: 90, position: 'Digital Trainee', type: 'Job', createdAt: now },
    { id: 9, name: 'Arjun Verma', email: 'arjun.verma@campus.edu', dept: 'Electronics', skills: 'Java, Spring Boot, MySQL', experience: '1 internship', score: 87, position: 'SDE-1 Campus Hire', type: 'Job', createdAt: now },
    { id: 10, name: 'Divya Shah', email: 'divya.shah@campus.edu', dept: 'Computer Science', skills: 'Python, Flask, Docker', experience: '1 internship', score: 84, position: 'Systems Engineer', type: 'Job', createdAt: now }
  ];
};

export const getStudents = () => {
  try {
    const stored = localStorage.getItem(STUDENTS_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const now = Date.now();
      const expiryTime = EXPIRY_YEARS * 365 * 24 * 60 * 60 * 1000;
      
      const validStudents = data.filter(student => {
        if (!student.createdAt) return true;
        return (now - student.createdAt) < expiryTime;
      });
      
      if (validStudents.length !== data.length && validStudents.length > 0) {
        saveStudentsInternal(validStudents);
      }
      
      if (validStudents.length > 0) {
        return validStudents;
      }
    }
  } catch (e) {
    console.error('Error loading students:', e);
    localStorage.removeItem(STUDENTS_KEY);
  }
  
  const defaultStudents = getDefaultStudents();
  saveStudentsInternal(defaultStudents);
  return defaultStudents;
};

export const saveStudents = (students) => {
  const studentsWithTimestamp = students.map(student => ({
    ...student,
    createdAt: student.createdAt || Date.now()
  }));
  saveStudentsInternal(studentsWithTimestamp);
};
