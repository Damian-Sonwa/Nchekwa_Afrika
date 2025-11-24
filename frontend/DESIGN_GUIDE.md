# Design Guide & Implementation Notes

## 🎨 Color Palette

### Primary Colors (Discreet & Safe)
```css
/* Main Brand Colors */
--blue-500: #3b82f6
--blue-600: #2563eb
--purple-500: #a855f7
--purple-600: #9333ea

/* Backgrounds */
--slate-50: #f8fafc
--blue-50: #eff6ff
--purple-50: #faf5ff

/* Text */
--gray-900: #111827 (primary text)
--gray-600: #4b5563 (secondary text)
--gray-500: #6b7280 (tertiary text)
```

**To customize colors:** Update Tailwind config in `tailwind.config.js`

## 🖼️ Image Placeholders

### Landing Page Hero Image
**Location:** `frontend/src/pages/Landing.jsx` (line ~150)
**Replace with:** Professional illustration showing:
- Abstract shapes or soft geometric patterns
- Calm, supportive imagery (avoid triggering visuals)
- Soft color palette matching brand
- Dimensions: ~800x600px recommended

**Example sources:**
- Undraw.co (search "support", "safety")
- Freepik (abstract illustrations)
- Custom illustrations with soft, calming aesthetics

### Icons
All icons use **Lucide React** - no image files needed.
To replace icons, update the icon imports in components.

## ✨ Animation Guidelines

### Framer Motion Patterns Used

1. **Page Transitions:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

2. **Hover Effects:**
```jsx
<motion.button
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
>
```

3. **Staggered Animations:**
```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
```

**To adjust animation speed:** Modify `duration` values (0.2-0.6 recommended)

## 📝 Trauma-Informed Microcopy

### Button Text Examples
- ✅ "Get Help Now" (action-oriented, supportive)
- ✅ "You are safe here" (reassuring)
- ✅ "Take your time" (patient, non-pressuring)
- ❌ Avoid: "Hurry", "Limited time", "Act now"

### Error Messages
- ✅ "Something went wrong. Please try again when you're ready."
- ✅ "We couldn't process that. Your information is safe."
- ❌ Avoid: "Error", "Failed", harsh language

### Confirmations
- ✅ "Are you sure? You can always come back."
- ✅ "This will close the app. You're safe to leave anytime."

## 🧩 Component Structure

### Reusable Components Created
- `Button.jsx` - Animated button with variants
- `Card.jsx` - Card container with hover effects
- `Input.jsx` - Form input with icon and error states
- `Navbar.jsx` - Responsive navigation bar
- `Landing.jsx` - Public landing page
- `Auth.jsx` - Authentication page

### Where to Customize

1. **Colors:** `tailwind.config.js` → `theme.extend.colors`
2. **Typography:** `tailwind.config.js` → `theme.extend.typography`
3. **Spacing:** Update Tailwind spacing scale
4. **Animations:** Modify Framer Motion variants in components
5. **Images:** Replace placeholder divs with `<img>` tags

## 📱 Responsive Breakpoints

- Mobile: `< 768px` (default)
- Tablet: `768px - 1024px` (md:)
- Desktop: `> 1024px` (lg:)

## 🔒 Security & Privacy Notes

- All user data is anonymous
- No personal information collected
- Quick exit always accessible
- Encrypted data storage
- Auto-delete after retention period

## 🚀 Deployment Checklist

- [ ] Replace hero image placeholder
- [ ] Update color palette if needed
- [ ] Test all animations on mobile
- [ ] Verify trauma-informed microcopy
- [ ] Test quick exit functionality
- [ ] Verify responsive design on all devices
- [ ] Update privacy policy links
- [ ] Test authentication flow
- [ ] Verify all routes work correctly


