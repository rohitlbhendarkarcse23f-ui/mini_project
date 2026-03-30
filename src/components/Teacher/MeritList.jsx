import React, { useState, useEffect } from 'react';
import { sortStudentsByMerit } from '../../utils/meritSort';
import './MeritList.css';

const MeritList = ({ students }) => {
  const [rankedStudents, setRankedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortCriteria, setSortCriteria] = useState('merit');

  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      try {
        const ranked = await sortStudentsByMerit(students);
        setRankedStudents(ranked);
      } catch (error) {
        console.error('Error calculating rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (students && students.length > 0) {
      loadRankings();
    }
  }, [students]);

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return '📈';
    if (trend < 0) return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="merit-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Calculating merit rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="merit-list-container">
      <div className="merit-header">
        <h2>🏆 Merit-Based Student Rankings</h2>
        <p className="merit-subtitle">
          Ranked by: CGPA → Current SGPA → Academic Trend → Deterministic Tie-Breaker
        </p>
      </div>

      <div className="merit-stats">
        <div className="stat-box">
          <span className="stat-label">Total Students</span>
          <span className="stat-value">{rankedStudents.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Top CGPA</span>
          <span className="stat-value">
            {rankedStudents[0]?.cgpa.toFixed(2) || 'N/A'}
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Average CGPA</span>
          <span className="stat-value">
            {(rankedStudents.reduce((sum, s) => sum + s.cgpa, 0) / rankedStudents.length).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="merit-table-wrapper">
        <table className="merit-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>CGPA</th>
              <th>Current SGPA</th>
              <th>Trend</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {rankedStudents.map((student) => (
              <tr key={student.id} className="merit-row">
                <td>
                  <span className={`rank-badge ${getRankBadgeClass(student.rank)}`}>
                    {student.rank === 1 && '🥇 '}
                    {student.rank === 2 && '🥈 '}
                    {student.rank === 3 && '🥉 '}
                    #{student.rank}
                  </span>
                </td>
                <td className="student-id">{student.id}</td>
                <td className="student-name">{student.name}</td>
                <td className="cgpa-cell">
                  <span className="cgpa-value">{student.cgpa.toFixed(2)}</span>
                </td>
                <td className="sgpa-cell">{student.currentSGPA.toFixed(2)}</td>
                <td className="trend-cell">
                  <span className={`trend ${student.trend >= 0 ? 'positive' : 'negative'}`}>
                    {getTrendIcon(student.trend)} {student.trend.toFixed(2)}
                  </span>
                </td>
                <td className="dept-cell">{student.dept || student.department || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="merit-footer">
        <div className="algorithm-info">
          <h4>📊 Ranking Algorithm</h4>
          <ol>
            <li><strong>Step 1:</strong> CGPA (Overall Academic Strength)</li>
            <li><strong>Step 2:</strong> Current Semester SGPA (Recent Performance)</li>
            <li><strong>Step 3:</strong> Academic Trend (Improvement Score)</li>
            <li><strong>Step 4:</strong> SHA256-based Tie-Breaker (Deterministic)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MeritList;
