# PSIA Gradebook

A desktop application for managing classes, students, assignments, and grades with email functionality.

## Features

- **Class Management**: Create and manage multiple classes
- **Student Roster**: Maintain student information with Google Drive URLs
- **Email Contacts**: Store multiple email contacts per student
- **Assignments**: Track assignments with dates and descriptions
- **Grade Entry**: Easy-to-use grid interface for entering and managing grades
- **Email Integration**: Send personalized emails with mail merge and grade tables
- **SMTP Configuration**: Built-in settings page for Gmail SMTP setup

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- macOS, Windows, or Linux

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd psia-gradebook
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run electron:dev
```

This will start both the Vite dev server and Electron. The app will automatically reload when you make changes to the code.

### Building for Production

To build the application for production:

```bash
npm run electron:build
```

The built application will be in the `release` directory.

## Setting Up Email (Gmail SMTP)

To send emails from the application, you need to configure Gmail SMTP settings:

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

### Step 2: Generate an App Password

1. Go to **Google Account** → **Security**
2. Under "2-Step Verification", find **App passwords**
3. Click on **App passwords**
4. Select:
   - **App**: Mail
   - **Device**: Mac or Windows Computer
5. Click **Generate**
6. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Configure in the App

1. Open the PSIA Gradebook application
2. Navigate to **Settings** (gear icon in the sidebar)
3. Enter your Gmail address
4. Paste the 16-character app password (remove any spaces)
5. Optionally customize the "From Name"
6. Click **Save Settings**
7. Click **Test Connection** to verify it works

## Using the Application

### 1. Create a Class

- Go to **Classes** page
- Click **+ Add Class**
- Enter class name and optional description
- Click **Create**

### 2. Add Students

- Go to **Students** page
- Select your class from the dropdown
- Click **+ Add Student**
- Enter student information:
  - First Name
  - Last Name
  - Google Drive URL (optional)
- Click **Create**

### 3. Add Email Contacts

- In the **Students** page, click **Contacts** for a student
- Add one or more email contacts:
  - Email address
  - Contact name (e.g., "John Doe")
  - Relationship (e.g., "Parent", "Guardian")
- Click **Add Contact**

### 4. Create Assignments

- Go to **Assignments** page
- Select your class
- Click **+ Add Assignment**
- Enter:
  - Assignment label (e.g., "Homework 1", "Quiz 2")
  - Date
  - Optional description
- Click **Create**

### 5. Enter Grades

- Go to **Grades** page
- Select your class
- Click on any cell in the grid to enter or edit a grade
- Press **Enter** to save or **Escape** to cancel
- Grades are automatically saved

### 6. Send Emails

- Go to **Send Email** page
- Select your class
- Check the students you want to email
- Compose your email:
  - Enter subject
  - Write your message
  - Use mail merge buttons to insert personalized fields:
    - `{{student_first_name}}` - Student's first name
    - `{{student_last_name}}` - Student's last name
    - `{{student_full_name}}` - Student's full name
    - `{{google_drive_url}}` - Link to student's Google Drive
    - `{{grade_table}}` - Table of grades
- Toggle "Include grade table" to add grades automatically
- Optionally select specific assignments to include
- Click **Send**

## Mail Merge Fields

The following fields can be used in email subject and message:

- `{{student_first_name}}` - Replaced with student's first name
- `{{student_last_name}}` - Replaced with student's last name
- `{{student_full_name}}` - Replaced with student's full name
- `{{google_drive_url}}` - Replaced with clickable Google Drive link
- `{{grade_table}}` - Replaced with formatted table of grades

**Example Email:**

```
Subject: Progress Report for {{student_first_name}}

Dear Parent/Guardian,

I hope this email finds you well. I wanted to share {{student_full_name}}'s recent progress.

Here are the grades:
{{grade_table}}

You can find additional resources in their Google Drive folder: {{google_drive_url}}

Best regards,
Your Teacher
```

## Database

The application uses SQLite for data storage. The database file is located at:

- **macOS**: `~/Library/Application Support/psia-gradebook/database/gradebook.db`
- **Windows**: `%APPDATA%/psia-gradebook/database/gradebook.db`
- **Linux**: `~/.config/psia-gradebook/database/gradebook.db`

## Troubleshooting

### Email Not Sending

1. Verify 2-Factor Authentication is enabled on your Google account
2. Ensure you're using an App Password, not your regular Gmail password
3. Check that the app password was copied correctly (no spaces)
4. Click "Test Connection" in Settings to diagnose the issue
5. Make sure students have email contacts configured

### Build Errors

If you encounter build errors with `better-sqlite3`:

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### App Won't Start

1. Check that all dependencies are installed: `npm install`
2. Verify Node.js version is 16 or higher: `node --version`
3. Check the console for error messages

## Tech Stack

- **Electron** - Desktop application framework
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **SQLite** - Local database
- **Nodemailer** - Email sending
- **Tailwind CSS** - Styling

## License

MIT

## Support

For issues or questions, please check the troubleshooting section above or contact support.
# psia-gradebook
