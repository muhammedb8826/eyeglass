# Nodemailer Contact Form Setup

This document explains how to set up and use the nodemailer contact form functionality for the IAN PRINT website.

## Prerequisites

1. **Gmail Account**: You need a Gmail account to send emails
2. **App Password**: You need to generate an app password for your Gmail account (2FA must be enabled)

## Setup Instructions

### 1. Enable 2-Factor Authentication on Gmail
- Go to your Google Account settings
- Enable 2-Step Verification if not already enabled

### 2. Generate App Password
- Go to Google Account → Security → 2-Step Verification
- Scroll down to "App passwords"
- Generate a new app password for "Mail"
- Copy the 16-character password

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following content:

```env
# Email Configuration for Nodemailer
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password

# Server Configuration
PORT=5000
```

**Important**: Replace `your-gmail-address@gmail.com` with your actual Gmail address and `your-16-character-app-password` with the app password you generated.

### 4. Install Dependencies
The required packages are already installed:
- `nodemailer` - For sending emails
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 5. Start the Backend Server
Run the following command to start the backend server:

```bash
npm run server
```

The server will start on port 5000 (or the port specified in your .env file).

### 6. Start the Frontend
In a separate terminal, start the React development server:

```bash
npm run dev
```

## How It Works

### Frontend (Contact.tsx)
- The contact form captures user input (name, email, phone, company, service type, project details)
- Form data is sent to the backend API endpoint `/api/contact`
- Success/error messages are displayed to the user
- The form resets after successful submission

### Backend (server.js)
- Receives form data from the frontend
- Sends two emails:
  1. **Notification Email** to `info@ianprint.com` with the contact form details
  2. **Confirmation Email** to the user confirming their message was received
- Returns success/error responses to the frontend

### Email Templates
Both emails use HTML templates with:
- Professional styling matching the IAN PRINT brand colors
- Clear information layout
- Responsive design

## API Endpoints

### POST /api/contact
- **Purpose**: Handle contact form submissions
- **Request Body**: JSON with form fields
- **Response**: Success/error message

### GET /api/health
- **Purpose**: Health check endpoint
- **Response**: Server status

## Troubleshooting

### Common Issues

1. **"Failed to send message" Error**
   - Check your .env file configuration
   - Verify your Gmail app password is correct
   - Ensure 2FA is enabled on your Gmail account

2. **CORS Errors**
   - The server includes CORS middleware
   - Frontend should be running on a different port (Vite default: 5173)

3. **Port Already in Use**
   - Change the PORT in your .env file
   - Update the frontend API call URL accordingly

### Testing
1. Fill out the contact form on the website
2. Check your Gmail account for the notification email
3. Check the user's email for the confirmation email
4. Verify the server console for any error messages

## Security Notes

- Never commit your .env file to version control
- The app password is more secure than your regular Gmail password
- Consider using environment-specific configurations for production

## Production Deployment

For production deployment:
1. Use a production email service (SendGrid, AWS SES, etc.)
2. Set up proper environment variables on your hosting platform
3. Use HTTPS for secure communication
4. Consider rate limiting for the contact endpoint
5. Add CAPTCHA or other spam prevention measures

## Support

If you encounter issues:
1. Check the server console for error messages
2. Verify your .env configuration
3. Test the email credentials manually
4. Check Gmail's security settings and app passwords
