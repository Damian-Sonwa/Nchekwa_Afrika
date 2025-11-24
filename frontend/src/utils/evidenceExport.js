// Note: This utility doesn't use hooks directly
// Import useApp in components that use these functions

/**
 * Evidence Export Utility
 * 
 * Exports evidence securely to various platforms:
 * - Email
 * - Google Drive
 * - WhatsApp
 * - Other storage platforms
 * 
 * All exports are encrypted for security.
 */

/**
 * Export evidence to email
 * @param {Array} evidenceItems - Array of evidence items to export
 * @param {string} email - Recipient email address
 * @param {Function} encryptData - Encryption function from useApp hook
 */
export async function exportToEmail(evidenceItems, email, encryptData) {
  
  try {
    // Create encrypted package
    const exportData = {
      items: evidenceItems,
      timestamp: new Date().toISOString(),
      encrypted: true,
    }

    const encrypted = encryptData(exportData)
    
    // Create mailto link with encrypted data
    const subject = encodeURIComponent('GBV Evidence Export - Encrypted')
    const body = encodeURIComponent(
      `This is an encrypted evidence export from Nchekwa_Afrika App.\n\n` +
      `Encrypted Data:\n${encrypted}\n\n` +
      `Please use the app to decrypt this data.`
    )
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  } catch (error) {
    console.error('Email export error:', error)
    throw new Error('Failed to export to email')
  }
}

/**
 * Export evidence to Google Drive
 * @param {Array} evidenceItems - Array of evidence items to export
 * @param {Function} encryptData - Encryption function from useApp hook
 */
export async function exportToGoogleDrive(evidenceItems, encryptData) {
  
  try {
    // Create encrypted package
    const exportData = {
      items: evidenceItems,
      timestamp: new Date().toISOString(),
      encrypted: true,
    }

    const encrypted = encryptData(exportData)
    const blob = new Blob([encrypted], { type: 'text/plain' })
    const file = new File([blob], `gbv-evidence-${Date.now()}.encrypted.txt`, {
      type: 'text/plain',
    })

    // Note: This requires Google Drive API integration
    // For now, download the file and user can upload manually
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Open Google Drive upload page
    window.open('https://drive.google.com/drive/u/0/my-drive', '_blank')
    
    alert('File downloaded. Please upload it to Google Drive manually.')
  } catch (error) {
    console.error('Google Drive export error:', error)
    throw new Error('Failed to export to Google Drive')
  }
}

/**
 * Export evidence to WhatsApp
 * @param {Array} evidenceItems - Array of evidence items to export
 * @param {string} phoneNumber - Recipient phone number (with country code)
 * @param {Function} encryptData - Encryption function from useApp hook
 */
export async function exportToWhatsApp(evidenceItems, phoneNumber, encryptData) {
  
  try {
    // Create encrypted package
    const exportData = {
      items: evidenceItems,
      timestamp: new Date().toISOString(),
      encrypted: true,
    }

    const encrypted = encryptData(exportData)
    
    // Create WhatsApp message
    const message = encodeURIComponent(
      `GBV Evidence Export (Encrypted)\n\n` +
      `This is an encrypted evidence export.\n` +
      `Encrypted Data:\n${encrypted.substring(0, 1000)}...\n\n` +
      `Please use the app to decrypt this data.`
    )
    
    // Open WhatsApp with message
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  } catch (error) {
    console.error('WhatsApp export error:', error)
    throw new Error('Failed to export to WhatsApp')
  }
}

/**
 * Download evidence as encrypted file
 * @param {Array} evidenceItems - Array of evidence items to export
 * @param {Function} encryptData - Encryption function from useApp hook
 * @param {string} filename - Optional filename
 */
export async function downloadEncrypted(evidenceItems, encryptData, filename = null) {
  
  try {
    // Create encrypted package
    const exportData = {
      items: evidenceItems,
      timestamp: new Date().toISOString(),
      encrypted: true,
      version: '1.0',
    }

    const encrypted = encryptData(exportData)
    const blob = new Blob([encrypted], { type: 'text/plain' })
    const file = new File(
      [blob],
      filename || `gbv-evidence-${Date.now()}.encrypted.txt`,
      { type: 'text/plain' }
    )

    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download error:', error)
    throw new Error('Failed to download evidence')
  }
}

/**
 * Export to multiple platforms at once
 * @param {Array} evidenceItems - Array of evidence items
 * @param {Object} options - Export options
 */
export async function exportToMultiple(evidenceItems, options = {}) {
  const exports = []
  
  if (options.email) {
    exports.push(exportToEmail(evidenceItems, options.email))
  }
  
  if (options.whatsapp) {
    exports.push(exportToWhatsApp(evidenceItems, options.whatsapp))
  }
  
  if (options.download) {
    exports.push(downloadEncrypted(evidenceItems, options.filename))
  }
  
  await Promise.all(exports)
}

