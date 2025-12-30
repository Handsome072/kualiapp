# QualiApps Cloud - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- A Supabase account and project

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

The project is already configured with the following Supabase credentials:
- **URL**: `https://hvtsmovlsppvuncgvjvr.supabase.co`
- **Anon Key**: Already set in `.env` file

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr
2. Navigate to the **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL to create all necessary tables and policies

### 4. Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure email templates if needed (optional)

### 5. Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Testing Authentication

### Sign Up Flow
1. Open the app at `http://localhost:3000`
2. Click "Pas encore de compte ? S'inscrire"
3. Enter an email and password (min 6 characters)
4. Click "Créer mon compte"
5. Check your email for the confirmation link
6. Click the confirmation link to activate your account

### Sign In Flow
1. After confirming your email, return to the app
2. Enter your email and password
3. Click "Se connecter"
4. You should be redirected to the Setup Wizard

## Environment Variables

The `.env` file contains:
```
VITE_SUPABASE_URL=https://hvtsmovlsppvuncgvjvr.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Database Tables

The application uses the following tables:
- **profiles**: User settings and workspace configuration
- **reports**: Document analysis reports from AI
- **non_conformities**: Audit non-conformities tracking
- **documents**: Uploaded documents metadata
- **audit_states**: Progress tracking for each audit indicator

## Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ GDPR-compliant data anonymization before AI processing
- ✅ Prompt injection protection
- ✅ Server-side validation via Supabase Edge Functions

## Troubleshooting

### "Invalid API key" error
- Verify the `VITE_SUPABASE_ANON_KEY` in `.env` is correct
- Restart the dev server after changing `.env`

### Email confirmation not received
- Check your spam folder
- Verify email provider is enabled in Supabase dashboard
- Check Supabase logs for email delivery issues

### Database errors
- Ensure you've run the `supabase-schema.sql` script
- Verify RLS policies are enabled
- Check Supabase logs for detailed error messages

## Build for Production
```bash
npm run build
```

The production build will be in the `dist/` folder.

## Support
For issues related to Supabase configuration, visit: https://supabase.com/docs

