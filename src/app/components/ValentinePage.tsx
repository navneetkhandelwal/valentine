import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowLeft, ChevronLeft, ChevronRight, X, Music } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WillYouBeMyValentine } from './WillYouBeMyValentine';
import { Button } from './ui/button';
import { ShareButton } from './ShareButton';
import { useAuth } from '../context/AuthContext';
import { VALID_DAY_PATHS, VALENTINE_DAY_MAP } from '../constants/valentineDays';

const getEmbedUrl = (url?: string) => {
  if (!url) return '';
  try {
    if (url.includes('open.spotify.com')) {
      const cleanUrl = url.replace('/track/', '/embed/track/').replace('/playlist/', '/embed/playlist/');
      return cleanUrl.split('?')[0] + '?autoplay=1';
    }

    if (url.includes('youtube.com/watch')) {
      const id = new URL(url).searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : '';
    }

    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : '';
    }
  } catch {
    return '';
  }

  return '';
};

export const ValentinePage = () => {
  const { username: rawUsername, day: rawDay } = useParams<{ username: string; day: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getPublicProfile, getDayContent, getFeaturedPage } = useAuth();

  const [resolvedUsername, setResolvedUsername] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);
  const [dayContent, setDayContent] = useState<any>({});
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizeRoute = () => {
    if (rawDay && VALID_DAY_PATHS.includes(rawDay)) {
      const queryUsername = new URLSearchParams(location.search).get('from') || '';
      return { day: rawDay, username: rawUsername || queryUsername };
    }

    return { day: '', username: '' };
  };

  const route = normalizeRoute();
  const valentineDay = route.day ? VALENTINE_DAY_MAP[route.day] : null;

  useEffect(() => {
    loadPageData();

    if (valentineDay) {
      document.title = `Happy ${valentineDay.name} ❤️`;
    }

    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.62 },
        colors: ['#ff005d', '#ff7a00', '#ff2f92', '#8f46ff'],
      });
    }, 450);

    return () => {
      clearTimeout(timer);
      document.title = 'HappyValentine.in';
    };
  }, [rawUsername, rawDay, location.search]);

  const loadPageData = async () => {
    if (!route.day || !valentineDay) {
      setError('Invalid page');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    if (route.username) {
      const profile = await getPublicProfile(route.username);
      if (!profile) {
        setError('Creator not found');
        setLoading(false);
        return;
      }

      const content = await getDayContent(route.username, route.day);
      setResolvedUsername(route.username);
      setProfileData(profile.profile);
      setDayContent(content || {});
      setPhotos(profile.photos?.[route.day] || []);
      setLoading(false);
      return;
    }

    const featuredData = await getFeaturedPage(route.day);
    if (!featuredData) {
      setError('No featured creator configured for short links');
      setLoading(false);
      return;
    }

    setResolvedUsername(featuredData.username || '');
    setProfileData(featuredData.profile || {});
    setDayContent(featuredData.dayContent || {});
    setPhotos(featuredData.photos || []);
    setLoading(false);
  };

  if (!valentineDay || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 to-orange-100 p-6">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl text-gray-700 mb-3">Page unavailable</h1>
          <p className="text-gray-500 mb-6">{error || 'The requested Valentine page does not exist.'}</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Heart className="text-rose-500" size={48} fill="currentColor" />
        </motion.div>
      </div>
    );
  }

  const displayTitle = dayContent?.heroTitle || `Happy ${valentineDay.name}!`;
  const displaySubtitle = dayContent?.heroSubtitle || (profileData?.partnerName ? `For ${profileData.partnerName}` : 'Made with love');
  const displayMessage = dayContent?.customMessage || profileData?.message || valentineDay.message;
  const displayQuote = dayContent?.quote || '';
  const embedUrl = getEmbedUrl(dayContent?.songUrl);
  const ctaLabel = dayContent?.ctaLabel || 'Yes! 💕';

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-rose-50 via-orange-50 to-pink-100 overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(${valentineDay.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-16 h-64 w-64 rounded-full bg-fuchsia-300/25 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="p-4 flex items-center justify-between">
          <Button onClick={() => navigate('/')} variant="ghost" className="text-gray-700 hover:bg-white/60">
            <ArrowLeft size={20} className="mr-2" /> Back
          </Button>

          <ShareButton
            url={window.location.href}
            title={`${displayTitle} - ${resolvedUsername}`}
            description="A personalized Valentine experience"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 1, delay: 0.15 }}
              className="text-8xl mb-4"
            >
              {valentineDay.emoji}
            </motion.div>
            <h1 className={`text-5xl md:text-6xl mb-4 bg-gradient-to-r ${valentineDay.color} bg-clip-text text-transparent font-bold`}>
              {displayTitle}
            </h1>
            <p className="text-2xl text-gray-700 font-medium">{displaySubtitle} 💞</p>
            <p className="text-sm text-gray-500 mt-2">from @{resolvedUsername}</p>
          </motion.div>

          {photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-rose-100">
                <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Memory Portfolio 📸</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo: any, index: number) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.07 }}
                      whileHover={{ scale: 1.04, rotate: 1 }}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className="aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                    >
                      <img
                        src={photo.url}
                        alt={`Memory ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.42 }}
            className="bg-white/88 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-rose-100"
          >
            <div className="text-center">
              <Heart className="inline-block text-rose-500 mb-4" size={32} fill="currentColor" />
              <p className="text-2xl text-gray-700 leading-relaxed mb-5 font-medium">{displayMessage}</p>
              {displayQuote && <p className="text-lg text-rose-600 italic mb-4">“{displayQuote}”</p>}
              <p className="text-base text-gray-500 italic">- from @{resolvedUsername}</p>
            </div>
          </motion.div>

          {embedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/90 rounded-3xl p-6 mb-12 border border-rose-100 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Music size={18} className="text-rose-500" /> Our Song
              </h3>
              <iframe
                src={embedUrl}
                className="w-full h-[180px] rounded-xl border border-rose-100"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Valentine soundtrack"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-rose-100"
          >
            <WillYouBeMyValentine yesLabel={ctaLabel} hideNoButton={Boolean(dayContent?.hideNoButton)} />
          </motion.div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0.35,
            }}
            animate={{
              y: -100,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            }}
            transition={{
              duration: Math.random() * 8 + 10,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
          >
            <Heart fill="currentColor" size={Math.random() * 18 + 10} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhotoIndex(null)}
          >
            <Button
              onClick={() => setSelectedPhotoIndex(null)}
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X size={24} />
            </Button>

            <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
              {selectedPhotoIndex > 0 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex(selectedPhotoIndex - 1);
                  }}
                  variant="ghost"
                  className="absolute left-4 text-white hover:bg-white/20 z-10"
                >
                  <ChevronLeft size={32} />
                </Button>
              )}

              <motion.img
                key={selectedPhotoIndex}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                src={photos[selectedPhotoIndex].url}
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />

              {selectedPhotoIndex < photos.length - 1 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex(selectedPhotoIndex + 1);
                  }}
                  variant="ghost"
                  className="absolute right-4 text-white hover:bg-white/20 z-10"
                >
                  <ChevronRight size={32} />
                </Button>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {selectedPhotoIndex + 1} / {photos.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
