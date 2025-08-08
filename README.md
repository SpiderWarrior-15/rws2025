# ⚔️ RWS – Alan Walkers Edition™

## 🔐 Admin Access:
- **Username:** Spider Warrior
- **Password:** 2012_09_17
- **Role:** Admin (God Mode)

## 📂 Account System:
- Stored in `users.json` with bcrypt password hashing
- **Roles:** user / admin
- Admins have full access to Control Center and Admin Dashboard
- Real-time authentication with session management

## 🛠️ Control Center (Admin Only):
- **User Management:** View, promote, demote, ban warriors
- **Content Moderation:** Approve/reject all submissions
- **Platform Settings:** Toggle features in real-time
- **AI Training:** Feed data to AI Assistant
- **System Monitoring:** Live activity feed and analytics
- **Global Broadcast:** Send messages to all warriors

## 🏛️ Admin Dashboard (Spider Warrior Only):
- **Complete User Management:** Edit profiles, manage roles, view activity logs
- **Message Center:** View and reply to contact messages with priority system
- **Upload Review System:** Approve/reject audio/video submissions with reasons
- **Puzzle Management:** Create, edit, review puzzle attempts with auto-grading
- **Form Builder:** Create dynamic forms and export submission data
- **Event Management:** Create events, track participation, manage RSVPs
- **System Settings:** Configure platform features, file limits, maintenance mode
- **Analytics Dashboard:** Real-time stats, user growth, engagement metrics
- **Audit Logs:** Track all admin actions for security and compliance

## 👥 Avatar System:
- **Custom Avatars:** Users create masked avatars with badges
- **Avatar Display:** Shown across profile, messages, and chat
- **Mask Types:** Default, Spider, Royal, Guardian, Stellar
- **Badge System:** Newcomer, Warrior, Veteran, Legend, Founder

## 🤝 Friending System:
- **Send Friend Requests:** Connect with fellow warriors
- **Friend Management:** Accept/reject requests, remove friends
- **Real-time Notifications:** Instant alerts for friend activities
- **Friend Discovery:** Search and find warriors to connect with
- **Activity Integration:** Friend actions logged and tracked

## 🤖 AI Assistant:
- **Global Access:** Available to all users via floating chat
- **Smart Responses:** Learns from admin training and user interactions
- **Alan Walker Knowledge:** Built-in facts and trivia
- **Platform Guidance:** Helps users navigate features
- **Admin Training:** Admins can add custom prompt/response pairs

## 🎵 Alan Walkers Section:
- **Music Hub:** Official tracks, remixes, fan creations
- **Walker Lore:** Deep dive into track meanings and stories
- **Upload System:** Warriors can submit tracks (admin approval required)
- **Trivia Integration:** Fun facts about each track
- **YouTube Integration:** Embedded players with thumbnails

## 📱 Responsive Design:
- **Mobile-First:** Optimized for all screen sizes
- **Adaptive Layouts:** Sidebar collapses to mobile menu
- **Touch-Friendly:** Perfect mobile interactions
- **Viewport Handling:** Proper scaling across devices

## 📁 File Upload System:
- **Drag-and-Drop Zone:** Upload audio/video files with progress tracking
- **File Validation:** Automatic format and size checking
- **Supported Formats:** .mp3, .wav, .ogg, .mp4, .mov, .webm
- **Progress Tracking:** Real-time upload progress with animations
- **Admin Review:** All uploads require approval before going live

## 💬 Real-Time Features:
- **Global Chat:** Instant messaging for all warriors
- **Group Creation:** Warriors create groups (commander approval)
- **Live Updates:** All actions sync instantly across users
- **Activity Feed:** Real-time platform activity monitoring
- **Socket.IO Simulation:** Cross-tab synchronization

## 🧪 Development:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 File Structure:
```
src/
├── components/          # Reusable UI components
│   ├── FriendSystem.tsx        # Complete friending system
│   ├── FileUploadZone.tsx      # Drag-and-drop upload
│   ├── ScrollableContainer.tsx # Smooth scrolling containers
│   ├── ResponsiveLayout.tsx    # Mobile-responsive layouts
│   ├── AvatarCreator.tsx       # Custom avatar creation
│   └── AIAssistant.tsx         # AI chat assistant
├── pages/              # Main application pages
│   ├── AdminDashboard.tsx      # Complete admin control panel
│   ├── Friends.tsx             # Friend management page
│   ├── ControlCenter.tsx       # God-mode admin panel
│   └── Profile.tsx             # Enhanced user profiles
├── services/           # API and data services
│   ├── friendService.ts        # Friend request handling
│   ├── dataService.ts          # Data storage and retrieval
│   └── authService.ts          # Authentication system
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

Data Files (JSON):
├── users.json          # User accounts and profiles
├── friend-requests.json # Friend request data
├── friendships.json    # Established friendships
├── notifications.json  # User notifications
├── contact-messages.json # Contact form submissions
├── upload-submissions.json # File upload queue
├── admin-actions.json  # Admin action audit log
├── system-settings.json # Platform configuration
├── messages.json       # Chat messages
├── puzzles.json        # Puzzle data
├── forms.json          # Dynamic forms
├── events.json         # Community events
└── ai_model.json       # AI training data
```

