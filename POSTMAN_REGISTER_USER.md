# How to Register a New User in Postman

## 📝 Step-by-Step Instructions

### Step 1: Open Postman
- Launch Postman application
- Make sure you have the **GBV App API Collection** imported (if not, import `GBV_App_API_Collection.postman_collection.json`)

### Step 2: Set Up Environment Variable (Optional but Recommended)
1. Click the **Environments** icon (left sidebar) or the eye icon (top right)
2. Create a new environment or select existing one
3. Add variable:
   - **Variable**: `base_url`
   - **Value**: `https://nchekwa-afrika.onrender.com` (for production) or `http://localhost:3000` (for local)
4. Click **Save**
5. Select your environment from the dropdown (top right)

### Step 3: Create the Register Request

#### Option A: Use the Pre-configured Request (If Collection is Imported)
1. In the left sidebar, expand **Authentication** folder
2. Click on **Register (Email/Password)**
3. Skip to Step 4

#### Option B: Create New Request Manually
1. Click **New** → **HTTP Request**
2. Name it: "Register New User"

### Step 4: Configure the Request

#### Method & URL
- **Method**: Select **POST** from dropdown
- **URL**: Enter one of the following:
  - Production: `https://nchekwa-afrika.onrender.com/api/auth/register`
  - Local: `http://localhost:3000/api/auth/register`
  - Or use variable: `{{base_url}}/api/auth/register`

#### Headers
1. Click the **Headers** tab
2. Add header:
   - **Key**: `Content-Type`
   - **Value**: `application/json`
   - (Postman may auto-add this when you select JSON body)

#### Body
1. Click the **Body** tab
2. Select **raw** radio button
3. Select **JSON** from the dropdown (next to "raw")
4. Enter the following JSON:

```json
{
  "email": "testuser@example.com",
  "password": "SecurePassword123!"
}
```

**Important Requirements:**
- ✅ Email must be a valid email format
- ✅ Password must be at least 8 characters long
- ✅ Both fields are required

### Step 5: Send the Request
1. Click the blue **Send** button
2. Wait for the response

### Step 6: Check the Response

#### ✅ Success Response (200 OK)
You should see a response like this:

```json
{
  "success": true,
  "anonymousId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "requiresEmailConfirmation": true,
  "message": "Account created successfully. Please check your email to confirm your account.",
  "confirmationLink": "https://your-frontend-url.vercel.app/confirm-email?token=...",
  "confirmationToken": "abc123def456..."
}
```

**What to do next:**
1. **Save the `anonymousId`** - Copy it and add it to your Postman environment variables
2. **Check your email** - You should receive a confirmation email
3. **Confirm your email** - Click the link in the email or use the `confirmationToken` from the response

#### ❌ Error Responses

**400 Bad Request - Missing Fields:**
```json
{
  "error": "Email and password are required"
}
```
**Fix**: Make sure both `email` and `password` are in the request body

**400 Bad Request - Password Too Short:**
```json
{
  "error": "Password must be at least 8 characters"
}
```
**Fix**: Use a password with at least 8 characters

**400 Bad Request - Email Already Exists:**
```json
{
  "error": "An account with this email already exists. Please try logging in instead."
}
```
**Fix**: Use a different email or try logging in instead

**500 Server Error:**
```json
{
  "error": "Failed to create account"
}
```
**Fix**: Check server logs, verify database connection

## 🔄 Complete Registration Flow

### Full Workflow:
```
1. Register → Get anonymousId and confirmationToken
2. Check Email → Receive confirmation email
3. Confirm Email → Use the confirmation link or token
4. Login → Use email and password to authenticate
```

### Example: Complete Registration in Postman

#### 1. Register
```
POST {{base_url}}/api/auth/register
Body: {
  "email": "newuser@example.com",
  "password": "MySecurePass123!"
}
```

#### 2. Confirm Email (using token from response)
```
GET {{base_url}}/api/auth/confirm-email?token={{confirmationToken}}
```
OR
```
POST {{base_url}}/api/auth/confirm-email
Body: {
  "token": "your-confirmation-token-here"
}
```

#### 3. Login
```
POST {{base_url}}/api/auth/login
Body: {
  "email": "newuser@example.com",
  "password": "MySecurePass123!"
}
```

## 💡 Pro Tips

### 1. Save Variables from Response
After registration, save the `anonymousId` to your environment:
1. In the response, copy the `anonymousId` value
2. Go to **Environments** → Your environment
3. Find or create `anonymousId` variable
4. Paste the value
5. Save

### 2. Use Environment Variables
Instead of hardcoding values, use variables:
- `{{base_url}}` for the API URL
- `{{anonymousId}}` for user ID (after registration)
- `{{confirmationToken}}` for email confirmation

### 3. Test Different Scenarios
- ✅ Valid email and password
- ❌ Missing email
- ❌ Missing password
- ❌ Password too short (< 8 characters)
- ❌ Invalid email format
- ❌ Duplicate email

### 4. Check Response Status
- **200** = Success
- **400** = Bad Request (validation error)
- **500** = Server Error

## 📸 Visual Guide

### Request Configuration:
```
Method: POST
URL: {{base_url}}/api/auth/register
Headers:
  Content-Type: application/json
Body (raw JSON):
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
```

### Expected Response:
```json
{
  "success": true,
  "anonymousId": "...",
  "token": "...",
  "requiresEmailConfirmation": true,
  "message": "Account created successfully...",
  "confirmationLink": "...",
  "confirmationToken": "..."
}
```

## 🐛 Troubleshooting

### "Cannot POST" Error
- ✅ Check the URL is correct: `/api/auth/register`
- ✅ Verify method is **POST** not GET
- ✅ Ensure `base_url` variable is set correctly

### "Network Error" or "Connection Refused"
- ✅ Check if the server is running
- ✅ Verify the `base_url` is correct
- ✅ Test with: `GET {{base_url}}/health`

### Email Not Received
- ✅ Check spam folder
- ✅ Verify email service is configured on server
- ✅ Use the `confirmationLink` or `confirmationToken` from the response
- ✅ Test email config: `GET {{base_url}}/api/auth/test-email?testEmail=your@email.com`

## ✅ Quick Checklist

Before sending the request:
- [ ] Method is **POST**
- [ ] URL includes `/api/auth/register`
- [ ] Headers include `Content-Type: application/json`
- [ ] Body is **raw JSON** format
- [ ] Email is valid format
- [ ] Password is at least 8 characters
- [ ] Environment variable `base_url` is set (if using variables)

---

**Need Help?** Check the main `POSTMAN_SETUP.md` guide for more details!

