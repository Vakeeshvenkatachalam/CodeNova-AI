import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { userService, UserProfile } from '../services/userService';
import {
  User, Mail, BookOpen, Award, Edit2, Save, X, Terminal,
  MessageSquare, Flame, Calendar, Info
} from 'lucide-react';

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
      
      const localUserStr = localStorage.getItem('user');
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr);
        localUser.name = updated.name;
        localStorage.setItem('user', JSON.stringify(localUser));
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
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

  const xpInCurrentLevel = profile.totalXp % 100;

  // Generate GitHub-style mock contribution grid dates (53 weeks * 7 days)
  const contributionGrid = Array.from({ length: 53 }, () =>
    Array.from({ length: 7 }, () => {
      // Mock random activity levels (0 to 4)
      const randVal = Math.random();
      return randVal > 0.85 ? 4 : randVal > 0.7 ? 3 : randVal > 0.5 ? 2 : randVal > 0.3 ? 1 : 0;
    })
  );

  const getActivityColor = (level: number) => {
    switch (level) {
      case 4: return 'bg-green-600 dark:bg-green-500';
      case 3: return 'bg-green-500/80 dark:bg-green-600/80';
      case 2: return 'bg-green-500/50 dark:bg-green-700/50';
      case 1: return 'bg-green-500/20 dark:bg-green-900/45';
      default: return 'bg-border-light dark:bg-[#161622]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            User Profile
          </h2>
          <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
            Manage your personal settings, view contribution charts, and level progressions.
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
        {/* Left Column: Avatar & Bio details */}
        <div className="md:col-span-1 space-y-4">
          <Card className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-ai flex items-center justify-center text-white text-3xl font-black border-4 border-border-light dark:border-border-dark shadow-md">
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
              <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark truncate flex items-center justify-center gap-1 font-mono">
                <Mail className="h-3.5 w-3.5" /> {profile.email}
              </p>
              <div className="pt-1.5">
                <Badge variant="ai" className="text-xs py-0.5 px-2 font-bold">
                  {profile.preferredLanguage} Specialist
                </Badge>
              </div>
            </div>

            <div className="w-full border-t border-border-light dark:border-border-dark pt-4 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">About Me</span>
              <p className="text-xs text-content-secondary-light dark:text-gray-300 italic leading-relaxed whitespace-pre-wrap font-sans">
                {profile.bio || 'No bio written yet. Let other developers know a bit about yourself!'}
              </p>
            </div>
          </Card>

          {/* Badges Drawer */}
          <Card className="p-4 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" /> Earned Badges
            </h4>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="brand" className="flex items-center gap-1 text-[10px] py-1">🔥 Consistency Master</Badge>
              <Badge variant="ai" className="flex items-center gap-1 text-[10px] py-1">⚡ Fast Solver</Badge>
              <Badge variant="warning" className="flex items-center gap-1 text-[10px] py-1">🎯 Perfect Accuracy</Badge>
            </div>
          </Card>
        </div>

        {/* Right Column: Contribution grid, stats, levels */}
        <div className="md:col-span-2 space-y-6">
          {editMode ? (
            <Card className="p-6">
              <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3 mb-4">
                <h3 className="font-bold text-content-primary-light dark:text-content-primary-dark">Edit Profile Details</h3>
                <button
                  onClick={() => setEditMode(false)}
                  className="p-1 hover:bg-brand-light dark:hover:bg-brand-dark rounded text-content-secondary-light dark:text-content-secondary-dark"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                    Preferred Programming Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option>Java</option>
                    <option>JavaScript</option>
                    <option>Python</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                    Bio / About Me
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Write something about your coding journey..."
                    className="w-full text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-primary"
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
              
              {/* GitHub-style Contribution Calendar Grid */}
              <Card className="p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-primary" /> Coding Activity Calendar
                  </h4>
                  <span className="text-[9px] text-content-muted-light dark:text-gray-400">Last 365 Days activity logs</span>
                </div>

                {/* Calendar Layout */}
                <div className="overflow-x-auto pb-1 select-none">
                  <div className="flex gap-1 h-20 min-w-[620px]">
                    {contributionGrid.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1 flex-1">
                        {week.map((dayLevel, dIdx) => (
                          <div
                            key={dIdx}
                            className={`h-2 w-2 rounded-sm ${getActivityColor(dayLevel)}`}
                            title={`Activity level: ${dayLevel}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Legend */}
                <div className="flex justify-end items-center gap-1.5 text-[9px] text-content-muted-light dark:text-gray-400 font-mono">
                  <span>Less</span>
                  <div className="h-2 w-2 rounded-sm bg-border-light dark:bg-[#161622]" />
                  <div className="h-2 w-2 rounded-sm bg-green-500/20 dark:bg-green-950" />
                  <div className="h-2 w-2 rounded-sm bg-green-500/50 dark:bg-green-700/50" />
                  <div className="h-2 w-2 rounded-sm bg-green-500/85 dark:bg-green-600/85" />
                  <div className="h-2 w-2 rounded-sm bg-green-500 dark:bg-green-500" />
                  <span>More</span>
                </div>
              </Card>

              {/* Solves and chats count cards */}
              <div className="grid gap-4 grid-cols-3">
                <Card className="p-4 flex flex-col justify-between h-24 border-l-4 border-l-primary bg-brand-light/40 dark:bg-brand-dark/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">Total Solves</span>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark">{profile.problemsSolved}</span>
                    <Terminal className="h-5 w-5 text-primary opacity-60 mb-0.5" />
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between h-24 border-l-4 border-l-ai bg-brand-light/40 dark:bg-brand-dark/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">Mentor Chats</span>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark">{profile.totalSessions}</span>
                    <MessageSquare className="h-5 w-5 text-ai opacity-60 mb-0.5" />
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between h-24 border-l-4 border-l-amber-500 bg-brand-light/40 dark:bg-brand-dark/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">Total XP</span>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-content-primary-light dark:text-content-primary-dark">{profile.totalXp}</span>
                    <Flame className="h-5 w-5 text-amber-500 opacity-60 mb-0.5" />
                  </div>
                </Card>
              </div>

              {/* Progress metrics progress bar */}
              <Card className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                    <Award className="h-5 w-5 text-amber-500" /> Progression Level Status
                  </h3>
                  <Badge variant="brand" className="font-mono">Level {profile.level}</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-content-secondary-light dark:text-gray-400">Level Progress</span>
                    <span className="text-primary font-mono">{xpInCurrentLevel} / 100 XP</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-brand-light dark:bg-brand-dark overflow-hidden border border-border-light dark:border-border-dark shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-ai rounded-full transition-all duration-500"
                      style={{ width: `${xpInCurrentLevel}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Profile details text */}
              <Card className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                    <Info className="h-5 w-5 text-primary" /> Account Metadata
                  </h3>
                  <Badge variant="brand">Verified Developer</Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-500">Display Name</span>
                    <p className="font-semibold text-content-primary-light dark:text-content-primary-dark text-sm">
                      {profile.name || <span className="text-gray-500 italic">Not Set (Anonymous)</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-500">Email Address</span>
                    <p className="font-semibold text-content-primary-light dark:text-content-primary-dark text-sm">{profile.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-500">Preferred Language</span>
                    <p className="font-semibold text-content-primary-light dark:text-content-primary-dark text-sm">{profile.preferredLanguage}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-500">Status</span>
                    <p className="font-semibold text-success flex items-center gap-1 text-sm">
                      <span className="h-2 w-2 rounded-full bg-success inline-block animate-ping"></span> Active / Sync Done
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
