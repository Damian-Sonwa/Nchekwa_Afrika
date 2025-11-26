import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, File, Image, FileText, Video, Music, Lock, Download, Mail, Cloud, MessageCircle, X } from 'lucide-react'
import { cn } from '../lib/utils'
import { useApp } from '../context/AppContext'
import { getEvidence, uploadEvidence, deleteEvidence } from '../services/api'
import { exportToEmail, exportToGoogleDrive, exportToWhatsApp, downloadEncrypted } from '../utils/evidenceExport'

export default function EvidenceVault() {
  const { anonymousId, encryptData } = useApp()
  const [evidence, setEvidence] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState([])
  const [exportMethod, setExportMethod] = useState(null)
  const [exportEmail, setExportEmail] = useState('')
  const [exportPhone, setExportPhone] = useState('')

  useEffect(() => {
    console.log('EvidenceVault mounted, anonymousId:', anonymousId)
    loadEvidence()
  }, [anonymousId])

  const loadEvidence = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!anonymousId) {
        console.warn('No anonymousId available')
        setEvidence([])
        setError('No user ID available. Please complete onboarding.')
        return
      }
      console.log('Loading evidence for:', anonymousId)
      const response = await getEvidence(anonymousId)
      console.log('Evidence response:', response)
      if (response && response.success) {
        setEvidence(response.evidence || [])
      } else {
        console.warn('Failed to load evidence:', response)
        setEvidence([])
        setError(response?.error || 'Failed to load evidence')
      }
    } catch (error) {
      console.error('Load evidence error:', error)
      setEvidence([])
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('anonymousId', anonymousId)

    try {
      await uploadEvidence(formData)
      loadEvidence()
      alert('Evidence uploaded and encrypted successfully!')
    } catch (error) {
      alert('Failed to upload evidence')
    }
  }

  const handleDelete = async (evidenceId) => {
    if (!confirm('Delete this evidence? This cannot be undone.')) return

    try {
      await deleteEvidence(evidenceId)
      loadEvidence()
    } catch (error) {
      alert('Failed to delete evidence')
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return Image
    if (fileType?.includes('pdf')) return FileText
    if (fileType?.includes('video')) return Video
    if (fileType?.includes('audio')) return Music
    return File
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleExport = (items = evidence) => {
    setSelectedEvidence(items.length > 0 ? items : evidence)
    setShowExportModal(true)
  }

  const handleExportSubmit = async () => {
    try {
      const items = selectedEvidence.length > 0 ? selectedEvidence : evidence
      
      if (exportMethod === 'email') {
        if (!exportEmail) {
          alert('Please enter an email address')
          return
        }
        await exportToEmail(items, exportEmail, encryptData)
        alert('Email export initiated. Check your email client.')
      } else if (exportMethod === 'drive') {
        await exportToGoogleDrive(items, encryptData)
      } else if (exportMethod === 'whatsapp') {
        if (!exportPhone) {
          alert('Please enter a phone number')
          return
        }
        await exportToWhatsApp(items, exportPhone, encryptData)
      } else if (exportMethod === 'download') {
        await downloadEncrypted(items, encryptData)
        alert('Evidence downloaded as encrypted file')
      }
      
      setShowExportModal(false)
      setExportMethod(null)
      setExportEmail('')
      setExportPhone('')
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed: ' + error.message)
    }
  }

  const toggleEvidenceSelection = (item) => {
    setSelectedEvidence(prev => {
      const exists = prev.find(e => e._id === item._id)
      if (exists) {
        return prev.filter(e => e._id !== item._id)
      } else {
        return [...prev, item]
      }
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg font-body text-text-secondary dark:text-white/80">Loading evidence...</p>
      </div>
    )
  }

  if (!anonymousId) {
    return (
      <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 pb-20 md:pb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-main dark:text-white mb-2">Evidence Vault</h1>
          <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">Secure, encrypted storage for your evidence</p>
        </div>
        <div className="text-center py-12 bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg">
          <Lock className="w-16 h-16 text-text-secondary dark:text-white/60 mx-auto mb-4" />
          <p className="text-lg font-body text-text-secondary dark:text-white/80">Please complete onboarding first</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 max-w-full overflow-x-hidden space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-main dark:text-white mb-2">Evidence Vault</h1>
        <p className="text-lg font-body text-text-secondary leading-relaxed dark:text-white/80">Secure, encrypted storage for your important documents</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4">
          <p className="text-error text-sm font-body">{error}</p>
        </div>
      )}

      {/* Upload & Export Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full">
        <div className="bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg p-6">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary-light dark:border-primary/30 rounded-xl cursor-pointer hover:bg-background-light dark:hover:bg-primary/10 transition-all duration-300">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-text-secondary dark:text-white/60 mb-2" />
            <p className="text-sm font-body text-text-secondary dark:text-white/80 mb-1">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs font-body text-text-secondary dark:text-white/70">Files are encrypted automatically</p>
          </div>
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            />
          </label>
        </div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-primary rounded-2xl shadow-lg p-6 border border-primary-light flex flex-col items-center justify-center cursor-pointer"
          onClick={() => handleExport()}
        >
          <Download className="w-10 h-10 text-white mb-2" />
          <p className="text-white font-heading font-semibold mb-1">Export Evidence</p>
          <p className="text-xs font-body text-white/80">Securely export to email, drive, or download</p>
        </motion.div>
      </div>

      {/* Evidence List */}
      {evidence.length === 0 ? (
        <div className="text-center py-12 bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-lg">
          <Lock className="w-16 h-16 text-text-secondary dark:text-white/60 mx-auto mb-4" />
          <p className="text-lg font-body text-text-secondary dark:text-white/80">No evidence stored yet</p>
          <p className="text-sm font-body text-text-secondary dark:text-white/70 mt-2">
            Your evidence will be encrypted and stored securely
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-full">
          {evidence.map((item, index) => {
            const Icon = getFileIcon(item.fileType)
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                className={cn(
                  "bg-white/90 dark:bg-background-dark rounded-2xl shadow-lg p-4 border-2 transition-all duration-300 cursor-pointer",
                  selectedEvidence.find(e => e._id === item._id)
                    ? "border-primary bg-primary-light dark:bg-primary/20"
                    : "border-primary-light dark:border-primary/20 hover:shadow-xl hover:border-primary"
                )}
                onClick={() => toggleEvidenceSelection(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-semibold text-text-main dark:text-white truncate">
                        {item.fileName}
                      </p>
                      <p className="text-xs font-body text-text-secondary dark:text-white/80">
                        {formatFileSize(item.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedEvidence.find(e => e._id === item._id) && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item._id)
                      }}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                {item.description && (
                  <p className="text-xs font-body text-text-secondary dark:text-white/80 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="text-xs font-body text-text-secondary dark:text-white/70 mt-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 w-full max-w-full overflow-x-hidden"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/90 dark:bg-background-dark border border-primary-light rounded-2xl shadow-2xl w-full max-w-md mx-4 p-4 sm:p-6 box-border"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-text-main dark:text-white">Export Evidence</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowExportModal(false)}
                    className="p-2 hover:bg-background-light dark:hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-text-secondary dark:text-white/80" />
                  </motion.button>
                </div>

                <p className="text-sm font-body text-text-secondary dark:text-white/80 mb-4">
                  {selectedEvidence.length > 0
                    ? `Exporting ${selectedEvidence.length} selected item(s)`
                    : `Exporting all ${evidence.length} item(s)`}
                </p>

                <div className="space-y-3 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExportMethod('email')}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300",
                      exportMethod === 'email'
                        ? "border-primary bg-primary-light dark:bg-primary/20"
                        : "border-primary-light dark:border-primary/20 hover:border-primary"
                    )}
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="font-body font-medium text-text-main dark:text-white">Email</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExportMethod('drive')}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300",
                      exportMethod === 'drive'
                        ? "border-primary bg-primary-light dark:bg-primary/20"
                        : "border-primary-light dark:border-primary/20 hover:border-primary"
                    )}
                  >
                    <Cloud className="w-5 h-5 text-primary" />
                    <span className="font-body font-medium text-text-main dark:text-white">Google Drive</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExportMethod('whatsapp')}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300",
                      exportMethod === 'whatsapp'
                        ? "border-primary bg-primary-light dark:bg-primary/20"
                        : "border-primary-light dark:border-primary/20 hover:border-primary"
                    )}
                  >
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span className="font-body font-medium text-text-main dark:text-white">WhatsApp</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExportMethod('download')}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300",
                      exportMethod === 'download'
                        ? "border-primary bg-primary-light dark:bg-primary/20"
                        : "border-primary-light dark:border-primary/20 hover:border-primary"
                    )}
                  >
                    <Download className="w-5 h-5 text-primary" />
                    <span className="font-body font-medium text-text-main dark:text-white">Download Encrypted File</span>
                  </motion.button>
                </div>

                {exportMethod === 'email' && (
                  <div className="mb-4">
                    <label className="block text-sm font-body font-medium text-text-main dark:text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={exportEmail}
                      onChange={(e) => setExportEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full px-4 py-2 border-2 border-primary-light dark:border-primary/30 rounded-lg bg-white dark:bg-background-dark text-text-main dark:text-white font-body focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
                    />
                  </div>
                )}

                {exportMethod === 'whatsapp' && (
                  <div className="mb-4">
                    <label className="block text-sm font-body font-medium text-text-main dark:text-white mb-2">
                      Phone Number (with country code)
                    </label>
                    <input
                      type="tel"
                      value={exportPhone}
                      onChange={(e) => setExportPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 border-2 border-primary-light dark:border-primary/30 rounded-lg bg-white dark:bg-background-dark text-text-main dark:text-white font-body focus:ring-2 focus:ring-accent focus:border-primary transition-all duration-300"
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-primary-light dark:border-primary/30 rounded-lg font-body font-medium text-text-main dark:text-white hover:bg-background-light dark:hover:bg-primary transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExportSubmit}
                    disabled={!exportMethod || (exportMethod === 'email' && !exportEmail) || (exportMethod === 'whatsapp' && !exportPhone)}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-heading font-semibold hover:bg-primary-dark hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export
                  </motion.button>
                </div>

                <p className="text-xs font-body text-text-secondary dark:text-white/70 mt-4 text-center">
                  🔒 All exports are encrypted for your security
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

