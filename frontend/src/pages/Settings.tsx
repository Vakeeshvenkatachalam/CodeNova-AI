import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Settings as SettingsIcon, Shield, Bell, HelpCircle, AlertTriangle } from 'lucide-react';

export const Settings: React.FC = () => {
  const [lang, setLang] = useState('Java');
  const [theme, setTheme] = useState('Dark');
  const [notify, setNotify] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveSettings = () => {
    alert('Settings updated successfully!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: Deleting your account will remove all streaks, solved problems, and interview sessions. This cannot be undone. Do you wish to proceed?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
          IDE settings
        </h2>
        <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
          Configure default themes, learning tracks, notifications, and privacy options.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Left: Preference tabs */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border-light pb-3 dark:border-border-dark">
              <SettingsIcon className="h-4.5 w-4.5 text-primary" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark">Preferences</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-content-secondary-light dark:text-gray-400">Default Programming Language</label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full p-2.5 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-xl text-content-primary-light dark:text-content-primary-dark focus:outline-none"
                  >
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-content-secondary-light dark:text-gray-400">Default Theme Preset</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-2.5 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-xl text-content-primary-light dark:text-content-primary-dark focus:outline-none"
                  >
                    <option value="Dark">Anthracite Dark</option>
                    <option value="Light">Classic Light</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-brand-light dark:bg-brand-dark rounded-xl border border-border-light dark:border-border-dark">
                <div>
                  <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Daily Reminder Notifications</p>
                  <p className="text-[10px] text-content-muted-light dark:text-gray-400">Send alerts to keep solved streaks active.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-brand-light dark:bg-brand-dark rounded-xl border border-border-light dark:border-border-dark">
                <div>
                  <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Private Profile Mode</p>
                  <p className="text-[10px] text-content-muted-light dark:text-gray-400">Hide calendar grids and streaks from recruiters.</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacyMode}
                  onChange={(e) => setPrivacyMode(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                />
              </div>
            </div>

            <Button onClick={handleSaveSettings} variant="primary" className="w-full text-xs py-2.5">
              Save Preference Updates
            </Button>
          </Card>
        </div>

        {/* Right: Security & Danger Zone */}
        <div className="md:col-span-1 space-y-4">
          <Card className="p-5 space-y-3.5 border-l-4 border-l-red-500 bg-red-500/5">
            <div className="flex items-center gap-2 text-red-500">
              <Shield className="h-4.5 w-4.5" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Danger Zone</h3>
            </div>
            <p className="text-xs text-content-secondary-light dark:text-gray-300 leading-relaxed font-sans">
              Permanently purge your account details and learning logs.
            </p>
            <Button onClick={handleDeleteAccount} variant="danger" className="w-full text-xs py-2.5">
              Purge CodeNova Account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
