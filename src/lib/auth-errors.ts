import { AuthError } from '@supabase/supabase-js';

export type AuthErrorMessage = {
  title: string;
  message: string;
};

export function getAuthErrorMessage(error: AuthError): AuthErrorMessage {
  switch (error.message) {
    case 'Invalid login credentials':
      return {
        title: 'Invalid Credentials',
        message: 'The email or password you entered is incorrect. Please try again.'
      };
    case 'Email not confirmed':
      return {
        title: 'Email Not Verified',
        message: 'Please check your email and follow the verification link before signing in.'
      };
    case 'User already registered':
      return {
        title: 'Account Exists',
        message: 'An account with this email already exists. Please sign in instead.'
      };
    case 'Password should be at least 6 characters':
      return {
        title: 'Invalid Password',
        message: 'Your password must be at least 6 characters long.'
      };
    case 'Rate limit exceeded':
      return {
        title: 'Too Many Attempts',
        message: 'Please wait a moment before trying again.'
      };
    default:
      return {
        title: 'Authentication Error',
        message: 'An unexpected error occurred. Please try again later.'
      };
  }
}