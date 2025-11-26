import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, BookOpen, Gavel, Shield, Heart, Flower, Hand } from 'lucide-react'

const topics = [
  {
    id: 'understanding',
    title: 'Understanding GBV',
    icon: BookOpen,
    content: `Gender-Based Violence (GBV) refers to harmful acts directed at an individual based on their gender. It includes physical, sexual, emotional, psychological, and economic abuse.

Types of GBV:
• Physical violence
• Sexual violence
• Emotional/psychological abuse
• Economic abuse
• Digital/online abuse

Remember: GBV is never your fault. You deserve support and help.`,
  },
  {
    id: 'rights',
    title: 'Your Rights',
    icon: Gavel,
    content: `You have the right to:
• Live free from violence and abuse
• Access support services
• Report abuse to authorities
• Seek medical attention
• Obtain legal protection
• Maintain your privacy and confidentiality

These rights are protected by law in most countries.`,
  },
  {
    id: 'safety',
    title: 'Safety Planning',
    icon: Shield,
    content: `A safety plan helps you prepare for dangerous situations:

1. Identify safe places you can go
2. Keep important documents and money in a safe place
3. Memorize emergency contact numbers
4. Plan escape routes from your home
5. Pack an emergency bag with essentials
6. Trust your instincts - if you feel unsafe, leave

Use the Safety Plan tool in this app to create your personalized plan.`,
  },
  {
    id: 'support',
    title: 'Getting Support',
    icon: Heart,
    content: `You don't have to face this alone. Support is available:

• Helplines: 24/7 confidential support
• Shelters: Safe temporary housing
• Counseling: Professional mental health support
• Legal aid: Help with protection orders and legal processes
• Medical care: Treatment and documentation

All services in this app are confidential and free.`,
  },
  {
    id: 'healing',
    title: 'Healing & Recovery',
    icon: Flower,
    content: `Healing is a journey, and it looks different for everyone:

• Be patient with yourself
• Seek professional counseling
• Connect with support groups
• Practice self-care
• Set boundaries
• Celebrate small victories

Recovery takes time, but it is possible. You are strong.`,
  },
  {
    id: 'helping',
    title: 'Helping Others',
    icon: Hand,
    content: `If someone you know is experiencing GBV:

• Listen without judgment
• Believe them
• Don't pressure them to leave
• Offer practical support
• Respect their decisions
• Share resources and information
• Take care of yourself too

Remember: You cannot force someone to seek help, but you can be there for them.`,
  },
]

export default function Education() {
  const [openTopic, setOpenTopic] = useState(null)

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-main mb-2">Knowledge Hub</h1>
        <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-text-main/80">Learn about your rights, safety, and available support</p>
      </div>

      {/* Intro Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-accent-light dark:bg-accent/20 border border-primary-light rounded-2xl p-6"
      >
        <div className="flex items-start space-x-4">
          <BookOpen className="w-8 h-8 text-accent flex-shrink-0" />
          <div>
            <h3 className="font-heading font-semibold text-text-main mb-2">Knowledge is Power</h3>
            <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-text-main/80">
              Understanding GBV, your rights, and available resources can help you make
              informed decisions about your safety and well-being.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Topics */}
      <div className="space-y-4">
        {topics.map((topic, index) => {
          const Icon = topic.icon
          const isOpen = openTopic === topic.id
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border rounded-2xl shadow-lg overflow-hidden"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={() => setOpenTopic(isOpen ? null : topic.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-accent rounded-lg">
                    <Icon className="w-6 h-6 text-text-main" />
                  </div>
                  <h3 className="text-3xl font-heading font-bold text-text-main">{topic.title}</h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-secondary" />
                )}
              </motion.button>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="pt-4 border-t border-primary-light dark:border-primary/20">
                    <p className="text-lg font-body text-text-secondary whitespace-pre-line leading-relaxed">
                      {topic.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

