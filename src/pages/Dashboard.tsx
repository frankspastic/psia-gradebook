import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Class, Student } from '../types';

export default function Dashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalAssignments: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const classesData = await window.api.getClasses();
    setClasses(classesData);

    let totalStudents = 0;
    let totalAssignments = 0;

    for (const cls of classesData) {
      const students = await window.api.getStudents(cls.id);
      const assignments = await window.api.getAssignments(cls.id);
      totalStudents += students.length;
      totalAssignments += assignments.length;
    }

    setStats({
      totalClasses: classesData.length,
      totalStudents,
      totalAssignments
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-4xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-4xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-4xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Classes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Classes</h2>
        </div>
        <div className="p-6">
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No classes yet. Get started by creating your first class!</p>
              <Link
                to="/classes"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Class
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <ClassCard key={cls.id} classData={cls} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClassCard({ classData }: { classData: Class }) {
  const [studentCount, setStudentCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, [classData.id]);

  const loadCounts = async () => {
    const students = await window.api.getStudents(classData.id);
    const assignments = await window.api.getAssignments(classData.id);
    setStudentCount(students.length);
    setAssignmentCount(assignments.length);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg text-gray-800 mb-2">{classData.name}</h3>
      {classData.description && (
        <p className="text-sm text-gray-600 mb-3">{classData.description}</p>
      )}
      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
        <span>👥 {studentCount} students</span>
        <span>📝 {assignmentCount} assignments</span>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/students/${classData.id}`}
          className="flex-1 text-center bg-primary-50 text-primary-700 px-3 py-1 rounded text-sm hover:bg-primary-100 transition-colors"
        >
          Students
        </Link>
        <Link
          to={`/grades/${classData.id}`}
          className="flex-1 text-center bg-primary-50 text-primary-700 px-3 py-1 rounded text-sm hover:bg-primary-100 transition-colors"
        >
          Grades
        </Link>
      </div>
    </div>
  );
}
