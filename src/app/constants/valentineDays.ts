export interface ValentineDay {
  name: string;
  path: string;
  emoji: string;
  color: string;
  description: string;
  message: string;
  bgImage: string;
}

export const VALENTINE_DAYS: ValentineDay[] = [
  {
    name: 'Rose Day',
    path: 'rose',
    emoji: '🌹',
    color: 'from-red-500 via-rose-500 to-pink-500',
    description: 'Express your love with roses',
    message: 'A rose for you, and all my heart behind it 🌹',
    bgImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Propose Day',
    path: 'propose',
    emoji: '💍',
    color: 'from-fuchsia-500 via-pink-500 to-rose-500',
    description: 'Pop the question!',
    message: 'Today and always, I choose you 💍',
    bgImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Chocolate Day',
    path: 'chocolate',
    emoji: '🍫',
    color: 'from-amber-700 via-orange-600 to-rose-500',
    description: 'Sweeten the day',
    message: 'Life with you is sweeter than any chocolate 🍫',
    bgImage: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Teddy Day',
    path: 'teddy',
    emoji: '🧸',
    color: 'from-amber-400 via-rose-400 to-pink-500',
    description: 'Cuddles and comfort',
    message: 'A teddy hug from me to you 🧸',
    bgImage: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Promise Day',
    path: 'promise',
    emoji: '🤝',
    color: 'from-blue-500 via-indigo-500 to-purple-500',
    description: 'Make lasting promises',
    message: 'I promise to keep choosing us, every day 🤝',
    bgImage: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Hug Day',
    path: 'hug',
    emoji: '🤗',
    color: 'from-teal-500 via-cyan-500 to-blue-500',
    description: 'Warm embraces',
    message: 'In your arms is my favorite home 🤗',
    bgImage: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: 'Kiss Day',
    path: 'kiss',
    emoji: '💋',
    color: 'from-rose-500 via-pink-500 to-fuchsia-500',
    description: 'Sealed with a kiss',
    message: 'Every kiss from you still feels like magic 💋',
    bgImage: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1600&q=80',
  },
  {
    name: "Valentine's Day",
    path: 'valentine',
    emoji: '❤️',
    color: 'from-red-500 via-pink-500 to-rose-600',
    description: 'The ultimate day of love',
    message: 'You are my forever Valentine ❤️',
    bgImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=80',
  },
];

export const VALENTINE_DAY_MAP = VALENTINE_DAYS.reduce<Record<string, ValentineDay>>((acc, day) => {
  acc[day.path] = day;
  return acc;
}, {});

export const VALID_DAY_PATHS = VALENTINE_DAYS.map((day) => day.path);
