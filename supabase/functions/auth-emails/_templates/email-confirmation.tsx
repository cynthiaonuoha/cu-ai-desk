import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Img,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface EmailConfirmationProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const EmailConfirmationTemplate = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: EmailConfirmationProps) => {
  
  // Generate the verification URL
  const verificationUrl = token_hash.startsWith('direct-') 
    ? 'https://cuaidesk.org.ng/auth'
    : `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

  return (
    <Html>
      <Head />
      <Preview>Confirm your CU AI Desk account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="https://gfsfsygledjtbqyuvarq.supabase.co/storage/v1/object/public/uploads/be140c00-8e6f-44bd-ba21-52a2e9a0090e.png"
              width="64"
              height="64"
              alt="CU AI Desk Logo"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Welcome to CU AI Desk! 🎉</Heading>
          
          <Text style={text}>
            Hi there! We're excited to have you join the CU AI Desk community at Covenant University.
          </Text>
          
          <Text style={text}>
            To get started with your intelligent study companion, please confirm your email address by clicking the button below:
          </Text>
          
          <Section style={buttonSection}>
            <Link
              href={verificationUrl}
              target="_blank"
              style={button}
            >
              Confirm Your Account
            </Link>
          </Section>
          
          {!token_hash.startsWith('direct-') && token !== 'SIGNUP_TOKEN' && (
            <>
              <Text style={text}>
                Or copy and paste this confirmation code if the button doesn't work:
              </Text>
              
              <Section style={codeSection}>
                <Text style={code}>{token}</Text>
              </Section>
            </>
          )}
          
          <Hr style={hr} />
          
          <Text style={footerText}>
            This email was sent to {user_email}. If you didn't create an account with CU AI Desk, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            <strong>CU AI Desk</strong><br />
            Covenant University<br />
            Your Intelligent Study Companion
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f8f7ff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
}

const logoSection = {
  textAlign: 'center' as const,
  padding: '32px 0 16px',
}

const logo = {
  borderRadius: '50%',
  margin: '0 auto',
}

const h1 = {
  color: '#7c3aed',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '16px 0 32px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'left' as const,
  margin: '16px 32px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
}

const codeSection = {
  textAlign: 'center' as const,
  margin: '24px 32px',
  padding: '16px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  border: '2px dashed #d1d5db',
}

const code = {
  color: '#7c3aed',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0',
  fontFamily: 'Monaco, Consolas, monospace',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '16px 32px',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '32px 32px 16px',
}

export default EmailConfirmationTemplate
