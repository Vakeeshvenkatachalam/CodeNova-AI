import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { userService, UserProfile } from '../services/userService';
import { User, Mail, BookOpen, Award, Edit2, Save, X, Terminal, MessageSquare, Flame } from 'lucide-react';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Form values
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Java');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getUserProfile();
      setProfile(data);
      setName(data.name || '');
      setBio(data.bio || '');
      setPreferredLanguage(data.preferredLanguage || 'Java');
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateUserProfile({
        name,
        bio,
        preferredLanguage
      });
      setProfile(updated);
      setEditMode(false);
      // Update stored user if name changed
      const localUserStr = localStorage.getItem('user');
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr);
        localUser.name = updated.name;
        localStorage.setItem('user', JSON.stringify(localUser));
      }
    } catch (err) {
      console.error('Failed to update profile details:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <span className="text-sm text-content-secondary-light dark:text-content-secondary-dark animate-pulse">Loading profile data...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <span className="text-sm text-red-500">Failed to fetch profile details. Please try again.</span>
      </div>
    );
  }

  // Level progress bar percentage
  const xpInCurrentLevel = profile.totalXp % 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            User Profile
          </h2>
          <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
            Manage your profile details and monitor coding metrics.
          </p>
        </div>
        {!editMode && (
          <Button
            onClick={() => setEditMode(true)}
            variant="secondary"
            className="flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Edit2 className="h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card left */}
        <Card className="md:col-span-1 p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white text-3xl font-bold border-4 border-border-light dark:border-border-dark shadow-md">
              {profile.name ? profile.name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
            </div>
            <Badge variant="brand" className="absolute bottom-0 right-0 py-0.5 px-2 text-[10px] border border-surface-light dark:border-surface-dark">
              Lv. {profile.level}
            </Badge>
          </div>

          <div className="space-y-1.5 w-full">
            <h3 className="text-lg font-bold text-content-primary-light dark:text-content-primary-dark truncate">
              {profile.name || 'Anonymous Coder'}
            </h3>
            <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark truncate flex items-center justify-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {profile.email}
            </p>
            <div className="pt-2">
              <Badge variant="ai" className="text-xs py-0.5 px-2">
                Preferred Language: {profile.preferredLanguage}
              </Badge>
            </div>
          </div>

          <div className="w-full border-t border-border-light dark:border-border-dark pt-4 text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">About Me</span>
            <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark italic leading-relaxed whitespace-pre-wrap">
              {profile.bio || 'No bio written yet. Let other developers know a bit about yourself!'}
            </p>
          </div>
        </Card>

        {/* Customizable fields & Stats right */}
        <div className="md:col-span-2 space-y-6">
          {editMode ? (
            <Card className="p-6">
              <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3 mb-4">
                <h3 className="font-bold text-content-primary-light dark:text-content-primary-dark">Edit Custom Details</h3>
                <button
                  onClick={() => setEditMode(false)}
                  className="p-1 hover:bg-brand-light dark:hover:bg-brand-dark rounded text-content-secondary-light dark:text-content-secondary-dark"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark">
                    Preferred Programming Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option>Java</option>
                    <option>JavaScript</option>
                    <option>Python</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark">
                    Bio / About Me
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Write something about your coding journey..."
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setEditMode(false)}
                    variant="secondary"
                    className="text-xs py-1.5 px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={saving}
                    variant="primary"
                    className="text-xs py-1.5 px-4 flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" /> Save Profile
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Gamification stats metrics */}
              <div className="grid gap-4 grid-cols-3">
                <Card className="p-4 flex flex-col justify-between h-24 bg-brand-light/40 dark:bg-brand-dark/20 border-l-4 border-l-primary">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Solves</span>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark">{profile.problemsSolved}</span>
                    <Terminal className="h-5 w-5 text-primary opacity-70 mb-1" />
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between h-24 bg-brand-light/40 dark:bg-brand-dark/20 border-l-4 border-l-ai">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Mentor chats</span>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark">{profile.totalSessions}</span>
                    <MessageSquare className="h-5 w-5 text-ai opacity-70 mb-1" />
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between h-24 bg-brand-light/40 dark:bg-brand-dark/20 border-l-4 border-l-amber-500">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Total XP</span>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark">{profile.totalXp}</span>
                    <Flame className="h-5 w-5 text-amber-500 opacity-70 mb-1" />
                  </div>
                </Card>
              </div>

              {/* Account Information / Name Section */}
              <Card className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
                  <h3 className="font-bold text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                    <User className="h-5 w-5 text-primary" /> Profile Account Details
                  </h3>
                  <Badge variant="brand">Active Account</Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Display Name</span>
                    <p className="font-semibold text-content-primary-light dark:text-content-primary-dark text-sm">
                      {profile.name || <span className="text-content-muted-light dark:text-gray-500 italic">Not Set (Anonymous)</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Email Address</span>
                    <p className="font-semibold text-content-primary-light dark:text-content-primary-dark text-sm">{profile.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Preferred Language</span>
                    <p className="font-semibold text-content-primary-light dark:text-content-primary-dark text-sm">{profile.preferredLanguage}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-content-muted-dark">Platform Status</span>
                    <p className="font-semibold text-success flex items-center gap-1 text-sm">
                      <span className="h-2 w-2 rounded-full bg-success inline-block animate-ping"></span> Online / Verified
                    </p>
                  </div>
                </div>
              </Card>

              {/* Progress Card detail */}
              <Card className="p-6 space-y-4">

                <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
                  <h3 className="font-bold text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                    <Award className="h-5 w-5 text-amber-500" /> Progression Level Status
                  </h3>
                  <Badge variant="brand">Level {profile.level}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-content-secondary-light dark:text-content-secondary-dark">Level Progress</span>
                    <span className="text-primary">{xpInCurrentLevel} / 100 XP</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-brand-light dark:bg-brand-dark overflow-hidden border border-border-light dark:border-border-dark shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-ai rounded-full transition-all duration-500"
                      style={{ width: `${xpInCurrentLevel}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark leading-relaxed">
                    Earn 100 XP through Practice Hub solves and SQL reviews to rank up your profile score.
                  </p>
                </div>
              </Card>

              {/* Platform Activity Overview details */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                  <BookOpen className="h-5 w-5 text-primary" /> Learning Milestones
                </h3>
                <ul className="space-y-3 text-xs text-content-secondary-light dark:text-content-secondary-dark">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-success/15 text-success flex items-center justify-center font-bold text-[10px] mt-0.5">✓</div>
                    <div>
                      <p className="font-semibold">Setup Programming Workspace</p>
                      <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark">Configured code workspace and linked API services.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-success/15 text-success flex items-center justify-center font-bold text-[10px] mt-0.5">✓</div>
                    <div>
                      <p className="font-semibold">Execute Database Schemas</p>
                      <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark">Linked SQL Mentoring workbench directly to internal relational structures.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] mt-0.5 ${profile.problemsSolved > 0 ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'}`}>
                      {profile.problemsSolved > 0 ? '✓' : '•'}
                    </div>
                    <div>
                      <p className="font-semibold">Solve AI Designed Challenges</p>
                      <p className="text-[10px] text-content-muted-light dark:text-content-muted-dark">Generate and complete custom challenges in the Practice Hub.</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
