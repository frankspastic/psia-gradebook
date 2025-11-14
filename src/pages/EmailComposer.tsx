import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Class, Student, EmailContact, Assignment, EmailRecipient, EmailTemplate } from '../types';

export default function EmailComposer() {
  const { classId } = useParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [template, setTemplate] = useState<EmailTemplate>({
    subject: '',
    message: '',
    includeGrades: true,
    selectedAssignments: []
  });
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
  };

  const toggleStudent = (studentId: number) => {
    const newSelection = new Set(selectedStudentIds);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudentIds(newSelection);
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map(s => s.id)));
    }
  };

  const toggleAssignment = (assignmentId: number) => {
    const current = template.selectedAssignments || [];
    const newSelection = current.includes(assignmentId)
      ? current.filter(id => id !== assignmentId)
      : [...current, assignmentId];
    setTemplate({ ...template, selectedAssignments: newSelection });
  };

  const handleSend = async () => {
    if (selectedStudentIds.size === 0) {
      setSendResult({ success: false, message: 'Please select at least one student.' });
      return;
    }

    if (!template.subject.trim() || !template.message.trim()) {
      setSendResult({ success: false, message: 'Please enter both subject and message.' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      // Build recipients with their contacts
      const recipients: EmailRecipient[] = [];
      for (const studentId of selectedStudentIds) {
        const student = students.find(s => s.id === studentId);
        if (!student) continue;

        const contacts = await window.api.getEmailContacts(studentId);
        if (contacts.length > 0) {
          recipients.push({ student, contacts });
        }
      }

      if (recipients.length === 0) {
        setSendResult({
          success: false,
          message: 'None of the selected students have email contacts configured.'
        });
        setIsSending(false);
        return;
      }

      const result = await window.api.sendEmails(recipients, template);

      if (result.success) {
        setSendResult({
          success: true,
          message: `Successfully sent ${result.sentCount} email(s)!`
        });
        // Reset form
        setTemplate({
          subject: '',
          message: '',
          includeGrades: true,
          selectedAssignments: []
        });
        setSelectedStudentIds(new Set());
      } else {
        setSendResult({
          success: false,
          message: `Failed to send emails: ${result.error}`
        });
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: 'An error occurred while sending emails.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const insertMergeField = (field: string) => {
    setTemplate({ ...template, message: template.message + `{{${field}}}` });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Send Emails</h1>

      {/* Class Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Class:</label>
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

      {!selectedClassId ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Please create a class first.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Select Recipients</h2>
              <button
                onClick={toggleAllStudents}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {selectedStudentIds.size === students.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {students.length === 0 ? (
              <p className="text-sm text-gray-500">No students in this class.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.has(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {student.last_name}, {student.first_name}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Selected: <strong>{selectedStudentIds.size}</strong> of {students.length} students
              </p>
            </div>
          </div>

          {/* Email Composer */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Compose Email</h2>

            {/* Merge Fields Helper */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Mail Merge Fields:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => insertMergeField('student_first_name')}
                  className="text-xs bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                >
                  + First Name
                </button>
                <button
                  onClick={() => insertMergeField('student_last_name')}
                  className="text-xs bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                >
                  + Last Name
                </button>
                <button
                  onClick={() => insertMergeField('student_full_name')}
                  className="text-xs bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                >
                  + Full Name
                </button>
                <button
                  onClick={() => insertMergeField('google_drive_url')}
                  className="text-xs bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                >
                  + Google Drive URL
                </button>
                {template.includeGrades && (
                  <button
                    onClick={() => insertMergeField('grade_table')}
                    className="text-xs bg-white px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                  >
                    + Grade Table
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={template.subject}
                  onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Email subject line"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={template.message}
                  onChange={(e) => setTemplate({ ...template, message: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type your message here. Use the mail merge buttons above to insert personalized fields."
                />
              </div>

              {/* Include Grades Toggle */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={template.includeGrades}
                    onChange={(e) => setTemplate({ ...template, includeGrades: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include grade table in email</span>
                </label>
              </div>

              {/* Assignment Selection */}
              {template.includeGrades && assignments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Assignments to Include (leave empty for all):
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {assignments.map((assignment) => (
                      <label
                        key={assignment.id}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={template.selectedAssignments?.includes(assignment.id)}
                          onChange={() => toggleAssignment(assignment.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {assignment.label} - {new Date(assignment.date).toLocaleDateString()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {sendResult && (
                <div
                  className={`p-4 rounded-lg ${
                    sendResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {sendResult.message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSend}
                  disabled={isSending || selectedStudentIds.size === 0}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {isSending ? 'Sending...' : `Send to ${selectedStudentIds.size} Student(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
