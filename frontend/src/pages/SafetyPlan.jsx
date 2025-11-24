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
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Safety Plan</h1>
        <p className="text-gray-600 dark:text-gray-300">Create a personalized plan for your safety</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <textarea
              value={plan.content}
              onChange={(e) => setPlan({ ...plan, content: e.target.value })}
              placeholder="Write your safety plan here..."
              className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Plan'}</span>
            </button>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="space-y-4">
            {plan.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <button
                  onClick={() => {
                    const updated = [...plan.steps]
                    updated[index].completed = !updated[index].completed
                    setPlan({ ...plan, steps: updated })
                  }}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{step.title}</h4>
                  {step.description && (
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
            <AddStepForm
              onAdd={(step) => setPlan({ ...plan, steps: [...plan.steps, step] })}
            />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {plan.emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                    {contact.relationship && (
                      <p className="text-xs text-gray-500">{contact.relationship}</p>
                    )}
                  </div>
                </div>
              </div>
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
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">{place.name}</p>
                    {place.address && (
                      <p className="text-sm text-gray-600">{place.address}</p>
                    )}
                    {place.notes && (
                      <p className="text-xs text-gray-500 mt-1">{place.notes}</p>
                    )}
                  </div>
                </div>
              </div>
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
      <button
        onClick={() => setShowForm(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Step</span>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-300 rounded-lg space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Step title"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Step description (optional)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      <div className="flex space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
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
      <button
        onClick={() => setShowForm(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Contact</span>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-300 rounded-lg space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Contact name"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone number"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="text"
        value={relationship}
        onChange={(e) => setRelationship(e.target.value)}
        placeholder="Relationship (optional)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
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
      <button
        onClick={() => setShowForm(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Safe Place</span>
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-300 rounded-lg space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Place name"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address (optional)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
      />
      <div className="flex space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

