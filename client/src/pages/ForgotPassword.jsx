import React, { useState } from 'react';
import { Activity, Lock, Mail, KeyRound, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ onNavigateLogin }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtpMsg, setDevOtpMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setDevOtpMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep(2);
      setSuccess('OTP verification code has been sent to your email!');
      
      // If we are in local dev and fallback is activated or ethereal preview is returned:
      if (data.fallback) {
        setDevOtpMsg('Dev notice: SMTP is offline. Check your backend server logs/terminal for the OTP code.');
      } else if (data.previewUrl) {
        setDevOtpMsg(`Dev notice: Check your Ethereal mailbox at the preview link in the backend console.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        onNavigateLogin();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page flex-center animate-fade-in">
      <div className="auth-card glass-panel glass-panel-glow" style={{ padding: '32px' }}>
        {/* Brand Header */}
        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))',
            padding: '12px',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            marginBottom: '16px'
          }}>
            <Activity size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', textAlign: 'center' }}>
            {step === 1 
              ? 'Enter email to receive a One-Time Verification OTP code' 
              : 'Enter verification OTP code and your new password'
            }
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex-gap" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="flex-gap" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            color: 'var(--color-success)',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Dev Notice */}
        {devOtpMsg && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            borderRadius: '8px',
            padding: '10px 12px',
            color: 'var(--color-info)',
            fontSize: '0.78rem',
            marginBottom: '20px',
            lineHeight: 1.4
          }}>
            {devOtpMsg}
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Input Email */
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          /* Step 2: Verification & Password Reset */
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">6-Digit OTP Code</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="form-input"
                  style={{ paddingLeft: '44px', letterSpacing: '4px', fontWeight: 'bold' }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '16px' }}
              onClick={() => {
                setStep(1);
                setSuccess('');
                setError('');
                setDevOtpMsg('');
              }}
              disabled={loading}
            >
              Back to Step 1
            </button>
          </form>
        )}

        {/* Navigation back to login */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button
            onClick={onNavigateLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
