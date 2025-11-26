import { motion } from 'framer-motion'
import { Gavel, FileText, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Legal() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Gavel,
      title: 'Law Database',
      description: 'Access comprehensive legal information and resources specific to your country and region.',
      comingSoon: true
    },
    {
      icon: FileText,
      title: 'Report Templates',
      description: 'Pre-filled templates to help you document incidents and file official reports.',
      comingSoon: true
    },
    {
      icon: Calendar,
      title: 'Legal Reminders',
      description: 'Get notified about important legal deadlines, court dates, and document renewals.',
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
          className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-accent/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-main" />
        </motion.button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-main mb-2">Legal & Advocacy</h1>
          <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-text-main/80">Legal resources and support tools</p>
        </div>
      </div>

      {/* Coming Soon Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-accent-light dark:bg-accent/20 border border-primary-light rounded-2xl p-8 text-center"
      >
        <Clock className="w-16 h-16 text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-heading font-bold text-text-main mb-2">Coming Soon</h2>
        <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-text-main/80 max-w-2xl mx-auto">
          We're working hard to bring you comprehensive legal resources, report templates, and legal reminders. 
          This feature will help you navigate the legal system with confidence.
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
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-3xl font-heading font-bold text-text-main mb-2">{feature.title}</h3>
              <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-text-main/80 mb-3">{feature.description}</p>
              {feature.comingSoon && (
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-body font-semibold rounded-lg">
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


