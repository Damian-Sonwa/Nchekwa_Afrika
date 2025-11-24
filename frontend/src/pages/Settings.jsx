import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, Bell, Globe, Info, Shield, HelpCircle, LogOut, Trash2,
  Eye, EyeOff, User, Mail, Phone, MapPin, Settings as SettingsIcon,
  AlertCircle, Download, Heart, Gavel, Activity, Wifi, WifiOff,
  Smartphone, Key, ChevronDown, ChevronUp, Save, X, Plus, Edit2
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { useAuthStore } from '../store/authStore'
import { wipeAllData, getUserDetails } from '../services/api'
import { 
  getSettings, updateSettings, changePassword, updateAccountInfo,
  setPin, saveSOSConfig
} from '../services/api'
import { useNavigate } from 'react-router-dom'

/**
 * Comprehensive Settings Page
 * 
 * Includes all primary and advanced settings with collapsible sections.
 * All settings persist to MongoDB via API.
 */

export default function Settings() {
  const { anonymousId, wipeAllData: wipeLocalData } = useApp()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  
  // State management
  const [activeSection, setActiveSection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Primary Settings
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [language, setLanguage] = useState('en')
  const [decoyMode, setDecoyMode] = useState(false)
  
  // Account Information
  const [accountInfo, setAccountInfo] = useState({
    name: '',
    age: '',
    sex: '',
    maritalStatus: '',
    country: ''
  })
  const [editingAccount, setEditingAccount] = useState(false)
  
  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  
  // PIN Settings
  const [pinForm, setPinForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  })
  const [hasPin, setHasPin] = useState(false)
  const [showPinForm, setShowPinForm] = useState(false)
  
  // SOS Configuration
  const [sosConfig, setSosConfig] = useState({
    trustedContacts: [],
    alertOptions: {
      sendLocation: true,
      sendToContacts: false,
      silentMode: false
    }
  })
  const [editingContact, setEditingContact] = useState(null)
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', relationship: '' })
  
  // Advanced Settings
  const [evidenceExport, setEvidenceExport] = useState({
    defaultFormat: 'zip',
    includeMetadata: true,
    encryptOnExport: true
  })
  const [moodTracker, setMoodTracker] = useState({
    reminders: false,
    reminderTime: '20:00',
    shareWithCounselor: false
  })
  const [legalReminders, setLegalReminders] = useState({
    enabled: true,
    advanceDays: 7
  })
  const [groundingExercises, setGroundingExercises] = useState({
    favorites: [],
    defaultDuration: 5
  })
  const [offlineMode, setOfflineMode] = useState({
    enabled: false,
    syncOnReconnect: true
  })
  const [wearable, setWearable] = useState({
    enabled: false,
    deviceType: '',
    deviceId: '',
    sosTrigger: false
  })
  const [twoFactorAuth, setTwoFactorAuth] = useState({
    enabled: false,
    method: 'app'
  })

  // Load settings on mount
  useEffect(() => {
    if (anonymousId) {
      loadSettings()
      loadAccountInfo()
    }
  }, [anonymousId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await getSettings(anonymousId)
      if (response.success) {
        const settings = response.settings || {}
        
        // Primary settings
        setNotifications(settings.notifications !== false)
        setEmailNotifications(settings.emailNotifications !== false)
        setPushNotifications(settings.pushNotifications !== false)
        setLanguage(settings.language || 'en')
        
        // Advanced settings
        if (settings.sosConfig) setSosConfig(settings.sosConfig)
        if (settings.evidenceExport) setEvidenceExport(settings.evidenceExport)
        if (settings.moodTracker) setMoodTracker(settings.moodTracker)
        if (settings.legalReminders) setLegalReminders(settings.legalReminders)
        if (settings.groundingExercises) setGroundingExercises(settings.groundingExercises)
        if (settings.offlineMode) setOfflineMode(settings.offlineMode)
        if (settings.wearable) setWearable(settings.wearable)
        if (settings.twoFactorAuth) setTwoFactorAuth(settings.twoFactorAuth)
      }
    } catch (error) {
      console.error('Load settings error:', error)
      showMessage('error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const loadAccountInfo = async () => {
    try {
      const response = await getUserDetails(anonymousId)
      if (response.success && response.userDetails) {
        setAccountInfo({
          name: response.userDetails.name || '',
          age: response.userDetails.age || '',
          sex: response.userDetails.sex || '',
          maritalStatus: response.userDetails.maritalStatus || '',
          country: response.userDetails.country || ''
        })
      }
    } catch (error) {
      console.error('Load account info error:', error)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const saveSettings = async (section = null) => {
    try {
      setSaving(true)
      const settingsToSave = {
        notifications,
        emailNotifications,
        pushNotifications,
        language,
        evidenceExport,
        moodTracker,
        legalReminders,
        groundingExercises,
        offlineMode,
        wearable,
        twoFactorAuth
      }
      
      const response = await updateSettings(anonymousId, settingsToSave)
      if (response.success) {
        showMessage('success', section ? `${section} saved successfully` : 'Settings saved successfully')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      showMessage('error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters')
      return
    }

    try {
      setSaving(true)
      const response = await changePassword(anonymousId, passwordForm.currentPassword, passwordForm.newPassword)
      if (response.success) {
        showMessage('success', 'Password changed successfully')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordForm(false)
      }
    } catch (error) {
      console.error('Change password error:', error)
      showMessage('error', error.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleSetPin = async () => {
    if (pinForm.newPin !== pinForm.confirmPin) {
      showMessage('error', 'PINs do not match')
      return
    }
    
    if (pinForm.newPin.length < 4) {
      showMessage('error', 'PIN must be at least 4 digits')
      return
    }

    try {
      setSaving(true)
      const response = await setPin(anonymousId, pinForm.newPin, hasPin ? pinForm.currentPin : null)
      if (response.success) {
        showMessage('success', hasPin ? 'PIN updated successfully' : 'PIN set successfully')
        setHasPin(true)
        setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
        setShowPinForm(false)
      }
    } catch (error) {
      console.error('Set PIN error:', error)
      showMessage('error', error.response?.data?.error || 'Failed to set PIN')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAccountInfo = async () => {
    try {
      setSaving(true)
      const response = await updateAccountInfo(anonymousId, accountInfo)
      if (response.success) {
        showMessage('success', 'Account information updated successfully')
        setEditingAccount(false)
      }
    } catch (error) {
      console.error('Save account info error:', error)
      showMessage('error', 'Failed to update account information')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSOSConfig = async () => {
    try {
      setSaving(true)
      const response = await saveSOSConfig(anonymousId, sosConfig)
      if (response.success) {
        showMessage('success', 'SOS configuration saved successfully')
        await saveSettings('SOS configuration')
      }
    } catch (error) {
      console.error('Save SOS config error:', error)
      showMessage('error', 'Failed to save SOS configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      showMessage('error', 'Name and phone are required')
      return
    }
    
    setSosConfig({
      ...sosConfig,
      trustedContacts: [...sosConfig.trustedContacts, { ...newContact }]
    })
    setNewContact({ name: '', phone: '', email: '', relationship: '' })
  }

  const handleRemoveContact = (index) => {
    setSosConfig({
      ...sosConfig,
      trustedContacts: sosConfig.trustedContacts.filter((_, i) => i !== index)
    })
  }

  const handleWipeData = async () => {
    if (!confirm('Delete ALL data? This cannot be undone. All your safety plans, evidence, and chat history will be permanently deleted.')) {
      return
    }

    try {
      await wipeAllData(anonymousId)
      await wipeLocalData()
      showMessage('success', 'All data has been deleted')
      setTimeout(() => navigate('/onboarding'), 2000)
    } catch (error) {
      showMessage('error', 'Failed to delete data')
    }
  }

  const handleQuickExit = () => {
    if (confirm('Quick exit? This will close the app.')) {
      window.location.href = 'about:blank'
    }
  }

  // Collapsible Section Component
  const CollapsibleSection = ({ id, title, icon: Icon, children, defaultOpen = false }) => {
    const isOpen = activeSection === id || (defaultOpen && activeSection === null)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-4"
      >
        <button
          onClick={() => setActiveSection(isOpen ? null : id)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onToggle, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings & Preferences</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your app preferences and privacy</p>
      </div>

      {/* Message Banner */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Settings */}
      <CollapsibleSection id="account" title="Account Information" icon={User} defaultOpen>
        <div className="space-y-4">
          {!editingAccount ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{accountInfo.name || 'Not set'}</p>
                </div>
                <button
                  onClick={() => setEditingAccount(true)}
                  className="text-blue-500 hover:text-blue-600 font-medium flex items-center space-x-1"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                <p className="font-medium text-gray-900 dark:text-white">{accountInfo.age || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sex</p>
                <p className="font-medium text-gray-900 dark:text-white">{accountInfo.sex || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Marital Status</p>
                <p className="font-medium text-gray-900 dark:text-white">{accountInfo.maritalStatus || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                <p className="font-medium text-gray-900 dark:text-white">{accountInfo.country || 'Not set'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={accountInfo.name}
                  onChange={(e) => setAccountInfo({ ...accountInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                <input
                  type="number"
                  value={accountInfo.age}
                  onChange={(e) => setAccountInfo({ ...accountInfo, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sex</label>
                <select
                  value={accountInfo.sex}
                  onChange={(e) => setAccountInfo({ ...accountInfo, sex: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marital Status</label>
                <select
                  value={accountInfo.maritalStatus}
                  onChange={(e) => setAccountInfo({ ...accountInfo, maritalStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select...</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  value={accountInfo.country}
                  onChange={(e) => setAccountInfo({ ...accountInfo, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveAccountInfo}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => {
                    setEditingAccount(false)
                    loadAccountInfo()
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Security Settings */}
      <CollapsibleSection id="security" title="Security & Privacy" icon={Shield}>
        <div className="space-y-4">
          {/* Password Change */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Password</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                {showPasswordForm ? 'Cancel' : 'Change'}
              </button>
            </div>
            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 mt-3"
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showPassword ? 'Hide' : 'Show'} passwords</span>
                  </button>
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </motion.div>
            )}
          </div>

          {/* PIN Setup */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">App PIN</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {hasPin ? 'Change your app PIN' : 'Set a PIN to lock the app'}
                </p>
              </div>
              <button
                onClick={() => setShowPinForm(!showPinForm)}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                {showPinForm ? 'Cancel' : hasPin ? 'Change' : 'Set'}
              </button>
            </div>
            {showPinForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 mt-3"
              >
                {hasPin && (
                  <input
                    type="password"
                    placeholder="Current PIN"
                    value={pinForm.currentPin}
                    onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
                <input
                  type="password"
                  placeholder="New PIN (4-6 digits)"
                  value={pinForm.newPin}
                  onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value.replace(/\D/g, '') })}
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="password"
                  placeholder="Confirm new PIN"
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value.replace(/\D/g, '') })}
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSetPin}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Setting...' : hasPin ? 'Update PIN' : 'Set PIN'}
                </button>
              </motion.div>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <ToggleSwitch
            enabled={twoFactorAuth.enabled}
            onToggle={() => {
              setTwoFactorAuth({ ...twoFactorAuth, enabled: !twoFactorAuth.enabled })
              saveSettings('Two-factor authentication')
            }}
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
          />

          {/* Decoy Mode */}
          <ToggleSwitch
            enabled={decoyMode}
            onToggle={setDecoyMode}
            label="Decoy Mode"
            description="Hide the app's true purpose with a decoy screen"
          />
        </div>
      </CollapsibleSection>

      {/* Notifications */}
      <CollapsibleSection id="notifications" title="Notifications" icon={Bell}>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={notifications}
            onToggle={() => {
              setNotifications(!notifications)
              saveSettings('Notifications')
            }}
            label="Enable Notifications"
            description="Receive important updates and alerts"
          />
          <ToggleSwitch
            enabled={emailNotifications}
            onToggle={() => {
              setEmailNotifications(!emailNotifications)
              saveSettings('Email notifications')
            }}
            label="Email Notifications"
            description="Receive updates via email"
          />
          <ToggleSwitch
            enabled={pushNotifications}
            onToggle={() => {
              setPushNotifications(!pushNotifications)
              saveSettings('Push notifications')
            }}
            label="Push Notifications"
            description="Receive push notifications on your device"
          />
        </div>
      </CollapsibleSection>

      {/* SOS Configuration */}
      <CollapsibleSection id="sos" title="SOS Configuration" icon={AlertCircle}>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-3">Trusted Contacts</p>
            <div className="space-y-2 mb-3">
              {sosConfig.trustedContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone}</p>
                    {contact.relationship && (
                      <p className="text-xs text-gray-400">{contact.relationship}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveContact(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="text"
                placeholder="Contact name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
              />
              <input
                type="text"
                placeholder="Relationship (optional)"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
              />
              <button
                onClick={handleAddContact}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="font-medium text-gray-900 dark:text-white mb-3">Alert Options</p>
            <ToggleSwitch
              enabled={sosConfig.alertOptions.sendLocation}
              onToggle={() => {
                setSosConfig({
                  ...sosConfig,
                  alertOptions: { ...sosConfig.alertOptions, sendLocation: !sosConfig.alertOptions.sendLocation }
                })
                handleSaveSOSConfig()
              }}
              label="Send Location"
              description="Include your location in SOS alerts"
            />
            <ToggleSwitch
              enabled={sosConfig.alertOptions.sendToContacts}
              onToggle={() => {
                setSosConfig({
                  ...sosConfig,
                  alertOptions: { ...sosConfig.alertOptions, sendToContacts: !sosConfig.alertOptions.sendToContacts }
                })
                handleSaveSOSConfig()
              }}
              label="Notify Trusted Contacts"
              description="Send SOS alerts to your trusted contacts"
            />
            <ToggleSwitch
              enabled={sosConfig.alertOptions.silentMode}
              onToggle={() => {
                setSosConfig({
                  ...sosConfig,
                  alertOptions: { ...sosConfig.alertOptions, silentMode: !sosConfig.alertOptions.silentMode }
                })
                handleSaveSOSConfig()
              }}
              label="Silent Mode"
              description="Send SOS alerts silently (no sound)"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Evidence Export Settings */}
      <CollapsibleSection id="evidence" title="Evidence Export" icon={Download}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Export Format</label>
            <select
              value={evidenceExport.defaultFormat}
              onChange={(e) => {
                setEvidenceExport({ ...evidenceExport, defaultFormat: e.target.value })
                saveSettings('Evidence export')
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="zip">ZIP Archive</option>
              <option value="pdf">PDF Document</option>
              <option value="json">JSON File</option>
            </select>
          </div>
          <ToggleSwitch
            enabled={evidenceExport.includeMetadata}
            onToggle={() => {
              setEvidenceExport({ ...evidenceExport, includeMetadata: !evidenceExport.includeMetadata })
              saveSettings('Evidence export')
            }}
            label="Include Metadata"
            description="Include timestamps and location data in exports"
          />
          <ToggleSwitch
            enabled={evidenceExport.encryptOnExport}
            onToggle={() => {
              setEvidenceExport({ ...evidenceExport, encryptOnExport: !evidenceExport.encryptOnExport })
              saveSettings('Evidence export')
            }}
            label="Encrypt on Export"
            description="Encrypt exported files for additional security"
          />
        </div>
      </CollapsibleSection>

      {/* Mood Tracker Settings */}
      <CollapsibleSection id="mood" title="Mood Tracker" icon={Heart}>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={moodTracker.reminders}
            onToggle={() => {
              setMoodTracker({ ...moodTracker, reminders: !moodTracker.reminders })
              saveSettings('Mood tracker')
            }}
            label="Daily Reminders"
            description="Receive reminders to log your mood"
          />
          {moodTracker.reminders && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reminder Time</label>
              <input
                type="time"
                value={moodTracker.reminderTime}
                onChange={(e) => {
                  setMoodTracker({ ...moodTracker, reminderTime: e.target.value })
                  saveSettings('Mood tracker')
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
          <ToggleSwitch
            enabled={moodTracker.shareWithCounselor}
            onToggle={() => {
              setMoodTracker({ ...moodTracker, shareWithCounselor: !moodTracker.shareWithCounselor })
              saveSettings('Mood tracker')
            }}
            label="Share with Counselor"
            description="Allow your counselor to view mood history"
          />
        </div>
      </CollapsibleSection>

      {/* Legal Reminders Settings */}
      <CollapsibleSection id="legal" title="Legal Reminders" icon={Gavel}>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={legalReminders.enabled}
            onToggle={() => {
              setLegalReminders({ ...legalReminders, enabled: !legalReminders.enabled })
              saveSettings('Legal reminders')
            }}
            label="Enable Reminders"
            description="Receive reminders for important legal dates"
          />
          {legalReminders.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Advance Notice (days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={legalReminders.advanceDays}
                onChange={(e) => {
                  setLegalReminders({ ...legalReminders, advanceDays: parseInt(e.target.value) })
                  saveSettings('Legal reminders')
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Grounding Exercises Settings */}
      <CollapsibleSection id="grounding" title="Grounding Exercises" icon={Activity}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={groundingExercises.defaultDuration}
              onChange={(e) => {
                setGroundingExercises({ ...groundingExercises, defaultDuration: parseInt(e.target.value) })
                saveSettings('Grounding exercises')
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Favorite exercises: {groundingExercises.favorites.length > 0 ? groundingExercises.favorites.join(', ') : 'None selected'}
          </p>
        </div>
      </CollapsibleSection>

      {/* Offline Mode Settings */}
      <CollapsibleSection id="offline" title="Offline Mode" icon={WifiOff}>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={offlineMode.enabled}
            onToggle={() => {
              setOfflineMode({ ...offlineMode, enabled: !offlineMode.enabled })
              saveSettings('Offline mode')
            }}
            label="Enable Offline Mode"
            description="Use the app without internet connection"
          />
          <ToggleSwitch
            enabled={offlineMode.syncOnReconnect}
            onToggle={() => {
              setOfflineMode({ ...offlineMode, syncOnReconnect: !offlineMode.syncOnReconnect })
              saveSettings('Offline mode')
            }}
            label="Auto-Sync on Reconnect"
            description="Automatically sync data when connection is restored"
          />
        </div>
      </CollapsibleSection>

      {/* Wearable/IoT Integration */}
      <CollapsibleSection id="wearable" title="Wearable & IoT Integration" icon={Smartphone}>
        <div className="space-y-4">
          <ToggleSwitch
            enabled={wearable.enabled}
            onToggle={() => {
              setWearable({ ...wearable, enabled: !wearable.enabled })
              saveSettings('Wearable integration')
            }}
            label="Enable Integration"
            description="Connect wearable devices or IoT sensors"
          />
          {wearable.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Device Type</label>
                <select
                  value={wearable.deviceType}
                  onChange={(e) => {
                    setWearable({ ...wearable, deviceType: e.target.value })
                    saveSettings('Wearable integration')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select device...</option>
                  <option value="smartwatch">Smartwatch</option>
                  <option value="fitness-tracker">Fitness Tracker</option>
                  <option value="panic-button">Panic Button</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Device ID</label>
                <input
                  type="text"
                  placeholder="Enter device ID"
                  value={wearable.deviceId}
                  onChange={(e) => {
                    setWearable({ ...wearable, deviceId: e.target.value })
                    saveSettings('Wearable integration')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <ToggleSwitch
                enabled={wearable.sosTrigger}
                onToggle={() => {
                  setWearable({ ...wearable, sosTrigger: !wearable.sosTrigger })
                  saveSettings('Wearable integration')
                }}
                label="SOS Trigger"
                description="Allow device to trigger SOS alerts"
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Language & Region */}
      <CollapsibleSection id="language" title="Language & Region" icon={Globe}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value)
                saveSettings('Language')
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish (Coming soon)</option>
              <option value="fr">French (Coming soon)</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* About & Help */}
      <CollapsibleSection id="about" title="About & Help" icon={Info}>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">App Version</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">1.0.0</p>
          </div>
          <button
            onClick={() => alert('Privacy policy content...')}
            className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Shield className="w-5 h-5 inline mr-2 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-white">Privacy Policy</span>
          </button>
          <button
            onClick={() => alert('Help content...')}
            className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <HelpCircle className="w-5 h-5 inline mr-2 text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-white">Help & Support</span>
          </button>
        </div>
      </CollapsibleSection>

      {/* Account Actions */}
      <CollapsibleSection id="account-actions" title="Account Actions" icon={User} defaultOpen>
        <div className="space-y-4">
          <button
            onClick={async () => {
              if (confirm('Sign out? You will need to log in again to access your account.')) {
                const { logout } = useAuthStore.getState()
                logout() // Clear auth state
                await wipeLocalData() // Clear all app data
                navigate('/auth', { replace: true }) // Redirect to login page
              }
            }}
            className="w-full text-left px-4 py-3 bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 dark:border-primary/50 rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors flex items-center space-x-3"
          >
            <LogOut className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-primary dark:text-primary">Sign Out</p>
              <p className="text-sm text-primary/70 dark:text-primary/70">Log out and return to login page</p>
            </div>
          </button>
        </div>
      </CollapsibleSection>

      {/* Emergency Actions */}
      <CollapsibleSection id="emergency" title="Emergency Actions" icon={AlertCircle}>
        <div className="space-y-4">
          <button
            onClick={handleQuickExit}
            className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Quick Exit</p>
              <p className="text-sm text-red-500 dark:text-red-500">Close the app immediately</p>
            </div>
          </button>
          <button
            onClick={handleWipeData}
            className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center space-x-3"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Delete All Data</p>
              <p className="text-sm text-red-500 dark:text-red-500">Permanently remove all your data</p>
            </div>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}
