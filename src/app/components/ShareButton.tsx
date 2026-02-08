import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Mail, MessageCircle, Link } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

export const ShareButton = ({ url, title, description }: ShareButtonProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard! 🔗');
    } catch (error) {
      toast.info(`Link: ${url}`, { duration: 5000 });
    }
  };

  const shareVia = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast.success('Shared successfully! 💕');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-pink-200 hover:bg-pink-50"
        >
          <Share2 size={16} className="mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={nativeShare}>
            <Share2 size={16} className="mr-2" />
            Share via...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={copyToClipboard}>
          <Link size={16} className="mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareVia('whatsapp')}>
          <MessageCircle size={16} className="mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareVia('twitter')}>
          <Twitter size={16} className="mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareVia('facebook')}>
          <Facebook size={16} className="mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareVia('email')}>
          <Mail size={16} className="mr-2" />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
