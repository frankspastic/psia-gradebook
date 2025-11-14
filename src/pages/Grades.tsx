import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Class, Student, Assignment, Grade } from '../types';

export default function Grades() {
  const { classId } = useParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<{ [key: string]: Grade }>({});
  const [editingCell, setEditingCell] = useState<{ studentId: number; assignmentId: number } | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (classId) {
      setSelectedClassId(parseInt(classId));
    }
  }, [classId]);

  useEffect(() => {
    if (selectedClassId) {
      loadClassData();
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    const data = await window.api.getClasses();
    setClasses(data);
    if (data.length > 0 && !selectedClassId) {
      setSelectedClassId(data[0].id);
    }
  };

  const loadClassData = async () => {
    if (!selectedClassId) return;

    const studentsData = await window.api.getStudents(selectedClassId);
    const assignmentsData = await window.api.getAssignments(selectedClassId);

    setStudents(studentsData);
    setAssignments(assignmentsData);

    // Load all grades for this class
    const gradesMap: { [key: string]: Grade } = {};
    for (const student of studentsData) {
      const studentGrades = await window.api.getGrades(student.id);
      studentGrades.forEach((grade: Grade) => {
        const key = `${grade.student_id}-${grade.assignment_id}`;
        gradesMap[key] = grade;
      });
    }
    setGrades(gradesMap);
  };

  const getGrade = (studentId: number, assignmentId: number): string => {
    const key = `${studentId}-${assignmentId}`;
    return grades[key]?.grade || '';
  };

  const handleCellClick = (studentId: number, assignmentId: number) => {
    setEditingCell({ studentId, assignmentId });
    setTempValue(getGrade(studentId, assignmentId));
  };

  const handleCellBlur = async () => {
    if (!editingCell) return;

    const { studentId, assignmentId } = editingCell;
    const key = `${studentId}-${assignmentId}`;
    const existingGrade = grades[key];

    if (tempValue.trim() === '') {
      // Delete grade if exists
      if (existingGrade) {
        await window.api.deleteGrade(existingGrade.id);
        const newGrades = { ...grades };
        delete newGrades[key];
        setGrades(newGrades);
      }
    } else {
      // Update or create grade
      if (existingGrade) {
        await window.api.updateGrade(existingGrade.id, { grade: tempValue, notes: '' });
        setGrades({
          ...grades,
          [key]: { ...existingGrade, grade: tempValue }
        });
      } else {
        const newGrade = await window.api.createGrade({
          student_id: studentId,
          assignment_id: assignmentId,
          grade: tempValue,
          notes: ''
        });
        setGrades({
          ...grades,
          [key]: newGrade
        });
      }
    }

    setEditingCell(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setTempValue('');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Grade Entry</h1>

      {/* Class Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Select Class:</label>
        <select
          value={selectedClassId || ''}
          onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grade Grid */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {!selectedClassId ? (
          <div className="p-12 text-center text-gray-500">
            Please create a class first.
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No students in this class yet.</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No assignments in this class yet.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Student
                </th>
                {assignments.map((assignment) => (
                  <th
                    key={assignment.id}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                  >
                    <div>{assignment.label}</div>
                    <div className="text-xs font-normal text-gray-400 mt-1">
                      {new Date(assignment.date).toLocaleDateString()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    {student.last_name}, {student.first_name}
                  </td>
                  {assignments.map((assignment) => {
                    const isEditing =
                      editingCell?.studentId === student.id &&
                      editingCell?.assignmentId === assignment.id;
                    const gradeValue = getGrade(student.id, assignment.id);

                    return (
                      <td
                        key={assignment.id}
                        className="px-4 py-3 text-center border-l border-gray-100"
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-2 py-1 text-center border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        ) : (
                          <div
                            onClick={() => handleCellClick(student.id, assignment.id)}
                            className="cursor-pointer px-2 py-1 rounded hover:bg-gray-100 min-h-[2rem] flex items-center justify-center"
                          >
                            {gradeValue ? (
                              <span className="font-semibold text-gray-900">{gradeValue}</span>
                            ) : (
                              <span className="text-gray-400 text-xs">Click to add</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedClassId && students.length > 0 && assignments.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Click on any cell to enter or edit a grade. Press Enter to save or Escape to cancel.
          </p>
        </div>
      )}
    </div>
  );
}
