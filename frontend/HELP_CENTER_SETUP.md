# Help Center Chat Widget - EmailJS Setup Guide

## Overview
The Help Center Chat Widget has been successfully integrated into your UMKM Inventra application. It's a floating chat widget positioned at the bottom-right corner of the screen on all pages.

---

## Installation

The EmailJS package has been added to your project dependencies. To complete the setup, you need to configure your EmailJS credentials.

---

## Step 1: Sign Up / Login to EmailJS

1. Visit [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (or log in if you already have one)
3. Verify your email address

---

## Step 2: Get Your Public Key

1. Go to your **EmailJS Dashboard**
2. Navigate to **Account** → **API Keys**
3. Copy your **Public Key** (usually starts with a unique ID)

---

## Step 3: Create an Email Service

1. In the EmailJS Dashboard, go to **Email Services**
2. Click **Add Service**
3. Choose your email provider:
   - **Gmail** (recommended for beginners)
   - **Outlook**
   - **Yahoo**
   - Or use your own SMTP server
4. Follow the setup wizard and authorize EmailJS
5. After creation, note your **Service ID**

---

## Step 4: Create an Email Template

1. In the EmailJS Dashboard, go to **Email Templates**
2. Click **Create New Template**
3. Use this template structure for incoming help messages:

### Template Content:

**Template Name:** `help_center_message` (or any name you prefer)

**Email Subject:**
```
New Help Center Message from {{user_message}}
```

**Email Body:**
```
Hello,

You have received a new message from UMKM Inventra Help Center:

From: {{from_name}}
Date/Time: {{timestamp}}

Message:
{{user_message}}

---
This is an automated message from your UMKM Inventra application.
```

4. Copy your **Template ID** after creation

---

## Step 5: Update HelpCenterWidget.jsx

Open `frontend/src/components/HelpCenterWidget.jsx` and update these lines with your actual credentials:

```javascript
// Line ~28: Initialize EmailJS with your Public Key
emailjs.init('YOUR_PUBLIC_KEY_HERE')

// Line ~70-73: Update service and template IDs
const response = await emailjs.send(
  'YOUR_SERVICE_ID_HERE',      // Replace with your Service ID
  'YOUR_TEMPLATE_ID_HERE',     // Replace with your Template ID
  templateParams
)
```

### Example (after updating):
```javascript
emailjs.init('k1a2b3c4d5e6f7g8h9i0j1k2l3')

await emailjs.send(
  'service_abc123xyz',
  'template_help_center_001',
  templateParams
)
```

---

## Step 6: Test the Widget

1. Save your changes
2. Run your development server: `npm run dev`
3. Open your app in the browser
4. Click the chat bubble button at the bottom-right
5. Send a test message
6. Check your registered email inbox for the incoming message

---

## Features Implemented

✅ **Floating Trigger Button**
- Position: Bottom-right corner (bottom: 30px; right: 30px)
- Design: Electric blue circle with smooth hover animation
- Icon: Chat bubble → X transition

✅ **Chat Panel - Home View**
- Gradient header with welcome message
- Action card to send message
- Bottom navigation tabs
- Smooth animations

✅ **Chat Panel - Message View**
- Back button to home view
- System welcome message in chat body
- Rounded text input field
- Send button (disabled until message typed)
- Message history in chat window
- Success notification after sending

✅ **EmailJS Integration**
- Automatic email forwarding to fzahabiyaa@gmail.com
- Message content, timestamp, and user info included
- Error handling with user-friendly messages
- Loading state during sending

✅ **Bilingual Support**
- Complete Indonesian (ID) and English (EN) translations
- Dynamic language switching with app language preference

✅ **Responsive Design**
- Mobile-friendly chat panel
- Works across all screen sizes
- Accessible on all routes/pages

---

## Troubleshooting

### "Failed to send message" Error

**Issue:** Messages aren't being sent
**Solutions:**
- Verify Public Key is correct in `emailjs.init()`
- Check Service ID and Template ID match your EmailJS account
- Ensure email service is properly connected in EmailJS Dashboard
- Check browser console for specific error messages

### Widget Not Appearing

**Issue:** Chat widget button doesn't show
**Solutions:**
- Verify `HelpCenterWidget` is imported in `App.jsx`
- Check that `<HelpCenterWidget lang={lang} />` is added to App render
- Ensure z-index conflicts with other elements (widget uses z-[1000])

### Emails Going to Spam

**Issue:** Messages arrive in spam folder instead of inbox
**Solutions:**
- Verify your email service is properly authenticated in EmailJS
- Add EmailJS domain to your email whitelist
- Check DKIM/SPF records if using custom SMTP

### EmailJS Package Not Found

**Issue:** Module not found error for `@emailjs/browser`
**Solutions:**
```bash
cd frontend
npm install @emailjs/browser
```

---

## Email Template Variables

The widget automatically sends these variables to your EmailJS template:

| Variable | Description | Example |
|----------|-------------|---------|
| `to_email` | Recipient email | fzahabiyaa@gmail.com |
| `from_name` | Sender identifier | Anonymous User |
| `user_message` | The actual message content | "I need help with..." |
| `timestamp` | When message was sent | 07/06/2026, 14:30:45 |
| `subject` | Email subject | New Help Center Message |

---

## Custom Styling

To customize the widget appearance, edit `HelpCenterWidget.jsx`:

- **Button color:** Change `from-blue-600 to-blue-500` in button className
- **Panel width:** Modify `w-[360px]` (currently 360px)
- **Panel height:** Modify `h-[520px]` (currently 520px)
- **Border radius:** Change `rounded-[24px]` values
- **Font styles:** Update Tailwind classes in JSX

---

## Security Notes

⚠️ **Best Practices:**
- Never commit your actual Public Key to version control
- Consider moving credentials to environment variables for production
- Use `.env` file for sensitive credentials (add to `.gitignore`)

### Using Environment Variables (Optional):
```javascript
// In HelpCenterWidget.jsx
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID

emailjs.init(publicKey)
```

Then create `.env` in frontend folder:
```
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
```

---

## Next Steps

1. ✅ Complete EmailJS setup (Steps 1-5 above)
2. ✅ Test the widget with a sample message
3. ✅ Customize styling if desired
4. ✅ Deploy to production
5. ✅ Monitor incoming messages in your email

---

## Support

For EmailJS documentation and advanced features, visit:
- [EmailJS Official Docs](https://www.emailjs.com/docs/)
- [EmailJS API Reference](https://www.emailjs.com/docs/sdk/send/)

---

**Last Updated:** June 7, 2026
**Component Version:** 1.0.0
