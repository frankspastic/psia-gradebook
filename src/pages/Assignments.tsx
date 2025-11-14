import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Class, Assignment } from '../types';

export default function Assignments() {
  const { classId } = useParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

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
      loadAssignments();
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    const data = await window.api.getClasses();
    setClasses(data);
    if (data.length > 0 && !selectedClassId) {
      setSelectedClassId(data[0].id);
    }
  };

  const loadAssignments = async () => {
    if (!selectedClassId) return;
    const data = await window.api.getAssignments(selectedClassId);
    setAssignments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    if (editingAssignment) {
      await window.api.updateAssignment(editingAssignment.id, formData);
    } else {
      await window.api.createAssignment({ ...formData, class_id: selectedClassId });
    }

    setFormData({
      label: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingAssignment(null);
    setIsModalOpen(false);
    loadAssignments();
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      label: assignment.label,
      date: assignment.date,
      description: assignment.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this assignment? This will also delete all grades for this assignment.')) {
      await window.api.deleteAssignment(id);
      loadAssignments();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Assignments</h1>

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
        <button
          onClick={() => {
            setEditingAssignment(null);
            setFormData({
              label: '',
              date: new Date().toISOString().split('T')[0],
              description: ''
            });
            setIsModalOpen(true);
          }}
          className="ml-auto bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          disabled={!selectedClassId}
        >
          + Add Assignment
        </button>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow">
        {!selectedClassId ? (
          <div className="p-12 text-center text-gray-500">
            Please create a class first.
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-2">No assignments in this class yet.</p>
            <p>Click "Add Assignment" to create your first assignment.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.label}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(assignment.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{assignment.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingAssignment ? 'Edit Assignment' : 'Add Assignment'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Label *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Homework 1, Quiz 2, Final Exam"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional notes about this assignment"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAssignment(null);
                    setFormData({
                      label: '',
                      date: new Date().toISOString().split('T')[0],
                      description: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingAssignment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
