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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-500">Loading evidence...</p>
      </div>
    )
  }

  if (!anonymousId) {
    return (
      <div className="space-y-6 pb-20 md:pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evidence Vault</h1>
          <p className="text-gray-600">Secure, encrypted storage for your evidence</p>
        </div>
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please complete onboarding first</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Evidence Vault</h1>
        <p className="text-gray-600 dark:text-gray-300">Secure, encrypted storage for your important documents</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Upload & Export Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Files are encrypted automatically</p>
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md p-6 border border-gray-200 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => handleExport()}
        >
          <Download className="w-10 h-10 text-white mb-2" />
          <p className="text-white font-semibold mb-1">Export Evidence</p>
          <p className="text-xs text-blue-100">Securely export to email, drive, or download</p>
        </motion.div>
      </div>

      {/* Evidence List */}
      {evidence.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Lock className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No evidence stored yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Your evidence will be encrypted and stored securely
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidence.map((item, index) => {
            const Icon = getFileIcon(item.fileType)
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-2 transition-all cursor-pointer",
                  selectedEvidence.find(e => e._id === item._id)
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() => toggleEvidenceSelection(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.fileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedEvidence.find(e => e._id === item._id) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item._id)
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export Evidence</h2>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {selectedEvidence.length > 0
                    ? `Exporting ${selectedEvidence.length} selected item(s)`
                    : `Exporting all ${evidence.length} item(s)`}
                </p>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setExportMethod('email')}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                      exportMethod === 'email'
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Email</span>
                  </button>

                  <button
                    onClick={() => setExportMethod('drive')}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                      exportMethod === 'drive'
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Cloud className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Google Drive</span>
                  </button>

                  <button
                    onClick={() => setExportMethod('whatsapp')}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                      exportMethod === 'whatsapp'
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setExportMethod('download')}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                      exportMethod === 'download'
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Download className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Download Encrypted File</span>
                  </button>
                </div>

                {exportMethod === 'email' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={exportEmail}
                      onChange={(e) => setExportEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {exportMethod === 'whatsapp' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number (with country code)
                    </label>
                    <input
                      type="tel"
                      value={exportPhone}
                      onChange={(e) => setExportPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportSubmit}
                    disabled={!exportMethod || (exportMethod === 'email' && !exportEmail) || (exportMethod === 'whatsapp' && !exportPhone)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
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

