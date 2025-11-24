/**
 * Steganography Utility
 * 
 * Hide sensitive data inside images for extra security.
 * Uses LSB (Least Significant Bit) steganography.
 * 
 * Note: This is a simplified implementation. For production,
 * use a more robust steganography library.
 */

/**
 * Hide text data in an image
 * @param {File} imageFile - The image file to hide data in
 * @param {string} secretData - The data to hide (encrypted)
 * @returns {Promise<Blob>} - Image blob with hidden data
 */
export async function hideDataInImage(imageFile, secretData) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Convert secret data to binary
      const binaryData = stringToBinary(secretData)
      const dataLength = binaryData.length

      // Check if image is large enough
      if (dataLength > data.length * 4) {
        reject(new Error('Image too small to hide data'))
        return
      }

      // Hide data in LSB of RGB channels
      let dataIndex = 0
      for (let i = 0; i < data.length && dataIndex < dataLength; i += 4) {
        // Skip alpha channel
        for (let j = 0; j < 3 && dataIndex < dataLength; j++) {
          const bit = binaryData[dataIndex]
          // Set LSB
          data[i + j] = (data[i + j] & 0xFE) | bit
          dataIndex++
        }
      }

      // Store length in first few pixels
      const lengthBinary = stringToBinary(dataLength.toString())
      for (let i = 0; i < lengthBinary.length && i < 32; i++) {
        data[i] = (data[i] & 0xFE) | parseInt(lengthBinary[i])
      }

      ctx.putImageData(imageData, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      }, imageFile.type)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(imageFile)
  })
}

/**
 * Extract hidden data from an image
 * @param {File} imageFile - The image file with hidden data
 * @returns {Promise<string>} - The extracted data
 */
export async function extractDataFromImage(imageFile) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Read length from first few pixels
      let lengthBinary = ''
      for (let i = 0; i < 32; i++) {
        lengthBinary += (data[i] & 0x01).toString()
      }
      const dataLength = parseInt(binaryToString(lengthBinary), 10)

      // Extract data from LSB
      let binaryData = ''
      let dataIndex = 0
      for (let i = 0; i < data.length && dataIndex < dataLength; i += 4) {
        for (let j = 0; j < 3 && dataIndex < dataLength; j++) {
          binaryData += (data[i + j] & 0x01).toString()
          dataIndex++
        }
      }

      const extractedData = binaryToString(binaryData)
      resolve(extractedData)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(imageFile)
  })
}

function stringToBinary(str) {
  return str.split('').map(char => {
    const binary = char.charCodeAt(0).toString(2)
    return '0'.repeat(8 - binary.length) + binary
  }).join('')
}

function binaryToString(binary) {
  const bytes = []
  for (let i = 0; i < binary.length; i += 8) {
    bytes.push(String.fromCharCode(parseInt(binary.substr(i, 8), 2)))
  }
  return bytes.join('')
}


