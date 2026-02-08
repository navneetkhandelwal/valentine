# HappyValentine.in - Platform Guide 💕

## Overview
HappyValentine.in is a premium Valentine's Day micro-website platform that allows users to create personalized, shareable Valentine experiences across all 8 days of Valentine's Week.

## 🌟 Key Features

### 1. Multi-User Support
- **User Registration**: Anyone can create an account with username, email, and password
- **Secure Authentication**: Powered by Supabase Auth
- **Unique URLs**: Each user gets their own namespace (e.g., happyvalentine.in/john/rose)

### 2. Photo Management
- **6 Photos per Day**: Upload up to 6 photos for each of the 8 Valentine days
- **Cloud Storage**: All images stored in Supabase Storage with signed URLs
- **Gallery View**: Beautiful photo galleries with lightbox functionality
- **Easy Management**: Upload, view, and delete photos with simple interface

### 3. The 8 Days of Valentine's Week
Each day has its own dedicated page:
1. 🌹 **Rose Day** - Express love with roses
2. 💍 **Propose Day** - Pop the question
3. 🍫 **Chocolate Day** - Sweeten the day
4. 🧸 **Teddy Day** - Cuddles and comfort
5. 🤝 **Promise Day** - Make lasting promises
6. 🤗 **Hug Day** - Warm embraces
7. 💋 **Kiss Day** - Sealed with a kiss
8. ❤️ **Valentine's Day** - The ultimate day of love

### 4. Customization Options
- **Profile Settings**: Partner name and general love message
- **Day-Specific Messages**: Custom messages for each day (up to 300 characters)
- **Photo Galleries**: Curated photo collections for each day
- **Themes**: Each day has unique color schemes and emoji themes

### 5. Viral Interactive Feature
**"Will You Be My Valentine?"**
- Yes button stays stable
- No button moves away when approached (mouse hover, touch, or click)
- Playful messages appear with each attempt
- Confetti celebration when "Yes" is clicked
- Haptic feedback on mobile devices

### 6. Sharing Capabilities
- **Direct URLs**: Each day has a unique shareable URL
- **Copy to Clipboard**: One-click link copying
- **Social Sharing**: Share via WhatsApp, Twitter, Facebook, Email
- **Native Share API**: Uses device's native share menu when available
- **Preview Mode**: See exactly what recipients will see

### 7. Beautiful Design
- **Romantic Color Palette**: Pink, rose, red, lavender gradients
- **Smooth Animations**: Motion-powered transitions and effects
- **Floating Hearts**: Ambient animated hearts on every page
- **Confetti Effects**: Celebration animations
- **Glass Morphism**: Modern backdrop-blur effects
- **Responsive Design**: Mobile-first, works beautifully on all devices

### 8. User Experience
- **First-Time Onboarding**: Automatic help dialog for new users
- **Interactive Help**: Comprehensive guide with examples
- **Toast Notifications**: Clear feedback for all actions
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful 404 and error pages

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18.3.1** - UI framework
- **React Router 7** - Client-side routing
- **Motion (Framer Motion)** - Advanced animations
- **Tailwind CSS v4** - Styling and responsive design
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Canvas Confetti** - Celebration effects
- **Sonner** - Toast notifications

### Backend Stack
- **Supabase** - Backend as a Service
  - **Auth**: User authentication and session management
  - **Storage**: Cloud file storage for images
  - **Database**: PostgreSQL with KV store
- **Hono** - Edge function web server (Deno runtime)
- **Server Routes**:
  - `POST /signup` - Create new user account
  - `POST /signin` - Authenticate user
  - `GET /user` - Get current user session
  - `PUT /profile` - Update user profile
  - `POST /upload/:day` - Upload photo for specific day
  - `DELETE /photo/:day/:photoId` - Delete photo
  - `GET /public/:username` - Get public profile data
  - `PUT /day-content/:day` - Update day-specific content
  - `GET /day-content/:username/:day` - Get day content

### Data Structure

