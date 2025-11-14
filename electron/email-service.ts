import nodemailer from 'nodemailer';
import type { EmailRecipient, EmailTemplate, SMTPSettings, Assignment, Grade } from '../src/types';
import { settingService } from './db-service';

export async function getSMTPSettings(): Promise<SMTPSettings | null> {
  try {
    const email = settingService.get('smtp_email');
    const password = settingService.get('smtp_password');
    const fromName = settingService.get('smtp_from_name');
    const host = settingService.get('smtp_host');
    const port = settingService.get('smtp_port');

    if (!email || !password) {
      return null;
    }

    return {
      email: email.value,
      password: password.value,
      fromName: fromName?.value || 'PSIA Gradebook',
      host: host?.value || 'smtp.gmail.com',
      port: port ? parseInt(port.value) : 587
    };
  } catch (error) {
    console.error('Error getting SMTP settings:', error);
    return null;
  }
}

export async function testSMTPConnection(settings: SMTPSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: false,
      auth: {
        user: settings.email,
        pass: settings.password
      }
    });

    await transporter.verify();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

function createGradeTable(grades: Grade[], assignments: Assignment[]): string {
  if (!grades.length || !assignments.length) {
    return '';
  }

  let table = '<table style="border-collapse: collapse; width: 100%; margin: 20px 0;">';
  table += '<thead><tr style="background-color: #f3f4f6;">';
  table += '<th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Assignment</th>';
  table += '<th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Date</th>';
  table += '<th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Grade</th>';
  table += '</tr></thead><tbody>';

  assignments.forEach(assignment => {
    const grade = grades.find(g => g.assignment_id === assignment.id);
    if (grade) {
      table += '<tr>';
      table += `<td style="border: 1px solid #d1d5db; padding: 12px;">${assignment.label}</td>`;
      table += `<td style="border: 1px solid #d1d5db; padding: 12px;">${new Date(assignment.date).toLocaleDateString()}</td>`;
      table += `<td style="border: 1px solid #d1d5db; padding: 12px;"><strong>${grade.grade}</strong></td>`;
      table += '</tr>';
    }
  });

  table += '</tbody></table>';
  return table;
}

function replaceMergeFields(
  text: string,
  student: { first_name: string; last_name: string; google_drive_url: string },
  gradeTable: string
): string {
  let result = text;

  // Replace student fields
  result = result.replace(/\{\{student_first_name\}\}/g, student.first_name);
  result = result.replace(/\{\{student_last_name\}\}/g, student.last_name);
  result = result.replace(/\{\{student_full_name\}\}/g, `${student.first_name} ${student.last_name}`);

  // Replace Google Drive URL
  if (student.google_drive_url) {
    result = result.replace(
      /\{\{google_drive_url\}\}/g,
      `<a href="${student.google_drive_url}" style="color: #2563eb; text-decoration: underline;">${student.google_drive_url}</a>`
    );
  } else {
    result = result.replace(/\{\{google_drive_url\}\}/g, 'Not available');
  }

  // Replace grade table
  result = result.replace(/\{\{grade_table\}\}/g, gradeTable);

  return result;
}

export async function sendEmails(
  recipients: EmailRecipient[],
  template: EmailTemplate,
  assignments: Assignment[],
  allGrades: Grade[]
): Promise<{ success: boolean; error?: string; sentCount?: number }> {
  const settings = await getSMTPSettings();

  if (!settings) {
    return { success: false, error: 'SMTP settings not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: false,
      auth: {
        user: settings.email,
        pass: settings.password
      }
    });

    let sentCount = 0;

    for (const recipient of recipients) {
      const { student, contacts } = recipient;

      // Get grades for this student
      const studentGrades = allGrades.filter(g => g.student_id === student.id);

      // Filter assignments if specific ones are selected
      const relevantAssignments = template.selectedAssignments && template.selectedAssignments.length > 0
        ? assignments.filter(a => template.selectedAssignments!.includes(a.id))
        : assignments;

      // Create grade table if requested
      const gradeTable = template.includeGrades
        ? createGradeTable(studentGrades, relevantAssignments)
        : '';

      // Replace merge fields in subject and message
      const subject = replaceMergeFields(template.subject, student, '');
      const htmlMessage = replaceMergeFields(template.message, student, gradeTable);

      // Send to all contacts for this student
      const emailAddresses = contacts.map(c => c.email).join(', ');

      if (emailAddresses) {
        await transporter.sendMail({
          from: `"${settings.fromName}" <${settings.email}>`,
          to: emailAddresses,
          subject: subject,
          html: htmlMessage
        });

        sentCount++;
      }
    }

    return { success: true, sentCount };
  } catch (error) {
    console.error('Error sending emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
