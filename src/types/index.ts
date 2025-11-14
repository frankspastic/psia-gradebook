// Database Models

export interface Class {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Student {
  id: number;
  class_id: number;
  first_name: string;
  last_name: string;
  google_drive_url: string;
}

export interface EmailContact {
  id: number;
  student_id: number;
  email: string;
  contact_name: string;
  relationship: string;
}

export interface Assignment {
  id: number;
  class_id: number;
  label: string;
  date: string;
  description: string;
}

export interface Grade {
  id: number;
  student_id: number;
  assignment_id: number;
  grade: string;
  notes: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
}

// Extended types for views

export interface StudentWithContacts extends Student {
  contacts?: EmailContact[];
}

export interface GradeWithDetails extends Grade {
  student_name?: string;
  assignment_label?: string;
}

export interface AssignmentWithGrades extends Assignment {
  grades?: Grade[];
}

// Email types

export interface EmailRecipient {
  student: Student;
  contacts: EmailContact[];
}

export interface EmailTemplate {
  subject: string;
  message: string;
  includeGrades: boolean;
  selectedAssignments?: number[];
}

export interface SMTPSettings {
  email: string;
  password: string;
  fromName: string;
  host: string;
  port: number;
}

// IPC Channel types for Electron communication

export interface IpcChannels {
  // Classes
  'db:getClasses': () => Promise<Class[]>;
  'db:getClass': (id: number) => Promise<Class | undefined>;
  'db:createClass': (data: Omit<Class, 'id' | 'created_at'>) => Promise<Class>;
  'db:updateClass': (id: number, data: Partial<Class>) => Promise<void>;
  'db:deleteClass': (id: number) => Promise<void>;

  // Students
  'db:getStudents': (classId: number) => Promise<Student[]>;
  'db:getStudent': (id: number) => Promise<Student | undefined>;
  'db:createStudent': (data: Omit<Student, 'id'>) => Promise<Student>;
  'db:updateStudent': (id: number, data: Partial<Student>) => Promise<void>;
  'db:deleteStudent': (id: number) => Promise<void>;

  // Email Contacts
  'db:getEmailContacts': (studentId: number) => Promise<EmailContact[]>;
  'db:createEmailContact': (data: Omit<EmailContact, 'id'>) => Promise<EmailContact>;
  'db:updateEmailContact': (id: number, data: Partial<EmailContact>) => Promise<void>;
  'db:deleteEmailContact': (id: number) => Promise<void>;

  // Assignments
  'db:getAssignments': (classId: number) => Promise<Assignment[]>;
  'db:getAssignment': (id: number) => Promise<Assignment | undefined>;
  'db:createAssignment': (data: Omit<Assignment, 'id'>) => Promise<Assignment>;
  'db:updateAssignment': (id: number, data: Partial<Assignment>) => Promise<void>;
  'db:deleteAssignment': (id: number) => Promise<void>;

  // Grades
  'db:getGrades': (studentId: number) => Promise<Grade[]>;
  'db:getGradesByAssignment': (assignmentId: number) => Promise<Grade[]>;
  'db:getGrade': (studentId: number, assignmentId: number) => Promise<Grade | undefined>;
  'db:createGrade': (data: Omit<Grade, 'id'>) => Promise<Grade>;
  'db:updateGrade': (id: number, data: Partial<Grade>) => Promise<void>;
  'db:deleteGrade': (id: number) => Promise<void>;

  // Settings
  'db:getSetting': (key: string) => Promise<Setting | undefined>;
  'db:setSetting': (key: string, value: string) => Promise<void>;

  // Email
  'email:send': (recipients: EmailRecipient[], template: EmailTemplate) => Promise<{ success: boolean; error?: string }>;
  'email:testConnection': (settings: SMTPSettings) => Promise<{ success: boolean; error?: string }>;
}
