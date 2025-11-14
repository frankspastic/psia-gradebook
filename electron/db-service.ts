import db from './database';
import type { Class, Student, EmailContact, Assignment, Grade, Setting } from '../src/types';

// Classes
export const classService = {
  getAll: (): Class[] => {
    const stmt = db.prepare('SELECT * FROM classes ORDER BY created_at DESC');
    return stmt.all() as Class[];
  },

  getById: (id: number): Class | undefined => {
    const stmt = db.prepare('SELECT * FROM classes WHERE id = ?');
    return stmt.get(id) as Class | undefined;
  },

  create: (data: Omit<Class, 'id' | 'created_at'>): Class => {
    const stmt = db.prepare('INSERT INTO classes (name, description) VALUES (?, ?)');
    const result = stmt.run(data.name, data.description);
    return classService.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, data: Partial<Class>): void => {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE classes SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM classes WHERE id = ?');
    stmt.run(id);
  }
};

// Students
export const studentService = {
  getByClassId: (classId: number): Student[] => {
    const stmt = db.prepare('SELECT * FROM students WHERE class_id = ? ORDER BY last_name, first_name');
    return stmt.all(classId) as Student[];
  },

  getById: (id: number): Student | undefined => {
    const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
    return stmt.get(id) as Student | undefined;
  },

  create: (data: Omit<Student, 'id'>): Student => {
    const stmt = db.prepare('INSERT INTO students (class_id, first_name, last_name, google_drive_url) VALUES (?, ?, ?, ?)');
    const result = stmt.run(data.class_id, data.first_name, data.last_name, data.google_drive_url || '');
    return studentService.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, data: Partial<Student>): void => {
    const fields = [];
    const values = [];

    if (data.class_id !== undefined) {
      fields.push('class_id = ?');
      values.push(data.class_id);
    }
    if (data.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(data.first_name);
    }
    if (data.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(data.last_name);
    }
    if (data.google_drive_url !== undefined) {
      fields.push('google_drive_url = ?');
      values.push(data.google_drive_url);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM students WHERE id = ?');
    stmt.run(id);
  }
};

// Email Contacts
export const emailContactService = {
  getByStudentId: (studentId: number): EmailContact[] => {
    const stmt = db.prepare('SELECT * FROM email_contacts WHERE student_id = ?');
    return stmt.all(studentId) as EmailContact[];
  },

  create: (data: Omit<EmailContact, 'id'>): EmailContact => {
    const stmt = db.prepare('INSERT INTO email_contacts (student_id, email, contact_name, relationship) VALUES (?, ?, ?, ?)');
    const result = stmt.run(data.student_id, data.email, data.contact_name, data.relationship || '');
    const getStmt = db.prepare('SELECT * FROM email_contacts WHERE id = ?');
    return getStmt.get(result.lastInsertRowid) as EmailContact;
  },

  update: (id: number, data: Partial<EmailContact>): void => {
    const fields = [];
    const values = [];

    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.contact_name !== undefined) {
      fields.push('contact_name = ?');
      values.push(data.contact_name);
    }
    if (data.relationship !== undefined) {
      fields.push('relationship = ?');
      values.push(data.relationship);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE email_contacts SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM email_contacts WHERE id = ?');
    stmt.run(id);
  }
};

// Assignments
export const assignmentService = {
  getByClassId: (classId: number): Assignment[] => {
    const stmt = db.prepare('SELECT * FROM assignments WHERE class_id = ? ORDER BY date DESC');
    return stmt.all(classId) as Assignment[];
  },

  getById: (id: number): Assignment | undefined => {
    const stmt = db.prepare('SELECT * FROM assignments WHERE id = ?');
    return stmt.get(id) as Assignment | undefined;
  },

  create: (data: Omit<Assignment, 'id'>): Assignment => {
    const stmt = db.prepare('INSERT INTO assignments (class_id, label, date, description) VALUES (?, ?, ?, ?)');
    const result = stmt.run(data.class_id, data.label, data.date, data.description || '');
    return assignmentService.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, data: Partial<Assignment>): void => {
    const fields = [];
    const values = [];

    if (data.class_id !== undefined) {
      fields.push('class_id = ?');
      values.push(data.class_id);
    }
    if (data.label !== undefined) {
      fields.push('label = ?');
      values.push(data.label);
    }
    if (data.date !== undefined) {
      fields.push('date = ?');
      values.push(data.date);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM assignments WHERE id = ?');
    stmt.run(id);
  }
};

// Grades
export const gradeService = {
  getByStudentId: (studentId: number): Grade[] => {
    const stmt = db.prepare('SELECT * FROM grades WHERE student_id = ?');
    return stmt.all(studentId) as Grade[];
  },

  getByAssignmentId: (assignmentId: number): Grade[] => {
    const stmt = db.prepare('SELECT * FROM grades WHERE assignment_id = ?');
    return stmt.all(assignmentId) as Grade[];
  },

  getGrade: (studentId: number, assignmentId: number): Grade | undefined => {
    const stmt = db.prepare('SELECT * FROM grades WHERE student_id = ? AND assignment_id = ?');
    return stmt.get(studentId, assignmentId) as Grade | undefined;
  },

  create: (data: Omit<Grade, 'id'>): Grade => {
    const stmt = db.prepare('INSERT INTO grades (student_id, assignment_id, grade, notes) VALUES (?, ?, ?, ?)');
    const result = stmt.run(data.student_id, data.assignment_id, data.grade, data.notes || '');
    const getStmt = db.prepare('SELECT * FROM grades WHERE id = ?');
    return getStmt.get(result.lastInsertRowid) as Grade;
  },

  update: (id: number, data: Partial<Grade>): void => {
    const fields = [];
    const values = [];

    if (data.grade !== undefined) {
      fields.push('grade = ?');
      values.push(data.grade);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE grades SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  },

  delete: (id: number): void => {
    const stmt = db.prepare('DELETE FROM grades WHERE id = ?');
    stmt.run(id);
  }
};

// Settings
export const settingService = {
  get: (key: string): Setting | undefined => {
    const stmt = db.prepare('SELECT * FROM settings WHERE key = ?');
    return stmt.get(key) as Setting | undefined;
  },

  set: (key: string, value: string): void => {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, value);
  }
};
