# Quick Start Guide - PSIA Gradebook

## Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start the application in development mode
npm run electron:dev
```

The app will open automatically. It includes:
- A sidebar with navigation
- Multiple pages for managing classes, students, assignments, and grades
- Email composer with mail merge functionality
- Settings page for SMTP configuration

## First-Time Setup

### 1. Configure Email Settings (Optional but recommended)

1. Click **Settings** (⚙️) in the sidebar
2. Follow the instructions to set up Gmail App Password:
   - Enable 2FA on your Google account
   - Generate an App Password at: https://myaccount.google.com/apppasswords
   - Paste the 16-character password in the settings
3. Click **Save Settings** and **Test Connection**

### 2. Create Your First Class

1. Click **Classes** (🎓) in the sidebar
2. Click **+ Add Class**
3. Enter class name (e.g., "Beginner Skiing 2024")
4. Click **Create**

### 3. Add Students

1. Click **Students** (👥) in the sidebar
2. Select your class from the dropdown
3. Click **+ Add Student**
4. Fill in student information
5. Click **Contacts** to add email addresses for parents/guardians

### 4. Create Assignments

1. Click **Assignments** (📝) in the sidebar
2. Click **+ Add Assignment**
3. Enter assignment details (label, date, description)
4. Click **Create**

### 5. Enter Grades

1. Click **Grades** (📈) in the sidebar
2. Click on any cell to enter a grade
3. Press Enter to save

### 6. Send Emails

1. Click **Send Email** (✉️) in the sidebar
2. Select students to email
3. Compose your message using mail merge fields:
   - `{{student_first_name}}`
   - `{{student_full_name}}`
   - `{{google_drive_url}}`
   - `{{grade_table}}`
4. Click **Send**

## Project Structure

```
psia-gradebook/
├── electron/           # Electron main process
│   ├── main.ts        # App entry point
│   ├── database.ts    # Database initialization
│   ├── db-service.ts  # Database operations
│   └── email-service.ts # Email functionality
├── src/
│   ├── pages/         # React pages
│   │   ├── Dashboard.tsx
│   │   ├── Classes.tsx
│   │   ├── Students.tsx
│   │   ├── Assignments.tsx
│   │   ├── Grades.tsx
│   │   ├── EmailComposer.tsx
│   │   └── Settings.tsx
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main React component
│   └── main.tsx       # React entry point
└── README.md          # Full documentation
```

## Development Tips

- Changes to React code will hot-reload automatically
- Changes to Electron code require restarting the app
- Database is stored in your user data directory
- Check the browser console (DevTools) for debugging

## Need Help?

See the full [README.md](README.md) for:
- Detailed feature documentation
- Gmail SMTP setup instructions
- Troubleshooting guide
- Mail merge field reference
