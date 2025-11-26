import { motion } from 'framer-motion'
import { Radio, Smartphone, Wifi, WifiOff, Battery, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Tech() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Radio,
      title: 'Offline Mode',
      description: 'Access essential features even without internet connection. Your data syncs automatically when you reconnect.',
      comingSoon: true
    },
    {
      icon: Smartphone,
      title: 'Wearable Integration',
      description: 'Connect your smartwatch or wearable device for hands-free SOS alerts and health monitoring.',
      comingSoon: true
    },
    {
      icon: Battery,
      title: 'Battery Saver Mode',
      description: 'Optimize app performance to extend your device battery life while maintaining essential safety features.',
      comingSoon: true
    }
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/app')}
          className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-primary/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-main dark:text-white" />
        </motion.button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-main dark:text-white mb-2">Tech Features</h1>
          <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">Advanced technology for your safety</p>
        </div>
      </div>

      {/* Coming Soon Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-light dark:bg-primary/20 border border-primary-light rounded-2xl p-8 text-center"
      >
        <Radio className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-heading font-bold text-text-main dark:text-white mb-2">Coming Soon</h2>
        <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80 max-w-2xl mx-auto">
          We're developing advanced technology features to enhance your safety and accessibility. 
          These features will work seamlessly with your existing safety tools.
        </p>
      </motion.div>

      {/* Feature Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-3xl font-heading font-bold text-text-main dark:text-white mb-2">{feature.title}</h3>
              <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80 mb-3">{feature.description}</p>
              {feature.comingSoon && (
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-body font-semibold rounded-lg">
                  Coming Soon
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


