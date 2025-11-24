/**
 * Trauma-Informed Microcopy Library
 * 
 * Unique, empowering, and engaging texts for the Nchekwa_Afrika app.
 * All microcopy is trauma-informed, avoiding triggering language.
 * 
 * Usage:
 * import { microcopy } from '../utils/microcopy'
 * <h1>{microcopy.landing.hero.title}</h1>
 */

export const microcopy = {
  landing: {
    hero: {
      title: "Your journey to safety begins here",
      subtitle: "A sanctuary of support, resources, and hope—designed with your wellbeing in mind",
      cta: {
        primary: "Begin Your Journey",
        secondary: "Explore Resources",
      },
      trust: {
        anonymous: "Completely Anonymous",
        encrypted: "End-to-End Encrypted",
        available: "Available 24/7",
      },
    },
    features: {
      title: "How We Support You",
      subtitle: "Comprehensive tools designed for your safety and empowerment",
      items: {
        safety: {
          title: "Your Safety, Our Priority",
          description: "Every feature is built with your security in mind. Your privacy isn't just protected—it's sacred.",
        },
        support: {
          title: "Always Here for You",
          description: "Connect with compassionate counselors whenever you need. Support that understands, listens, and empowers.",
        },
        resources: {
          title: "Resources at Your Fingertips",
          description: "Find shelters, legal aid, medical support, and helplines in your area. All verified, all confidential.",
        },
        evidence: {
          title: "Your Secure Vault",
          description: "Store important documents and photos with military-grade encryption. Your evidence, your control.",
        },
      },
    },
    testimonials: {
      title: "Stories of Strength",
      subtitle: "Real experiences from our community",
      items: [
        {
          text: "This space gave me the courage I didn't know I had. The quick exit feature made me feel truly safe.",
          author: "Anonymous",
        },
        {
          text: "Finding a shelter through the resources directory changed everything. I felt supported every step of the way.",
          author: "Anonymous",
        },
        {
          text: "The anonymous chat was my lifeline. For the first time, I felt truly heard without judgment.",
          author: "Anonymous",
        },
      ],
    },
    cta: {
      title: "Ready to Take the First Step?",
      subtitle: "Join thousands who have found support, resources, and hope. Your path to safety starts with a single click.",
      button: "Start Your Journey",
    },
  },
  auth: {
    welcome: {
      login: "Welcome back, you're safe here",
      register: "Your journey to safety starts now",
    },
    description: {
      login: "Sign in to access your secure space",
      register: "Create your account and begin accessing support, resources, and tools",
    },
    form: {
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Need help accessing your account?",
      magicLink: "Send Secure Link",
      social: "Or continue with",
    },
    actions: {
      login: "Sign In",
      register: "Create Account",
      toggle: {
        login: "Already have an account?",
        register: "New to this space?",
      },
    },
    safety: "Your information is encrypted and secure. You can delete your account at any time.",
  },
  home: {
    greeting: "Welcome back, you're safe here",
    subtitle: "How can we support you today?",
    sos: {
      label: "Emergency Assistance",
      description: "Press if you need immediate help",
    },
    quickActions: {
      title: "Quick Access",
    },
    safetyTip: {
      title: "Remember",
      message: "You can exit quickly using the quick exit button. Your privacy and safety are our top priorities.",
    },
  },
  chat: {
    title: "Support Chat",
    subtitle: "Connect with trained counselors anonymously",
    placeholder: "Type your message...",
    sending: "Sending...",
    empty: "Start a conversation. We're here to listen.",
  },
  resources: {
    title: "Resource Directory",
    subtitle: "Find support services in your area",
    search: "Search resources...",
    filter: "Filter by type",
    empty: "No resources found. Try adjusting your filters.",
  },
  safetyPlan: {
    title: "Your Safety Plan",
    subtitle: "Create a personalized plan for your safety",
    empty: "Start building your safety plan",
    save: "Save Plan",
    saved: "Plan saved successfully",
  },
  evidence: {
    title: "Evidence Vault",
    subtitle: "Secure, encrypted storage for your important documents",
    upload: "Upload Evidence",
    empty: "No evidence stored yet",
    export: "Export Evidence",
    encrypted: "All files are encrypted automatically",
  },
  education: {
    title: "Knowledge Hub",
    subtitle: "Learn about your rights, safety, and available support",
  },
  wellness: {
    title: "Wellness & Self-Care",
    subtitle: "Take care of yourself, one moment at a time",
    mood: {
      title: "How are you feeling right now?",
      log: "Log Your Mood",
    },
    exercises: {
      title: "Grounding Exercises",
      subtitle: "Take a moment to center yourself",
    },
    checkin: {
      title: "Emotional Check-in",
      subtitle: "Reflect on how you're feeling and what you need",
    },
  },
  advancedSafety: {
    title: "Advanced Safety Features",
    subtitle: "Enhanced protection and emergency tools",
  },
  settings: {
    title: "Settings & Preferences",
    subtitle: "Manage your app preferences and privacy",
  },
  errors: {
    generic: "Something didn't work as expected. Please try again when you're ready.",
    network: "Connection issue. Please check your internet and try again.",
    validation: "Please check the information you entered.",
    notFound: "We couldn't find what you're looking for.",
    unauthorized: "Your session may have expired. Please sign in again.",
  },
  success: {
    saved: "Your information has been saved securely",
    deleted: "Item removed successfully",
    exported: "Export completed successfully",
    sent: "Message sent. We'll respond as soon as possible.",
  },
  buttons: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    continue: "Continue",
    back: "Go Back",
    next: "Next",
    skip: "Skip",
    submit: "Submit",
    loading: "Please wait...",
  },
  placeholders: {
    search: "Search...",
    email: "your.email@example.com",
    message: "Type your message...",
    notes: "Add your thoughts...",
  },
}


