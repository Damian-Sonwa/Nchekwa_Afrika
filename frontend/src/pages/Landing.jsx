import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, Heart, Lock, MessageSquare, BookOpen, 
  CheckCircle, ArrowRight, Users, Star, Moon, Sun, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * Modern Landing Page for GBV Survivor Support App
 * 
 * DESIGN NOTES:
 * - Replace placeholder image with calm, professional illustration
 *   Suggested: Abstract shapes, soft colors, supportive imagery
 * - Color palette: Soft blues, purples, and warm neutrals
 * - All animations use Framer Motion for smooth transitions
 * - Trauma-informed microcopy throughout
 */

const features = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your privacy is our priority. All data is encrypted and you can delete everything at any time.',
    color: 'bg-primary',
  },
  {
    icon: MessageSquare,
    title: '24/7 Support',
    description: 'Connect with trained counselors anonymously. Help is available whenever you need it.',
    color: 'bg-primaryLight',
  },
  {
    icon: BookOpen,
    title: 'Resources',
    description: 'Find helplines, shelters, legal aid, and medical support in your area.',
    color: 'bg-accent',
  },
  {
    icon: Lock,
    title: 'Evidence Vault',
    description: 'Securely store important documents and photos with end-to-end encryption.',
    color: 'bg-primary',
  },
]

const testimonials = [
  {
    name: 'Anonymous',
    text: 'This app gave me the courage to seek help. Knowing I could exit quickly made me feel safe.',
    rating: 5,
  },
  {
    name: 'Anonymous',
    text: 'The resources directory helped me find a shelter when I needed it most. Thank you.',
    rating: 5,
  },
  {
    name: 'Anonymous',
    text: 'The anonymous chat feature was a lifeline. I felt heard and supported.',
    rating: 5,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

// Image carousel component
const ImageCarousel = () => {
  const images = [
    '/landing-hero.png',
    '/StockCake-African_women_in_circle_Images_and_Photos_1763940249.jpg',
    '/StockCake-gender_based_violence_Images_and_Photos_1763932913.jpg',
    '/StockCake-men_facing_violence_Images_and_Photos_1763940616.jpg',
    '/StockCake-someone_pressing_an_emergency_button_Images_and_Photos_1763940162.jpg',
    '/StockCake-someone_pressing_an_emergency_button_Images_and_Photos_1763940370.jpg',
    '/StockCake-someone_pressing_an_emergency_button_Images_and_Photos_1763940516.jpg',
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [images.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="relative w-full h-[500px] bg-background rounded-3xl shadow-2xl overflow-hidden">
      {/* Floating background elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl z-0"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-10 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl z-0"
      />
      
      {/* Image Carousel */}
      <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            src={images[currentIndex]}
            alt="Nchekwa_Afrika - Protection and support"
            className="w-full h-full max-w-lg object-cover rounded-2xl shadow-xl"
            style={{ transformStyle: 'preserve-3d' }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 dark:bg-dark/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-dark transition-all hover:scale-110"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 text-primary" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 dark:bg-dark/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-dark transition-all hover:scale-110"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 text-primary" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Fallback gradient if images don't load */}
      <div className="hidden absolute inset-0 items-center justify-center bg-primary rounded-2xl">
        <Shield className="w-32 h-32 text-white opacity-50" />
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  return (
    <div className="min-h-screen bg-background dark:bg-dark">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark/80 backdrop-blur-md border-b border-light/50 dark:border-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-poppins font-semibold text-primary">
                  Nchekwa_Afrika
                </h1>
                <p className="text-xs font-inter text-light dark:text-light">You are safe here</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              {/* Dark Mode Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-dark dark:text-light hover:bg-background dark:hover:bg-dark/50 transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.button>
              
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 font-inter text-dark dark:text-light hover:text-dark dark:hover:text-white font-medium transition-colors"
              >
                Sign In
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth?mode=register')}
                className="px-6 py-2 bg-primary hover:bg-primaryLight text-white rounded-xl font-inter font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Get Help
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full"
                >
                  <Heart className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Safe • Anonymous • Confidential
                  </span>
                </motion.div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-poppins font-semibold text-dark dark:text-white leading-tight">
                  Your journey to{' '}
                  <span className="text-primary">
                    safety begins here
                  </span>
                </h1>

                <p className="text-xl md:text-2xl font-inter text-light dark:text-light leading-relaxed">
                  A sanctuary of support, resources, and hope—designed with your wellbeing in mind
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth?mode=register')}
                  className="group px-8 py-4 bg-primary hover:bg-primaryLight text-white rounded-xl font-inter font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Begin Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-dark dark:text-light rounded-xl font-inter font-semibold text-lg border-2 border-slate-300 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:border-primary-light dark:hover:text-primary-light shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Explore Resources
                </motion.button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-inter text-light dark:text-light">Completely Anonymous</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success dark:text-success" />
                  <span className="text-sm font-inter text-light dark:text-light">End-to-End Encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success dark:text-success" />
                  <span className="text-sm font-inter text-light dark:text-light">Available 24/7</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Hero Image Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <ImageCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background dark:bg-dark/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-poppins font-semibold text-dark dark:text-white mb-4">
              How We Help
            </h2>
            <p className="text-xl font-inter text-light dark:text-light max-w-2xl mx-auto">
              Comprehensive support designed with your safety and privacy in mind
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-dark rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-light dark:border-light/30"
                >
                  <div className={`inline-flex p-4 rounded-xl ${feature.color} mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-poppins font-semibold text-dark dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="font-inter text-light dark:text-light leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-poppins font-semibold text-dark dark:text-white mb-4">
                Stories of Strength
              </h2>
              <p className="text-xl font-inter text-light dark:text-light">
                Real experiences from our community
              </p>
            </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-dark rounded-2xl p-8 shadow-md border border-light dark:border-light/30"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="font-inter text-dark dark:text-light mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-light dark:text-light" />
                  <span className="text-sm font-inter font-medium text-light dark:text-light">
                    {testimonial.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-poppins font-semibold text-white mb-4">
              Ready to Take the First Step?
            </h2>
            <p className="text-xl font-inter text-white/90 max-w-2xl mx-auto">
              Join thousands who have found support, resources, and hope. Your path to safety starts with a single click.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth?mode=register')}
              className="px-10 py-4 bg-white text-primary rounded-xl font-inter font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark dark:bg-black text-light dark:text-light py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-xl font-poppins font-semibold text-white">Nchekwa_Afrika</span>
              </div>
              <p className="text-sm font-inter text-light dark:text-light">
                A safe space for survivors. Your privacy and safety matter.
              </p>
            </div>
            <div>
              <h4 className="font-poppins font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm font-inter">
                <li><a href="#" className="hover:text-primary transition-colors">Helplines</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Shelters</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Legal Aid</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-poppins font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm font-inter">
                <li><a href="#" className="hover:text-primary transition-colors">Chat</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Safety Plan</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Education</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-poppins font-semibold text-white mb-4">Privacy</h4>
              <ul className="space-y-2 text-sm font-inter">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Quick Exit</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-light/30 dark:border-light/30 text-center text-sm font-inter">
            <p>&copy; 2024 Nchekwa_Afrika. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

