import React from 'react';
import { motion } from 'motion/react';
import { X, Heart, Upload, Link, Eye, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export const HelpDialog = ({ open, onClose }: HelpDialogProps) => {
  const features = [
    {
      icon: <Upload className="text-pink-500" size={24} />,
      title: 'Upload Photos',
      description: 'Upload up to 6 photos for each of the 8 Valentine days. Your memories, beautifully organized.',
    },
    {
      icon: <MessageCircle className="text-purple-500" size={24} />,
      title: 'Custom Messages',
      description: 'Write personalized messages for each day. Make every page unique and special.',
    },
    {
      icon: <Link className="text-blue-500" size={24} />,
      title: 'Shareable URLs',
      description: 'Share personal links like /yourname/rose or short links like /rose (featured creator).',
    },
    {
      icon: <Eye className="text-green-500" size={24} />,
      title: 'Preview Pages',
      description: 'See exactly what your valentine will see before sharing.',
    },
    {
      icon: <Heart className="text-red-500" size={24} fill="currentColor" />,
      title: 'Interactive Feature',
      description: 'Every page includes the viral "Will You Be My Valentine?" with the moving "No" button!',
    },
    {
      icon: <Sparkles className="text-amber-500" size={24} />,
      title: 'Beautiful Animations',
      description: 'Romantic animations, floating hearts, and confetti make every page magical.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
            Welcome to HappyValentine.in 💕
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Create personalized Valentine pages for all 8 days of love
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* The 8 Days */}
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-6 border-2 border-pink-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="text-pink-500" size={20} fill="currentColor" />
              The 8 Days of Valentine's Week
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-1">🌹</div>
                <div className="font-medium">Rose Day</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-1">💍</div>
                <div className="font-medium">Propose Day</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-1">🍫</div>
                <div className="font-medium">Chocolate Day</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-1">🧸</div>
                <div className="font-medium">Teddy Day</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-1">🤝</div>
                <div className="font-medium">Promise Day</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-1">🤗</div>
                <div className="font-medium">Hug Day</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-1">💋</div>
                <div className="font-medium">Kiss Day</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl mb-1">❤️</div>
                <div className="font-medium">Valentine's Day</div>
              </div>
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Start Guide
            </h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-pink-500">1.</span>
                <span>Update your profile with partner's name and a general message</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-pink-500">2.</span>
                <span>Click on any day to expand and start uploading photos</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-pink-500">3.</span>
                <span>Add custom messages for each special day</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-pink-500">4.</span>
                <span>Preview your pages to see how they look</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-pink-500">5.</span>
                <span>Copy and share personal links, or short links if admin configured featured creator</span>
              </li>
            </ol>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Upload high-quality photos for the best experience</li>
              <li>• Write heartfelt, personal messages - they make all the difference!</li>
              <li>• Share different day URLs on different days for maximum impact</li>
              <li>• The "Will You Be My Valentine?" feature works best on the final Valentine's Day page</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          >
            Got it! Let's create magic ✨
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
