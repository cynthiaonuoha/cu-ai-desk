
import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { EmailConfirmationTemplate } from './_templates/email-confirmation.tsx'
import { PasswordResetTemplate } from './_templates/password-reset.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('AUTH_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple HTML templates for faster delivery
const getSimpleConfirmationHTML = (email: string, verificationUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm Your CU AI Desk Account</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://gfsfsygledjtbqyuvarq.supabase.co/storage/v1/object/public/uploads/be140c00-8e6f-44bd-ba21-52a2e9a0090e.png" alt="CU AI Desk" style="width: 64px; height: 64px; border-radius: 50%;">
  </div>
  
  <h1 style="color: #7c3aed; text-align: center; margin-bottom: 30px;">Welcome to CU AI Desk! 🎉</h1>
  
  <p>Hi there! We're excited to have you join the CU AI Desk community at Covenant University.</p>
  
  <p>To get started with your intelligent study companion, please confirm your email address:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verificationUrl}" style="background-color: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Confirm Your Account</a>
  </div>
  
  <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
    This email was sent to ${email}. If you didn't create an account with CU AI Desk, you can safely ignore this email.
  </p>
  
  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
    <strong>CU AI Desk</strong><br>
    Covenant University<br>
    Your Intelligent Study Companion
  </p>
</body>
</html>
`;

const getSimplePasswordResetHTML = (email: string, resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your CU AI Desk Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://gfsfsygledjtbqyuvarq.supabase.co/storage/v1/object/public/uploads/be140c00-8e6f-44bd-ba21-52a2e9a0090e.png" alt="CU AI Desk" style="width: 64px; height: 64px; border-radius: 50%;">
  </div>
  
  <h1 style="color: #7c3aed; text-align: center; margin-bottom: 30px;">Reset Your Password 🔐</h1>
  
  <p>Hi there! We received a request to reset your password for your CU AI Desk account.</p>
  
  <p>Click the button below to reset your password and get back to your intelligent study companion:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
  </div>
  
  <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 12px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <p style="color: #f59e0b; font-size: 14px; margin: 0;">⚠️ This password reset link will expire in 24 hours for security reasons.</p>
  </div>
  
  <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
    This email was sent to ${email}. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
  </p>
  
  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
    <strong>CU AI Desk</strong><br>
    Covenant University<br>
    Your Intelligent Study Companion
  </p>
</body>
</html>
`;

// Simple token generator for direct calls
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateTokenHash() {
  return 'direct-' + Math.random().toString(36).substring(2, 15);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  const startTime = Date.now();
  console.log('🚀 Auth email request received at:', new Date().toISOString());

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    let data: any;
    let isWebhookCall = false;

    // Try to detect if this is a webhook call or direct function call
    if (hookSecret && headers['webhook-signature']) {
      // This is a webhook call from Supabase Auth Hooks
      try {
        const wh = new Webhook(hookSecret)
        wh.verify(payload, headers)
        data = JSON.parse(payload)
        isWebhookCall = true;
        console.log('✅ Verified webhook call from Supabase')
      } catch (error) {
        console.error('❌ Webhook verification failed:', error)
        return new Response('Unauthorized', { 
          status: 401,
          headers: corsHeaders 
        })
      }
    } else {
      // This is a direct function call from frontend
      try {
        data = JSON.parse(payload)
        console.log('📱 Direct function call from frontend for:', data.email_data?.email_action_type)
      } catch (error) {
        console.error('❌ Failed to parse request body:', error)
        return new Response('Invalid request body', { 
          status: 400,
          headers: corsHeaders 
        })
      }
    }

    const { user, email_data } = data

    if (!user?.email || !email_data?.email_action_type) {
      console.error('❌ Missing required data:', { user, email_data })
      return new Response('Missing required data', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    const { token, token_hash, redirect_to, email_action_type } = email_data

    console.log('📧 Processing email for action type:', email_action_type, 'to:', user.email)

    // Generate tokens for direct calls or use provided ones
    const emailToken = token || generateToken()
    const emailTokenHash = token_hash || generateTokenHash()
    
    // Use custom redirect URL if provided, otherwise use default
    let emailRedirectTo = redirect_to || `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify`
    
    // For password reset, ensure we use the reset-password page
    if (email_action_type === 'recovery' && redirect_to) {
      emailRedirectTo = redirect_to
    }

    // Generate the URLs
    const verificationUrl = emailTokenHash.startsWith('direct-') 
      ? 'https://cu-ai-desk.vercel.app/auth'
      : `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailTokenHash}&type=${email_action_type}&redirect_to=${emailRedirectTo}`;

    const resetUrl = emailTokenHash.startsWith('direct-') 
      ? 'https://cu-ai-desk.vercel.app/reset-password'
      : `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${emailTokenHash}&type=${email_action_type}&redirect_to=${emailRedirectTo}`;

    let html: string
    let subject = 'CU AI Desk Notification'
    const fromName = 'CU AI Desk'

    console.log('⚡ Using fast HTML templates for immediate delivery...')

    // Use simple HTML templates for faster delivery
    switch (email_action_type) {
      case 'signup':
      case 'email_change':
        html = getSimpleConfirmationHTML(user.email, verificationUrl)
        subject = 'Confirm Your CU AI Desk Account 🎓'
        break

      case 'recovery':
      case 'magiclink':
        html = getSimplePasswordResetHTML(user.email, resetUrl)
        subject = 'Reset Your CU AI Desk Password 🔐'
        break

      default:
        console.log('❌ Unknown email action type:', email_action_type)
        return new Response('Unknown email type', { 
          status: 400,
          headers: corsHeaders 
        })
    }

    console.log('📮 Sending email via Resend to:', user.email)

    // Send email with verified domain for immediate delivery
    const { data: emailData, error } = await resend.emails.send({
      from: `${fromName} <onboarding@resend.dev>`, // Use verified Resend domain
      to: [user.email],
      subject: subject,
      html: html,
      // Add headers for fastest processing
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    })

    if (error) {
      console.error('❌ Resend email error:', error)
      throw error
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Email sent successfully in ${totalTime}ms! Email ID:`, emailData?.id)

    return new Response(JSON.stringify({ 
      success: true, 
      email_id: emailData?.id,
      processing_time: totalTime,
      message: 'Email sent successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })

  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Error in auth-emails function after ${totalTime}ms:`, error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          processing_time: totalTime,
        },
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )
  }
})
