import { contextBridge, ipcRenderer } from 'electron';
import type { IpcChannels } from '../src/types';

console.log('Preload script is running!');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Classes
  getClasses: () => ipcRenderer.invoke('db:getClasses'),
  getClass: (id: number) => ipcRenderer.invoke('db:getClass', id),
  createClass: (data: any) => ipcRenderer.invoke('db:createClass', data),
  updateClass: (id: number, data: any) => ipcRenderer.invoke('db:updateClass', id, data),
  deleteClass: (id: number) => ipcRenderer.invoke('db:deleteClass', id),

  // Students
  getStudents: (classId: number) => ipcRenderer.invoke('db:getStudents', classId),
  getStudent: (id: number) => ipcRenderer.invoke('db:getStudent', id),
  createStudent: (data: any) => ipcRenderer.invoke('db:createStudent', data),
  updateStudent: (id: number, data: any) => ipcRenderer.invoke('db:updateStudent', id, data),
  deleteStudent: (id: number) => ipcRenderer.invoke('db:deleteStudent', id),

  // Email Contacts
  getEmailContacts: (studentId: number) => ipcRenderer.invoke('db:getEmailContacts', studentId),
  createEmailContact: (data: any) => ipcRenderer.invoke('db:createEmailContact', data),
  updateEmailContact: (id: number, data: any) => ipcRenderer.invoke('db:updateEmailContact', id, data),
  deleteEmailContact: (id: number) => ipcRenderer.invoke('db:deleteEmailContact', id),

  // Assignments
  getAssignments: (classId: number) => ipcRenderer.invoke('db:getAssignments', classId),
  getAssignment: (id: number) => ipcRenderer.invoke('db:getAssignment', id),
  createAssignment: (data: any) => ipcRenderer.invoke('db:createAssignment', data),
  updateAssignment: (id: number, data: any) => ipcRenderer.invoke('db:updateAssignment', id, data),
  deleteAssignment: (id: number) => ipcRenderer.invoke('db:deleteAssignment', id),

  // Grades
  getGrades: (studentId: number) => ipcRenderer.invoke('db:getGrades', studentId),
  getGradesByAssignment: (assignmentId: number) => ipcRenderer.invoke('db:getGradesByAssignment', assignmentId),
  getGrade: (studentId: number, assignmentId: number) => ipcRenderer.invoke('db:getGrade', studentId, assignmentId),
  createGrade: (data: any) => ipcRenderer.invoke('db:createGrade', data),
  updateGrade: (id: number, data: any) => ipcRenderer.invoke('db:updateGrade', id, data),
  deleteGrade: (id: number) => ipcRenderer.invoke('db:deleteGrade', id),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('db:setSetting', key, value),

  // Email
  sendEmails: (recipients: any, template: any) => ipcRenderer.invoke('email:send', recipients, template),
  testEmailConnection: (settings: any) => ipcRenderer.invoke('email:testConnection', settings)
});

// Type declaration for TypeScript
declare global {
  interface Window {
    api: {
      // Classes
      getClasses: () => Promise<any[]>;
      getClass: (id: number) => Promise<any>;
      createClass: (data: any) => Promise<any>;
      updateClass: (id: number, data: any) => Promise<void>;
      deleteClass: (id: number) => Promise<void>;

      // Students
      getStudents: (classId: number) => Promise<any[]>;
      getStudent: (id: number) => Promise<any>;
      createStudent: (data: any) => Promise<any>;
      updateStudent: (id: number, data: any) => Promise<void>;
      deleteStudent: (id: number) => Promise<void>;

      // Email Contacts
      getEmailContacts: (studentId: number) => Promise<any[]>;
      createEmailContact: (data: any) => Promise<any>;
      updateEmailContact: (id: number, data: any) => Promise<void>;
      deleteEmailContact: (id: number) => Promise<void>;

      // Assignments
      getAssignments: (classId: number) => Promise<any[]>;
      getAssignment: (id: number) => Promise<any>;
      createAssignment: (data: any) => Promise<any>;
      updateAssignment: (id: number, data: any) => Promise<void>;
      deleteAssignment: (id: number) => Promise<void>;

      // Grades
      getGrades: (studentId: number) => Promise<any[]>;
      getGradesByAssignment: (assignmentId: number) => Promise<any[]>;
      getGrade: (studentId: number, assignmentId: number) => Promise<any>;
      createGrade: (data: any) => Promise<any>;
      updateGrade: (id: number, data: any) => Promise<void>;
      deleteGrade: (id: number) => Promise<void>;

      // Settings
      getSetting: (key: string) => Promise<any>;
      setSetting: (key: string, value: string) => Promise<void>;

      // Email
      sendEmails: (recipients: any, template: any) => Promise<any>;
      testEmailConnection: (settings: any) => Promise<any>;
    };
  }
}
