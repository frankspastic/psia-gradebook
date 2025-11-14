import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './database';
import {
  classService,
  studentService,
  emailContactService,
  assignmentService,
  gradeService,
  settingService
} from './db-service';
import { sendEmails as sendEmailsService, testSMTPConnection } from './email-service';
import type { EmailRecipient, EmailTemplate, SMTPSettings } from '../src/types';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database on app start
initializeDatabase();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Use .icns for macOS, .png for others
  const iconExtension = process.platform === 'darwin' ? 'icns' : 'png';
  const iconPath = path.join(__dirname, `../build/icon.${iconExtension}`);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // In development, load from Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers

// Classes
ipcMain.handle('db:getClasses', () => classService.getAll());
ipcMain.handle('db:getClass', (_event, id: number) => classService.getById(id));
ipcMain.handle('db:createClass', (_event, data) => classService.create(data));
ipcMain.handle('db:updateClass', (_event, id: number, data) => classService.update(id, data));
ipcMain.handle('db:deleteClass', (_event, id: number) => classService.delete(id));

// Students
ipcMain.handle('db:getStudents', (_event, classId: number) => studentService.getByClassId(classId));
ipcMain.handle('db:getStudent', (_event, id: number) => studentService.getById(id));
ipcMain.handle('db:createStudent', (_event, data) => studentService.create(data));
ipcMain.handle('db:updateStudent', (_event, id: number, data) => studentService.update(id, data));
ipcMain.handle('db:deleteStudent', (_event, id: number) => studentService.delete(id));

// Email Contacts
ipcMain.handle('db:getEmailContacts', (_event, studentId: number) => emailContactService.getByStudentId(studentId));
ipcMain.handle('db:createEmailContact', (_event, data) => emailContactService.create(data));
ipcMain.handle('db:updateEmailContact', (_event, id: number, data) => emailContactService.update(id, data));
ipcMain.handle('db:deleteEmailContact', (_event, id: number) => emailContactService.delete(id));

// Assignments
ipcMain.handle('db:getAssignments', (_event, classId: number) => assignmentService.getByClassId(classId));
ipcMain.handle('db:getAssignment', (_event, id: number) => assignmentService.getById(id));
ipcMain.handle('db:createAssignment', (_event, data) => assignmentService.create(data));
ipcMain.handle('db:updateAssignment', (_event, id: number, data) => assignmentService.update(id, data));
ipcMain.handle('db:deleteAssignment', (_event, id: number) => assignmentService.delete(id));

// Grades
ipcMain.handle('db:getGrades', (_event, studentId: number) => gradeService.getByStudentId(studentId));
ipcMain.handle('db:getGradesByAssignment', (_event, assignmentId: number) => gradeService.getByAssignmentId(assignmentId));
ipcMain.handle('db:getGrade', (_event, studentId: number, assignmentId: number) => gradeService.getGrade(studentId, assignmentId));
ipcMain.handle('db:createGrade', (_event, data) => gradeService.create(data));
ipcMain.handle('db:updateGrade', (_event, id: number, data) => gradeService.update(id, data));
ipcMain.handle('db:deleteGrade', (_event, id: number) => gradeService.delete(id));

// Settings
ipcMain.handle('db:getSetting', (_event, key: string) => settingService.get(key));
ipcMain.handle('db:setSetting', (_event, key: string, value: string) => settingService.set(key, value));

// Email
ipcMain.handle('email:send', async (_event, recipients: EmailRecipient[], template: EmailTemplate) => {
  // Get assignments and grades needed for email
  const allAssignments: any[] = [];
  const allGrades: any[] = [];

  // Collect all unique class IDs from students
  const classIds = new Set(recipients.map(r => r.student.class_id));

  for (const classId of classIds) {
    const assignments = assignmentService.getByClassId(classId);
    allAssignments.push(...assignments);
  }

  // Collect grades for all students
  for (const recipient of recipients) {
    const grades = gradeService.getByStudentId(recipient.student.id);
    allGrades.push(...grades);
  }

  return await sendEmailsService(recipients, template, allAssignments, allGrades);
});

ipcMain.handle('email:testConnection', async (_event, settings: SMTPSettings) => {
  return await testSMTPConnection(settings);
});
