import { useEffect, useState } from 'react';
import type { SMTPSettings } from '../types';

export default function Settings() {
  const [settings, setSettings] = useState<SMTPSettings>({
    email: '',
    password: '',
    fromName: 'PSIA Gradebook',
    host: 'smtp.gmail.com',
    port: 587
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const email = await window.api.getSetting('smtp_email');
    const password = await window.api.getSetting('smtp_password');
    const fromName = await window.api.getSetting('smtp_from_name');
    const host = await window.api.getSetting('smtp_host');
    const port = await window.api.getSetting('smtp_port');

    setSettings({
      email: email?.value || '',
      password: password?.value || '',
      fromName: fromName?.value || 'PSIA Gradebook',
      host: host?.value || 'smtp.gmail.com',
      port: port ? parseInt(port.value) : 587
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTestResult(null);

    try {
      await window.api.setSetting('smtp_email', settings.email);
      await window.api.setSetting('smtp_password', settings.password);
      await window.api.setSetting('smtp_from_name', settings.fromName);
      await window.api.setSetting('smtp_host', settings.host);
      await window.api.setSetting('smtp_port', settings.port.toString());

      setTestResult({ success: true, message: 'Settings saved successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await window.api.testEmailConnection(settings);
      if (result.success) {
        setTestResult({ success: true, message: 'Connection successful! Email settings are working.' });
      } else {
        setTestResult({ success: false, message: `Connection failed: ${result.error}` });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to test connection.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Settings Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Email Settings (SMTP)</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gmail Address *
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="your.email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                App Password *
              </label>
              <input
                type="password"
                required
                value={settings.password}
                onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="16-character app password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use a Gmail App Password, not your regular password
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={settings.fromName}
                onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="PSIA Gradebook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.host}
                onChange={(e) => setSettings({ ...settings, host: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.port}
                onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-lg ${
                  testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {testResult.message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !settings.email || !settings.password}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Setup Instructions</h2>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {showInstructions ? 'Hide' : 'Show'}
            </button>
          </div>

          {showInstructions && (
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How to Set Up Gmail App Password:</h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>
                    <strong>Enable 2-Factor Authentication</strong>
                    <ul className="list-disc list-inside ml-6 mt-1 text-gray-600">
                      <li>Go to your Google Account settings</li>
                      <li>Navigate to Security</li>
                      <li>Enable 2-Step Verification if not already enabled</li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    <strong>Generate App Password</strong>
                    <ul className="list-disc list-inside ml-6 mt-1 text-gray-600">
                      <li>Go to Google Account → Security</li>
                      <li>Find "2-Step Verification"</li>
                      <li>Scroll down to "App passwords"</li>
                      <li>Click "App passwords"</li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    <strong>Create Password</strong>
                    <ul className="list-disc list-inside ml-6 mt-1 text-gray-600">
                      <li>Select app: "Mail"</li>
                      <li>Select device: "Mac" or "Windows Computer"</li>
                      <li>Click "Generate"</li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    <strong>Copy & Save</strong>
                    <ul className="list-disc list-inside ml-6 mt-1 text-gray-600">
                      <li>Copy the 16-character password</li>
                      <li>Paste it in the "App Password" field above</li>
                      <li>Click "Save Settings"</li>
                      <li>Test the connection to verify</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Important Notes:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                  <li>App passwords are more secure than using your regular Gmail password</li>
                  <li>The app password is 16 characters without spaces</li>
                  <li>You can revoke app passwords anytime from Google Account settings</li>
                  <li>Default Gmail SMTP settings should work for most users</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                  <li>Make sure 2-Factor Authentication is enabled</li>
                  <li>Check that you copied the app password correctly (no spaces)</li>
                  <li>Verify your email address is correct</li>
                  <li>Try clicking "Test Connection" to diagnose issues</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
