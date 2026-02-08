import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, DayContent } from '../context/AuthContext';
import {
  Heart,
  Upload,
  LogOut,
  Copy,
  Eye,
  User,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  HelpCircle,
  Shield,
  Music,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { HelpDialog } from './HelpDialog';
import { VALENTINE_DAYS } from '../constants/valentineDays';
import { AdminPanel } from './AdminPanel';

interface DayPhotos {
  [key: string]: any[];
}

interface DayForms {
  [key: string]: DayContent;
}

const emptyDayForm: DayContent = {
  customMessage: '',
  heroTitle: '',
  heroSubtitle: '',
  quote: '',
  songUrl: '',
  ctaLabel: '',
  hideNoButton: false,
};

export const Dashboard = () => {
  const {
    user,
    logout,
    updateProfile,
    uploadPhoto,
    deletePhoto,
    getPublicProfile,
    updateDayContent,
    getDayContent,
  } = useAuth();
  const navigate = useNavigate();
  const [partnerName, setPartnerName] = useState(user?.partnerName || '');
  const [message, setMessage] = useState(user?.message || '');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [dayPhotos, setDayPhotos] = useState<DayPhotos>({});
  const [dayForms, setDayForms] = useState<DayForms>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [heartClicks, setHeartClicks] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (user?.username) {
      loadUserData();

      const hasSeenHelp = localStorage.getItem(`help_seen_${user.username}`);
      if (!hasSeenHelp) {
        setShowHelp(true);
        localStorage.setItem(`help_seen_${user.username}`, 'true');
      }
    }
  }, [user?.username]);

  const loadUserData = async () => {
    if (!user?.username) return;
    setLoadingData(true);

    const profileData = await getPublicProfile(user.username);
    if (profileData) {
      setDayPhotos(profileData.photos || {});
    }

    const contentEntries = await Promise.all(
      VALENTINE_DAYS.map(async (day) => {
        const content = await getDayContent(user.username, day.path);
        return [day.path, { ...emptyDayForm, ...content }] as const;
      }),
    );

    const formMap = contentEntries.reduce<DayForms>((acc, [dayPath, content]) => {
      acc[dayPath] = content;
      return acc;
    }, {});

    setDayForms(formMap);
    setLoadingData(false);
  };

  const handleImageUpload = async (day: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentPhotosCount = dayPhotos[day]?.length || 0;
    if (currentPhotosCount >= 6) {
      toast.error('Maximum 6 photos per day allowed');
      return;
    }

    const remainingSlots = 6 - currentPhotosCount;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setUploading(day);

    for (const file of filesToUpload) {
      const result = await uploadPhoto(day, file);
      if (result.success && result.photo) {
        setDayPhotos((prev) => ({
          ...prev,
          [day]: [...(prev[day] || []), result.photo],
        }));
      } else {
        toast.error(result.error || 'Upload failed');
      }
    }

    toast.success(`Photos uploaded for ${VALENTINE_DAYS.find((d) => d.path === day)?.name}`);
    setUploading(null);
    if (fileInputRefs.current[day]) {
      fileInputRefs.current[day]!.value = '';
    }
  };

  const handleDeletePhoto = async (day: string, photoId: number) => {
    await deletePhoto(day, photoId);
    setDayPhotos((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((p: any) => p.id !== photoId),
    }));
    toast.success('Photo deleted');
  };

  const handleSaveProfile = async () => {
    await updateProfile({ partnerName, message });
    toast.success('Profile saved');
  };

  const handleSaveDay = async (day: string) => {
    const payload = dayForms[day] || emptyDayForm;
    await updateDayContent(day, payload);
    toast.success(`${VALENTINE_DAYS.find((d) => d.path === day)?.name} content saved`);
  };

  const handleCopyLink = async (dayPath: string, short = false) => {
    const link = short
      ? `${window.location.origin}/${dayPath}`
      : `${window.location.origin}/${user?.username}/${dayPath}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied');
    } catch {
      toast.info(`Link: ${link}`, { duration: 5000 });
    }
  };

  const handlePreview = (dayPath: string, short = false) => {
    navigate(short ? `/${dayPath}` : `/${user?.username}/${dayPath}`, {
      state: {
        skipIntro: true,
        previewUsername: user?.username,
        previewDayContent: dayForms[dayPath] || emptyDayForm,
        previewPhotos: dayPhotos[dayPath] || [],
      },
    });
  };

  const updateDayField = (dayPath: string, key: keyof DayContent, value: string | boolean) => {
    setDayForms((prev) => ({
      ...prev,
      [dayPath]: {
        ...(prev[dayPath] || emptyDayForm),
        [key]: value,
      },
    }));
  };

  const handleLogoClick = () => {
    setHeartClicks((prev) => prev + 1);

    if (heartClicks === 4) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.3 },
        colors: ['#ff006e', '#fb5607', '#8338ec', '#ff006e'],
      });
      toast.success('Secret mode unlocked');
      setHeartClicks(0);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe8f2_0%,_#fff4ee_36%,_#fff_100%)]">
      <div className="bg-white/80 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogoClick}
              className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 rounded-full flex items-center justify-center cursor-pointer"
            >
              <Heart className="text-white" size={20} fill="white" />
            </motion.div>
            <div>
              <h1 className="font-semibold text-gray-800">HappyValentine.in</h1>
              <p className="text-sm text-gray-500">Logged in as {user?.username} ({user?.role || 'member'})</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowHelp(true)} variant="outline" className="border-rose-200 hover:bg-rose-50">
              <HelpCircle size={16} className="mr-2" />
              Help
            </Button>
            <Button onClick={logout} variant="outline" className="border-rose-200 hover:bg-rose-50">
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-white/90 backdrop-blur-lg border-rose-100">
              <h2 className="text-xl mb-4 flex items-center gap-2">
                <User size={20} className="text-rose-500" />
                Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-gray-700 text-sm">Username</Label>
                  <div className="mt-1 px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700">{user?.username}</div>
                </div>
                <div>
                  <Label htmlFor="partnerName" className="text-gray-700">Partner Name</Label>
                  <Input
                    id="partnerName"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Your special someone"
                    className="mt-1 border-rose-200 focus:border-rose-500"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-gray-700">Global Love Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Default message for all days"
                    maxLength={240}
                    rows={3}
                    className="mt-1 border-rose-200 focus:border-rose-500 resize-none"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white"
                >
                  Save Profile
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-rose-100 to-orange-50 border-rose-200">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-rose-800">
                <Sparkles size={18} />
                Quick Tips
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Upload 1-6 photos per day</li>
                <li>Use custom title/subtitle/quote for each day</li>
                <li>Add Spotify/YouTube song links</li>
                <li>Share `/username/day` or short `/day` links</li>
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {user?.role === 'admin' && <AdminPanel />}

            <Card className="p-6 bg-white/90 backdrop-blur-lg border-rose-100">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <Heart size={24} className="text-rose-500" fill="currentColor" />
                Day-wise Portfolio Builder
              </h2>

              {loadingData ? (
                <p className="text-gray-600">Loading your content...</p>
              ) : (
                <div className="space-y-3">
                  {VALENTINE_DAYS.map((day) => {
                    const isExpanded = expandedDay === day.path;
                    const photos = dayPhotos[day.path] || [];
                    const form = dayForms[day.path] || emptyDayForm;

                    return (
                      <motion.div key={day.path} className="border-2 border-rose-100 rounded-xl overflow-hidden bg-white">
                        <div
                          onClick={() => setExpandedDay(isExpanded ? null : day.path)}
                          className={`p-4 cursor-pointer transition-all ${
                            isExpanded ? `bg-gradient-to-r ${day.color} text-white` : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{day.emoji}</span>
                              <div>
                                <h3 className={`text-lg font-semibold ${!isExpanded ? 'text-gray-800' : ''}`}>
                                  {day.name}
                                </h3>
                                <p className={`text-sm ${isExpanded ? 'text-white/85' : 'text-gray-500'}`}>
                                  {day.description} • {photos.length}/6 photos
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(day.path);
                                }}
                                className={isExpanded ? 'text-white hover:bg-white/20' : ''}
                              >
                                <Eye size={16} className="mr-1" /> Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyLink(day.path);
                                }}
                                className={isExpanded ? 'text-white hover:bg-white/20' : ''}
                              >
                                <Copy size={16} />
                              </Button>
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 space-y-6 bg-gradient-to-br from-rose-50/60 to-orange-50/40">
                                <div>
                                  <Label className="text-gray-700 mb-3 flex items-center gap-2">
                                    <ImageIcon size={18} className="text-rose-500" /> Photos ({photos.length}/6)
                                  </Label>

                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                                    {photos.map((photo: any) => (
                                      <motion.div
                                        key={photo.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="relative group aspect-square rounded-lg overflow-hidden shadow-md"
                                      >
                                        <img src={photo.url} alt={`${day.name} photo`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeletePhoto(day.path, photo.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            <Trash2 size={16} />
                                          </Button>
                                        </div>
                                      </motion.div>
                                    ))}

                                    {photos.length < 6 && (
                                      <button
                                        type="button"
                                        onClick={() => fileInputRefs.current[day.path]?.click()}
                                        className="aspect-square rounded-lg border-2 border-dashed border-rose-300 bg-rose-50 hover:bg-rose-100 cursor-pointer flex flex-col items-center justify-center transition-colors"
                                      >
                                        {uploading === day.path ? (
                                          <div className="text-rose-500">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                              <Upload size={24} />
                                            </motion.div>
                                            <p className="text-xs mt-2">Uploading...</p>
                                          </div>
                                        ) : (
                                          <>
                                            <Upload size={24} className="text-rose-400 mb-1" />
                                            <p className="text-xs text-gray-600">Add Photo</p>
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  <input
                                    ref={(el) => (fileInputRefs.current[day.path] = el)}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleImageUpload(day.path, e)}
                                    className="hidden"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Hero Title</Label>
                                    <Input
                                      value={form.heroTitle || ''}
                                      onChange={(e) => updateDayField(day.path, 'heroTitle', e.target.value)}
                                      placeholder={`Happy ${day.name}`}
                                      className="mt-1 border-rose-200"
                                    />
                                  </div>
                                  <div>
                                    <Label>Hero Subtitle</Label>
                                    <Input
                                      value={form.heroSubtitle || ''}
                                      onChange={(e) => updateDayField(day.path, 'heroSubtitle', e.target.value)}
                                      placeholder="One line subtitle"
                                      className="mt-1 border-rose-200"
                                    />
                                  </div>
                                  <div>
                                    <Label>Romantic Quote</Label>
                                    <Input
                                      value={form.quote || ''}
                                      onChange={(e) => updateDayField(day.path, 'quote', e.target.value)}
                                      placeholder="Your quote"
                                      className="mt-1 border-rose-200"
                                    />
                                  </div>
                                  <div>
                                    <Label className="flex items-center gap-1"><Music size={15} /> Song URL</Label>
                                    <Input
                                      value={form.songUrl || ''}
                                      onChange={(e) => updateDayField(day.path, 'songUrl', e.target.value)}
                                      placeholder="Spotify/YouTube link"
                                      className="mt-1 border-rose-200"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Custom Message</Label>
                                  <Textarea
                                    value={form.customMessage || ''}
                                    onChange={(e) => updateDayField(day.path, 'customMessage', e.target.value)}
                                    placeholder={`Write a special ${day.name} message...`}
                                    rows={3}
                                    className="mt-2 border-rose-200 resize-none"
                                  />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <Label>CTA Label (Yes button text)</Label>
                                    <Input
                                      value={form.ctaLabel || ''}
                                      onChange={(e) => updateDayField(day.path, 'ctaLabel', e.target.value)}
                                      placeholder="Yes, absolutely!"
                                      className="mt-1 border-rose-200"
                                    />
                                  </div>
                                  <label className="text-sm text-gray-700 mt-6 flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(form.hideNoButton)}
                                      onChange={(e) => updateDayField(day.path, 'hideNoButton', e.target.checked)}
                                    />
                                    Hide “No” button
                                  </label>
                                </div>

                                <div className="pt-4 border-t border-rose-200 space-y-3">
                                  <Label className="text-gray-700 block">Share this day</Label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="flex gap-2">
                                      <Input readOnly value={`${window.location.origin}/${user?.username}/${day.path}`} className="text-sm bg-gray-50 border-rose-200" />
                                      <Button onClick={() => handleCopyLink(day.path)} className="bg-gradient-to-r from-rose-500 to-red-500 text-white">
                                        <LinkIcon size={16} className="mr-2" /> Copy
                                      </Button>
                                    </div>
                                    <div className="flex gap-2">
                                      <Input readOnly value={`${window.location.origin}/${day.path}`} className="text-sm bg-gray-50 border-rose-200" />
                                      <Button onClick={() => handleCopyLink(day.path, true)} variant="outline" className="border-rose-200">
                                        <Copy size={16} className="mr-2" /> Short Link
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Short links open the featured creator set by admin.
                                  </p>
                                </div>

                                <div className="flex gap-2 justify-end">
                                  <Button onClick={() => handlePreview(day.path, true)} variant="outline" className="border-rose-200">
                                    Preview Short
                                  </Button>
                                  <Button
                                    onClick={() => handleSaveDay(day.path)}
                                    className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white"
                                  >
                                    Save Day Content
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>

            {user?.role !== 'admin' && (
              <Card className="p-4 border-amber-200 bg-amber-50/70">
                <div className="text-sm text-amber-900 flex items-start gap-2">
                  <Shield size={16} className="mt-0.5" />
                  Short links like `/rose` depend on admin featured creator selection. Your personal links always work.
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <HelpDialog open={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};
