# Knoux Nexar Pro - Design Specification

## Brand Identity

**App Name:** Knoux Nexar Pro  
**Tagline:** Professional Media & Recording Suite  
**Developer:** Eng. Sadek Elgazar (knoux)  
**Location:** Abu Dhabi, UAE  

## Color Palette

| Color | Light Mode | Dark Mode | Usage |
|-------|-----------|----------|-------|
| Primary | #0a7ea4 | #0a7ea4 | Buttons, highlights, accents |
| Background | #ffffff | #151718 | Screen backgrounds |
| Surface | #f5f5f5 | #1e2022 | Cards, containers |
| Foreground | #11181C | #ECEDEE | Primary text |
| Muted | #687076 | #9BA1A6 | Secondary text |
| Border | #E5E7EB | #334155 | Dividers, borders |
| Success | #22C55E | #4ADE80 | Success states |
| Warning | #F59E0B | #FBBF24 | Warning states |
| Error | #EF4444 | #F87171 | Error states |

## Screen Architecture

### 1. Splash Screen
**Purpose:** App launch animation with branding  
**Content:**
- Animated Knoux logo with particle effects
- App name and tagline fade-in
- Loading indicator
- Auto-transition to home after 2-3 seconds

**Layout:** Center-aligned, full-screen, portrait orientation

### 2. Home Screen (Main Dashboard)
**Purpose:** Central hub for all services  
**Content:**
- Welcome greeting with user name (if available)
- Quick access cards for main services:
  * Screen Recording
  * Audio Recording
  * Video Editing
  * Cloud Sync
  * Settings
- Recent recordings/files list
- Quick stats (storage used, files count)

**Layout:** ScrollView with glass-effect cards, bottom tab navigation

### 3. Screen Recording Screen
**Purpose:** Record device screen with audio  
**Content:**
- Recording controls (start, pause, stop)
- Resolution selector (720p, 1080p, 4K)
- Frame rate selector (24, 30, 60 FPS)
- Audio input toggle (internal/external)
- Recording timer and file size indicator
- Preview of current recording

**Layout:** Top controls, center preview, bottom action buttons

### 4. Audio Recording Screen
**Purpose:** Record audio from microphone or system  
**Content:**
- Recording controls (start, pause, stop)
- Audio input selector (microphone/system)
- Noise reduction toggle
- Normalization toggle
- Real-time audio level visualization
- Recording timer and file size
- Waveform display

**Layout:** Vertical layout with waveform visualization

### 5. Video Editing Screen
**Purpose:** Edit recorded videos  
**Content:**
- Video timeline with scrubber
- Editing tools:
  * Trim (in/out points)
  * Merge multiple videos
  * Add transitions
  * Color correction sliders
  * Speed control
- Preview window
- Export settings (quality, format)
- Progress indicator for export

**Layout:** Top preview, middle timeline, bottom tools

### 6. Cloud Sync Screen
**Purpose:** Manage cloud backup and sync  
**Content:**
- Sync status indicator
- Last sync timestamp
- Storage usage (local vs cloud)
- Backup toggle
- Encryption status
- Sync history log
- Manual sync button
- Settings for auto-sync interval

**Layout:** Status cards at top, settings below, log at bottom

### 7. Settings Screen
**Purpose:** App configuration and preferences  
**Content:**
- Theme toggle (light/dark)
- Storage location selector
- Auto-backup settings
- Notification preferences
- Recording quality defaults
- About section
- Developer contact info
- App version

**Layout:** Grouped settings with toggles and selectors

### 8. Developer Profile Screen
**Purpose:** Display developer information and contact  
**Content:**
- Developer profile image (from URL)
- Name: Eng. Sadek Elgazar
- Title: Founder & Lead Developer
- Location: Abu Dhabi, UAE
- Professional description
- Core skills list
- Social media links (clickable):
  * Twitter: https://twitter.com/knoux7
  * Facebook: https://www.facebook.com/share/1bXebP7S7D/
  * Pinterest: https://www.pinterest.com/knoux7
  * TikTok: https://www.tiktok.com/@knoux_7
  * Snapchat: https://www.snapchat.com/add/knooux7
  * WhatsApp: https://wa.me/971503281920
- Email button: contact@knoux.io
- Device info: Knoux7-Core

**Layout:** Profile header with image, info cards below, social links grid, contact buttons

## User Flows

### Recording Flow
1. User opens app → Home screen
2. Taps "Screen Recording" card
3. Selects resolution and FPS
4. Taps "Start Recording"
5. Records content
6. Taps "Stop Recording"
7. File saved to local storage
8. Notification shows save location

### Video Editing Flow
1. User opens app → Home screen
2. Taps "Video Editing" card
3. Selects video from recent list or file picker
4. Applies edits (trim, merge, effects)
5. Previews changes
6. Selects export quality
7. Taps "Export"
8. File saved and notification shown

### Cloud Sync Flow
1. User opens app → Settings
2. Enables "Auto Backup"
3. Selects sync interval
4. System automatically syncs files
5. User can view sync status anytime
6. Can manually trigger sync from Cloud Sync screen

## UI Components & Patterns

### Glass-Effect Cards
- Semi-transparent background (0.8 opacity)
- Blur effect (iOS-style glassmorphism)
- Subtle border with primary color
- Rounded corners (16px)
- Shadow for depth

### Bottom Navigation
- 5 main tabs: Home, Recording, Editing, Cloud, Settings
- Icons with labels
- Active tab highlighted in primary color
- Smooth transitions between screens

### Action Buttons
- Primary: Filled with primary color, white text
- Secondary: Outlined with primary color
- Disabled: Reduced opacity (0.5)
- Press feedback: Scale 0.97 + haptic feedback

### Input Fields
- Rounded borders (8px)
- Placeholder text in muted color
- Focus state: border color changes to primary
- Error state: border color changes to error

## Animations & Transitions

- **Screen transitions:** Fade in/out (250ms)
- **Button press:** Scale 0.97 (80ms)
- **Card appearance:** Slide up + fade (300ms)
- **Recording timer:** Smooth number updates
- **Progress bars:** Smooth fill animation (200ms)

## Responsive Design

- **Portrait orientation:** Primary layout (9:16 aspect ratio)
- **One-handed usage:** Bottom navigation within thumb reach
- **Safe area handling:** Notch/status bar consideration
- **Text scaling:** Readable at all font sizes
- **Touch targets:** Minimum 44x44pt for buttons

## Accessibility

- High contrast text (WCAG AA compliant)
- Descriptive button labels
- Icon labels for clarity
- Haptic feedback for confirmations
- Readable font sizes (minimum 14pt)

## Performance Considerations

- Lazy load screens not immediately visible
- Cache media thumbnails
- Compress large files before upload
- Optimize animations for 60 FPS
- Memory management for video processing