**User Profile** (KV Store: `user_profile_{username}`):
```json
{
  "username": "john",
  "email": "john@example.com",
  "userId": "uuid",
  "partnerName": "Sarah",
  "message": "You make every day special",
  "createdAt": "2025-02-07T..."
}
```

**Photo Metadata** (KV Store: `photos_{username}_{day}`):
```json
[
  {
    "id": 1738901234567,
    "path": "john/rose/1738901234567_photo.jpg",
    "url": "signed_url_here",
    "uploadedAt": "2025-02-07T..."
  }
]
```

**Day Content** (KV Store: `day_content_{username}_{day}`):
```json
{
  "customMessage": "Special message for this day"
}
```

## 📱 User Flows

### Sign Up Flow
1. User clicks "Sign Up" tab
2. Enters username, email, password, partner name (optional)
3. System creates Supabase auth user
4. Profile stored in KV store
5. Auto-login and redirect to dashboard
6. Help dialog shown automatically

### Creating Valentine Pages
1. User logs into dashboard
2. Expands a day (e.g., Rose Day)
3. Uploads 1-6 photos
4. Writes custom message for that day
5. Saves content
6. Previews page
7. Copies shareable URL

### Sharing Experience
1. User copies URL for specific day
2. Shares via messaging app or social media
3. Recipient opens URL
4. Sees personalized page with:
   - Partner's name
   - Custom message
   - Photo gallery
   - Interactive "Will You Be My Valentine?" feature
5. Can share the page further

## 🎨 Design Principles

1. **Romance First**: Every element evokes love and warmth
2. **Simplicity**: Clean, intuitive interface
3. **Delight**: Surprise moments (confetti, moving button, animations)
4. **Mobile-First**: Perfect on phones where most sharing happens
5. **Fast**: Optimized loading and smooth interactions
6. **Accessible**: Clear labels, good contrast, keyboard navigation

## 🔒 Security & Privacy

- **Authenticated Actions**: Photo uploads require valid session
- **Private Storage**: Photos stored in private Supabase bucket
- **Signed URLs**: Time-limited access to images
- **Email Confirmation**: Auto-confirmed (no email server needed for demo)
- **No Public User List**: Can't browse other users' profiles unless you know username
- **Password Hashing**: Handled by Supabase Auth

## 🚀 Deployment Notes

### Environment Variables Needed
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (private, server-only)

### Domain Setup
When deploying to happyvalentine.in:
1. Point domain to deployment platform
2. Update CORS settings in server
3. Test all routes work with domain
4. Update Open Graph meta tags with final domain

## 💡 Pro Tips for Users

1. **High-Quality Photos**: Upload clear, well-lit photos for best impact
2. **Personal Messages**: Generic messages are nice, specific memories are magical
3. **Strategic Sharing**: Share different day URLs on their respective days
4. **Preview First**: Always preview before sharing
5. **Mobile Upload**: Take and upload photos directly from phone
6. **Backup**: Download photos before deleting

## 🎯 Future Enhancement Ideas

- **Video Support**: Upload short video clips
- **Music**: Background music for each day
- **Themes**: Multiple color themes to choose from
- **Templates**: Pre-written message templates
- **Countdown**: Countdown timer to Valentine's Day
- **Reactions**: Let recipients react to pages
- **Analytics**: See when pages were viewed
- **Print**: Generate printable valentine cards
- **QR Codes**: Generate QR codes for each page

## 🐛 Known Limitations

- **Demo Environment**: Figma Make is for prototyping, not production at scale
- **Email**: No email verification (auto-confirmed)
- **File Size**: 5MB per image limit
- **Storage**: Generous free tier, but has limits
- **Custom Domain**: Requires additional setup

## 📞 Support & Help

- **In-App Help**: Click "Help" button in dashboard
- **First-Time Guide**: Automatic help dialog for new users
- **Quick Tips**: Contextual tips throughout the interface

---

**Built with ❤️ for Valentine's Day 2025**

*May your love story be as beautiful as the pages you create!* 💕
