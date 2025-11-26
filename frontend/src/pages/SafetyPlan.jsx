import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Circle, MapPin, Phone, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getSafetyPlans, saveSafetyPlan } from '../services/api'

export default function SafetyPlan() {
  const { anonymousId, encryptData, decryptData } = useApp()
  const [plan, setPlan] = useState({
    planName: 'My Safety Plan',
    content: '',
    steps: [],
    emergencyContacts: [],
    safePlaces: [],
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPlan()
  }, [])

  const loadPlan = async () => {
    try {
      const response = await getSafetyPlans(anonymousId)
      if (response.success && response.plans.length > 0) {
        const loadedPlan = response.plans[0]
        setPlan({
          ...loadedPlan,
          content: decryptData(loadedPlan.content) || loadedPlan.content,
        })
      }
    } catch (error) {
      console.error('Load plan error:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const encryptedContent = encryptData(plan.content)
      await saveSafetyPlan({
        anonymousId,
        planName: plan.planName,
        content: encryptedContent,
        steps: plan.steps,
        emergencyContacts: plan.emergencyContacts,
        safePlaces: plan.safePlaces,
      })
      alert('Safety plan saved successfully!')
    } catch (error) {
      alert('Failed to save safety plan')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'steps', label: 'Steps' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'places', label: 'Safe Places' },
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-main mb-2">Your Safety Plan</h1>
        <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-text-main/80">Create a personalized plan for your safety</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 w-full max-w-full overflow-x-hidden">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-lg font-heading font-medium whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-accent text-text-main shadow-md'
                : 'bg-background text-text-main hover:bg-accent-light dark:hover:bg-accent border border-primary-light dark:border-primary/20'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <textarea
              value={plan.content}
              onChange={(e) => setPlan({ ...plan, content: e.target.value })}
              placeholder="Write your safety plan here..."
              className="w-full h-64 px-4 py-3 border-2 border-accent/20 rounded-xl bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-accent text-text-main font-heading font-semibold shadow-md hover:bg-accent-dark hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-accent flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Plan'}</span>
            </motion.button>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="space-y-4">
            {plan.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3 p-4 bg-background border border-primary-light rounded-xl"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const updated = [...plan.steps]
                    updated[index].completed = !updated[index].completed
                    setPlan({ ...plan, steps: updated })
                  }}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  ) : (
                    <Circle className="w-6 h-6 text-text-secondary dark:text-text-main/60" />
                  )}
                </motion.button>
                <div className="flex-1">
                  <h4 className="font-heading font-semibold text-text-main">{step.title}</h4>
                  {step.description && (
                    <p className="text-sm font-body text-text-secondary mt-1">{step.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
            <AddStepForm
              onAdd={(step) => setPlan({ ...plan, steps: [...plan.steps, step] })}
            />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {plan.emergencyContacts.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-background border border-primary-light rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-heading font-semibold text-text-main">{contact.name}</p>
                    <p className="text-sm font-body text-text-secondary">{contact.phone}</p>
                    {contact.relationship && (
                      <p className="text-xs font-body text-text-secondary dark:text-text-main/70">{contact.relationship}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <AddContactForm
              onAdd={(contact) =>
                setPlan({ ...plan, emergencyContacts: [...plan.emergencyContacts, contact] })
              }
            />
          </div>
        )}

        {activeTab === 'places' && (
          <div className="space-y-4">
            {plan.safePlaces.map((place, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-background border border-primary-light rounded-xl"
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-success mt-1" />
                  <div>
                    <p className="font-heading font-semibold text-text-main">{place.name}</p>
                    {place.address && (
                      <p className="text-sm font-body text-text-secondary">{place.address}</p>
                    )}
                    {place.notes && (
                      <p className="text-xs font-body text-text-secondary dark:text-text-main/70 mt-1">{place.notes}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <AddPlaceForm
              onAdd={(place) =>
                setPlan({ ...plan, safePlaces: [...plan.safePlaces, place] })
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

function AddStepForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onAdd({ title, description, completed: false })
      setTitle('')
      setDescription('')
      setShowForm(false)
    }
  }

  if (!showForm) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowForm(true)}
        className="w-full p-4 border-2 border-dashed border-accent/20 rounded-xl text-text-secondary hover:border-primary hover:text-accent dark:hover:text-accent-light transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span className="font-body">Add Step</span>
      </motion.button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-accent/20 rounded-xl space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Step title"
        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Step description (optional)"
        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
        rows={3}
      />
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-text-main font-heading font-semibold hover:bg-accent-dark transition-all duration-300"
        >
          Add
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 rounded-lg bg-background border border-accent/20 text-text-main font-body hover:bg-accent-light dark:hover:bg-accent transition-all duration-300"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  )
}

function AddContactForm({ onAdd }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && phone.trim()) {
      onAdd({ name, phone, relationship })
      setName('')
      setPhone('')
      setRelationship('')
      setShowForm(false)
    }
  }

  if (!showForm) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowForm(true)}
        className="w-full p-4 border-2 border-dashed border-accent/20 rounded-xl text-text-secondary hover:border-primary hover:text-accent dark:hover:text-accent-light transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span className="font-body">Add Contact</span>
      </motion.button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-accent/20 rounded-xl space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Contact name"
        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
        required
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone number"
        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
        required
      />
      <input
        type="text"
        value={relationship}
        onChange={(e) => setRelationship(e.target.value)}
        placeholder="Relationship (optional)"
        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
      />
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-text-main font-heading font-semibold hover:bg-accent-dark transition-all duration-300"
        >
          Add
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 rounded-lg bg-background border border-accent/20 text-text-main font-body hover:bg-accent-light dark:hover:bg-accent transition-all duration-300"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  )
}

function AddPlaceForm({ onAdd }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd({ name, address, notes })
      setName('')
      setAddress('')
      setNotes('')
      setShowForm(false)
    }
  }

  if (!showForm) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowForm(true)}
        className="w-full p-4 border-2 border-dashed border-accent/20 rounded-xl text-text-secondary hover:border-primary hover:text-accent dark:hover:text-accent-light transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span className="font-body">Add Safe Place</span>
      </motion.button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-accent/20 rounded-xl space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Place name"
        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
        required
      />
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address (optional)"
        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full px-4 py-2 border-2 border-accent/20 rounded-lg bg-background text-text-main font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
        rows={2}
      />
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-text-main font-heading font-semibold hover:bg-accent-dark transition-all duration-300"
        >
          Add
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 rounded-lg bg-background border border-accent/20 text-text-main font-body hover:bg-accent-light dark:hover:bg-accent transition-all duration-300"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  )
}

