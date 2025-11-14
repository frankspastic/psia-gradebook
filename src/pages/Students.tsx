import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Class, Student, EmailContact } from '../types';

export default function Students() {
  const { classId } = useParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    google_drive_url: ''
  });
  const [contactForm, setContactForm] = useState({
    email: '',
    contact_name: '',
    relationship: ''
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
      loadStudents();
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    const data = await window.api.getClasses();
    setClasses(data);
    if (data.length > 0 && !selectedClassId) {
      setSelectedClassId(data[0].id);
    }
  };

  const loadStudents = async () => {
    if (!selectedClassId) return;
    const data = await window.api.getStudents(selectedClassId);
    setStudents(data);
  };

  const loadContacts = async (studentId: number) => {
    const data = await window.api.getEmailContacts(studentId);
    setContacts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    if (editingStudent) {
      await window.api.updateStudent(editingStudent.id, formData);
    } else {
      await window.api.createStudent({ ...formData, class_id: selectedClassId });
    }

    setFormData({ first_name: '', last_name: '', google_drive_url: '' });
    setEditingStudent(null);
    setIsModalOpen(false);
    loadStudents();
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    await window.api.createEmailContact({
      ...contactForm,
      student_id: selectedStudent.id
    });

    setContactForm({ email: '', contact_name: '', relationship: '' });
    loadContacts(selectedStudent.id);
  };

  const handleDeleteContact = async (contactId: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await window.api.deleteEmailContact(contactId);
      if (selectedStudent) {
        loadContacts(selectedStudent.id);
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      google_drive_url: student.google_drive_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this student? This will also delete all grades associated with this student.')) {
      await window.api.deleteStudent(id);
      loadStudents();
    }
  };

  const handleManageContacts = async (student: Student) => {
    setSelectedStudent(student);
    await loadContacts(student.id);
    setIsContactModalOpen(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Roster</h1>

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
            setEditingStudent(null);
            setFormData({ first_name: '', last_name: '', google_drive_url: '' });
            setIsModalOpen(true);
          }}
          className="ml-auto bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          disabled={!selectedClassId}
        >
          + Add Student
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow">
        {!selectedClassId ? (
          <div className="p-12 text-center text-gray-500">
            Please create a class first.
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-2">No students in this class yet.</p>
            <p>Click "Add Student" to add your first student.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Google Drive
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.last_name}, {student.first_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.google_drive_url ? (
                      <a
                        href={student.google_drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-900 underline"
                      >
                        View Folder
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleManageContacts(student)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Contacts
                    </button>
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
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

      {/* Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingStudent ? 'Edit Student' : 'Add Student'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Drive URL
                </label>
                <input
                  type="url"
                  value={formData.google_drive_url}
                  onChange={(e) => setFormData({ ...formData, google_drive_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStudent(null);
                    setFormData({ first_name: '', last_name: '', google_drive_url: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Contacts Modal */}
      {isContactModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Email Contacts for {selectedStudent.first_name} {selectedStudent.last_name}
            </h2>

            {/* Add Contact Form */}
            <form onSubmit={handleContactSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Add New Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="email"
                  required
                  placeholder="Email *"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Contact Name *"
                  value={contactForm.contact_name}
                  onChange={(e) => setContactForm({ ...contactForm, contact_name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g., Parent)"
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Contact
              </button>
            </form>

            {/* Contacts List */}
            <div>
              <h3 className="font-semibold mb-3">Current Contacts</h3>
              {contacts.length === 0 ? (
                <p className="text-gray-500 text-sm">No email contacts yet.</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{contact.contact_name}</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                        {contact.relationship && (
                          <p className="text-xs text-gray-500">{contact.relationship}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsContactModalOpen(false);
                  setSelectedStudent(null);
                  setContacts([]);
                  setContactForm({ email: '', contact_name: '', relationship: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
