import * as React from 'react';

interface VerificationEmailProps {
  fullName: string;
  verificationCode: string;
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({
  fullName,
  verificationCode,
}) => (
  <div style={styles.container}>
    <h1 style={styles.heading}>Welcome to AGRO!</h1>
    <p>Hi {fullName},</p>
    <p>Your verification code is:</p>
    <div style={styles.codeContainer}>
      <strong style={styles.code}>{verificationCode}</strong>
    </div>
    <p>This code expires in 15 minutes.</p>
  </div>
);

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  heading: {
    color: '#166534',
    marginBottom: '24px',
  },
  codeContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    padding: '24px',
    margin: '32px 0',
    textAlign: 'center' as const,
  },
  code: {
    color: '#166534',
    fontSize: '32px',
    fontWeight: 'bold',
    letterSpacing: '8px',
  }
};