import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  verificationLink: string;
  username: string;
}

export const VerificationEmail = ({
  verificationLink,
  username,
}: VerificationEmailProps) => {
  const siteName = process.env.NEXT_PUBLIC_APP_NAME || 'Agra Ecom';
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for {siteName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Email Verification</Heading>
          <Section>
            <Text style={text}>Hello {username},</Text>
            <Text style={text}>
              Thank you for registering with {siteName}. Please verify your email address by clicking the button below:
            </Text>
            <Button
              style={button}
              href={verificationLink}
            >
              Verify Email Address
            </Button>
            <Text style={text}>
              If you didn&apos;t request this email, please ignore it or contact support if you have concerns.
            </Text>
            <Text style={text}>
              This verification link will expire in 24 hours.
            </Text>
            <Text style={text}>
              If the button doesn&apos;t work, you can also click on the link below or copy and paste it into your browser:
            </Text>
            <Text style={link}>
              <Link href={verificationLink} style={link}>
                {verificationLink}
              </Link>
            </Text>
            <Text style={footer}>
              &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  borderRadius: '4px',
  maxWidth: '600px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginTop: '24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#5f6cef',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  marginBottom: '16px',
  padding: '12px 20px',
};

const link = {
  color: '#5f6cef',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#898989',
  fontSize: '14px',
  marginTop: '32px',
  textAlign: 'center' as const,
}; 