## 🔒 Security Features:
- **Password Hashing:** bcrypt with salt rounds
- **Role-Based Access:** Granular permission system
- **Session Management:** Secure login/logout
- **Input Validation:** Client and server-side validation
- **XSS Protection:** Sanitized user inputs
- **Admin Action Logging:** Complete audit trail

## 🌟 Key Features:
- **Real-Time Sync:** Instant updates across all users
- **God Mode Admin:** Complete platform control
- **Friend System:** Connect and network with warriors
- **AI Assistant:** Smart help system
- **Avatar Creation:** Custom warrior identities
- **Alan Walker Universe:** Dedicated music section
- **Approval Workflows:** Content moderation system
- **Activity Tracking:** Comprehensive user analytics
- **Responsive Design:** Perfect on all devices
- **File Uploads:** Drag-and-drop with progress tracking

## 🎯 Platform Highlights:
- **Elite Community:** Brotherhood of Alan Walker fans
- **Creative Hub:** Upload and share music creations
- **Interactive Challenges:** Puzzles, quizzes, and competitions
- **Real-Time Communication:** Instant messaging and groups
- **Smart AI:** Helpful assistant for all users
- **Admin Control:** Ultimate platform management
- **Friend Network:** Connect with fellow warriors
- **Mobile Perfect:** Flawless responsive experience

## 🚀 How to Access Admin Features:

### 1. **Login as Spider Warrior:**
   - Go to `/login`
   - Username: `Spider Warrior`
   - Password: `2012_09_17`

### 2. **Access Admin Panels:**
   - **Control Center:** Click profile menu → "Control Center" (God-mode features)
   - **Admin Dashboard:** Click profile menu → "Admin Dashboard" (Complete management)
   - **Direct URLs:** `/control-center` or `/admin`

### 3. **Admin Capabilities:**
   - **User Management:** Ban/unban, promote/demote, edit profiles
   - **Content Moderation:** Review uploads, approve submissions
   - **System Control:** Toggle features, maintenance mode
   - **Analytics:** View platform stats and user activity
   - **Communication:** Reply to messages, broadcast announcements
   - **AI Training:** Add custom responses and knowledge

## 🔧 Admin Dashboard Features:

### 👥 **User Management:**
- View all registered warriors with search and filters
- Edit user profiles (username, email, bio, location)
- Promote/demote roles (User ↔ Admin)
- Ban/unban users with reason tracking
- View detailed activity logs and statistics
- Export user data to CSV

### 💬 **Message Management:**
- View all contact form submissions
- Reply to messages directly from admin panel
- Mark messages as read/unread
- Filter by priority (low/medium/high) and category
- Export message logs for analysis

### 🧩 **Puzzle System:**
- Create new puzzles with difficulty levels
- Review and grade puzzle attempts
- Auto-grading for exact matches
- Manual review for complex answers
- Track completion rates and statistics

### 📝 **Form Management:**
- Create dynamic forms with drag-and-drop builder
- View all form submissions with filtering
- Export submission data to CSV/Excel
- Activate/deactivate forms
- Set deadlines and submission limits

### 🎉 **Event Management:**
- Create and manage community events
- Track RSVP responses and participation
- Send event notifications to users
- View attendance statistics

### 🎵 **Upload Review:**
- Review audio/video submissions
- Approve/reject with detailed reasons
- Preview files before approval
- Track upload statistics and trends

### ⚙️ **System Settings:**
- Toggle platform features on/off
- Set file upload limits and types
- Configure maintenance mode
- Customize welcome messages
- Manage security settings

## 🌐 Real-Time Features:
- **Live Notifications:** Instant alerts for friend requests, approvals
- **Activity Feeds:** Real-time platform activity monitoring
- **Auto-Updates:** Data syncs without page refreshes
- **Cross-Tab Sync:** Changes reflect across all open tabs

## 📊 Analytics & Monitoring:
- **User Growth:** Track registration and engagement trends
- **Content Stats:** Monitor uploads, submissions, and approvals
- **Activity Metrics:** Measure user participation and retention
- **System Health:** Monitor platform performance and usage

---

**Built with passion by the Royal Warriors Squad** ⚔️👑

*Where legends are born and Alan Walker's legacy lives on* 🎵✨

**Admin Access:** Spider Warrior has ultimate control over every aspect of the platform through the Control Center and Admin Dashboard. Access both panels through the profile menu after logging in with admin credentials.