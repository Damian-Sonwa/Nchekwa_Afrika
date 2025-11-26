# Postman API Collection Setup Guide

This guide will help you import and use the Postman collection for testing all GBV App RESTful APIs.

## 📥 Importing the Collection

### Method 1: Import from File
1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `GBV_App_API_Collection.postman_collection.json`
5. Click **Import**

### Method 2: Import from URL
1. Open Postman
2. Click **Import** button
3. Select **Link** tab
4. Paste the collection file URL (if hosted)
5. Click **Import**

## 🔧 Setting Up Environment Variables

After importing, you need to set up environment variables:

### Create a New Environment
1. Click the **Environments** icon (left sidebar)
2. Click **+** to create a new environment
3. Name it: `GBV App - Production` or `GBV App - Local`

### Add Variables

| Variable | Production Value | Local Value | Description |
|----------|-----------------|-------------|-------------|
| `base_url` | `https://nchekwa-afrika.onrender.com` | `http://localhost:3000` | API base URL |
| `anonymousId` | (leave empty) | (leave empty) | Will be set after creating anonymous session |
| `sessionId` | (leave empty) | (leave empty) | Will be set after starting chat session |
| `alertId` | (leave empty) | (leave empty) | Will be set after creating SOS alert |
| `resetToken` | (leave empty) | (leave empty) | Will be set from reset password email |
| `confirmationToken` | (leave empty) | (leave empty) | Will be set from confirmation email |
| `resourceId` | (leave empty) | (leave empty) | Will be set after creating resource |
| `shelterId` | (leave empty) | (leave empty) | Will be set after creating shelter |
| `planId` | (leave empty) | (leave empty) | Will be set after creating safety plan |
| `evidenceId` | (leave empty) | (leave empty) | Will be set after uploading evidence |
| `postId` | (leave empty) | (leave empty) | Will be set after creating community post |
| `reminderId` | (leave empty) | (leave empty) | Will be set after creating legal reminder |

### Select Environment
1. Click the environment dropdown (top right)
2. Select your created environment

## 🚀 Quick Start Testing

### 1. Test API Connection
- Run **Health Check** request
- Run **API Info** request
- Both should return successful responses

### 2. Create Anonymous Session
1. Run **Create Anonymous Session** request
2. Copy the `anonymousId` from the response
3. Update the `anonymousId` variable in your environment:
   - Click **Environments** → Your environment
   - Find `anonymousId` variable
   - Paste the value
   - Click **Save**

### 3. Test Authentication Flow
1. **Register**: Use **Register (Email/Password)** with a test email
2. **Login**: Use **Login (Email/Password)** with the same credentials
3. **Forgot Password**: Use **Forgot Password** to test email reset
4. **Confirm Email**: Check your email for confirmation link and use **Confirm Email (GET)**

## 📋 Testing Workflows

### Authentication Workflow
```
1. Create Anonymous Session → Get anonymousId
2. Register (Email/Password) → Get confirmation email
3. Confirm Email → Email confirmed
4. Login (Email/Password) → Get token/anonymousId
```

### SOS Workflow
```
1. Create SOS Alert → Get alertId
2. Get SOS Alert Status → Check alert status
3. Update SOS Alert Status → Mark as resolved
```

### Chat Workflow
```
1. Start Chat Session → Get sessionId
2. Send Message → Send messages
3. Get Messages → Retrieve chat history
4. End Chat Session → Close session
```

### Safety Plan Workflow
```
1. Get User Safety Plans → View existing plans
2. Create/Update Safety Plan → Save new plan
3. Delete Safety Plan → Remove plan
```

## 🔍 Tips for Testing

### 1. Use Variables
- Always use `{{variableName}}` syntax in requests
- Update variables after getting IDs from responses
- This makes testing easier and more realistic

### 2. Test Error Cases
- Try invalid credentials
- Test with missing required fields
- Test with expired tokens
- Test with invalid IDs

### 3. Test File Uploads
- For **Upload Evidence** and **Upload Profile Picture**:
  - Use the **Body** tab
  - Select **form-data**
  - Choose a file from your computer
  - Ensure `anonymousId` is set

### 4. Test Query Parameters
- Many GET requests support query parameters
- Try different combinations:
  - Filters (country, city, category)
  - Search terms
  - Sorting options
  - Pagination (limit, offset)

### 5. Check Response Status Codes
- `200` = Success
- `201` = Created
- `400` = Bad Request (validation error)
- `401` = Unauthorized (authentication required)
- `404` = Not Found
- `500` = Server Error

## 📝 Example Test Scenarios

### Scenario 1: New User Registration
```
1. Create Anonymous Session
2. Set PIN
3. Register with Email/Password
4. Check email for confirmation link
5. Confirm Email
6. Login
7. Save User Details
8. Upload Profile Picture
```

### Scenario 2: Emergency SOS
```
1. Login (or use existing anonymousId)
2. Create SOS Alert
3. Get SOS Alert Status
4. Update SOS Alert Status to "resolved"
```

### Scenario 3: Community Support
```
1. Login
2. Get Community Posts
3. Create Post
4. Like Post (use postId from response)
5. Add Comment
6. Report Post (if needed)
```

## 🐛 Troubleshooting

### "Cannot GET" Errors
- Check that you're using the correct HTTP method (GET vs POST)
- Verify the endpoint path is correct
- Ensure `base_url` variable is set correctly

### Authentication Errors
- Make sure you've created an anonymous session first
- Verify `anonymousId` is set in environment variables
- Check that email is confirmed before login

### File Upload Errors
- Ensure you're using `form-data` not `raw` JSON
- Check file size limits
- Verify `anonymousId` is included in form data

### CORS Errors
- This is normal when testing from Postman
- CORS is configured for the frontend domain
- Postman should work regardless

## 📚 API Documentation

For detailed API documentation:
- Visit: `GET {{base_url}}/api` - Lists all endpoints
- Visit: `GET {{base_url}}/api/auth` - Lists all auth endpoints

## 🔐 Security Notes

- Never commit your Postman collection with real credentials
- Use test accounts for development
- Tokens and IDs in variables are stored locally only
- Clear sensitive data after testing

## 📞 Support

If you encounter issues:
1. Check the API health: `GET {{base_url}}/health`
2. Verify environment variables are set
3. Check request/response in Postman Console
4. Review server logs on Render dashboard

---

**Happy Testing! 🚀**

