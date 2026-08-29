/**
 * Toast Notification System - Centralized Feedback for Next.js
 * 
 * Provides a unified interface for showing user feedback messages
 * across the web application. This is a Phase 1 foundation placeholder.
 * 
 * Phase 1 Foundation - Architectural placeholder
 * 
 * Usage:
 *   Toast.success("Operation completed");
 *   Toast.error("Unable to connect");
 *   Toast.warning("Connection lost");
 *   Toast.info("Synchronizing data");
 * 
 * Critical emergency events (flood warning, fire warning, evacuation order,
 * critical pollution, SOS, responder emergency) should NOT use this temporary
 * toast system. They require a dedicated persistent emergency UI system
 * to be implemented in later phases.
 * 
 * NOTE: This is a foundation placeholder. In Phase 2+, integrate with a toast
 * library like react-hot-toast, sonner, or similar for actual UI rendering.
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast notification system foundation
 * 
 * This provides the API contract for toast notifications.
 * Actual UI rendering should be implemented with a toast library
 * in Phase 2+ when the UI is built.
 */
class ToastSystem {
  private callbacks: Map<ToastType, (message: string, options?: ToastOptions) => void> =
    new Map();

  /**
   * Register a callback for a specific toast type
   * This should be called by the UI layer to connect to actual toast rendering
   */
  registerCallback(type: ToastType, callback: (message: string, options?: ToastOptions) => void) {
    this.callbacks.set(type, callback);
  }

  /**
   * Show a success message (green)
   */
  success(message: string, options?: ToastOptions) {
    this.execute('success', message, options);
  }

  /**
   * Show an error message (red)
   */
  error(message: string, options?: ToastOptions) {
    this.execute('error', message, options);
  }

  /**
   * Show a warning message (orange)
   */
  warning(message: string, options?: ToastOptions) {
    this.execute('warning', message, options);
  }

  /**
   * Show an info message (blue)
   */
  info(message: string, options?: ToastOptions) {
    this.execute('info', message, options);
  }

  /**
   * Convert API error to user-friendly message
   */
  getErrorMessage(error: any): string {
    if (error && typeof error === 'object') {
      const message = error.message || error.error?.message;
      if (typeof message === 'string') {
        return this.sanitizeErrorMessage(message);
      }
    }
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Handle validation errors from API
   */
  getValidationErrors(error: any): string[] {
    if (error && typeof error === 'object') {
      const details = error.error?.details;
      if (Array.isArray(details)) {
        return details.map((detail) => this.sanitizeErrorMessage(detail));
      }
    }
    return [];
  }

  private execute(type: ToastType, message: string, options?: ToastOptions) {
    const callback = this.callbacks.get(type);
    if (callback) {
      callback(message, options);
    } else {
      // Fallback to console during Phase 1 when UI is not implemented
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove technical details that shouldn't be shown to users
    return message
      .replace(/\[.*?\]/g, '') // Remove bracketed technical info
      .replace(/\{.*?\}/g, '') // Remove JSON-like structures
      .replace(/<.*?>/g, '') // Remove HTML-like tags
      .replace(/password/gi, '***')
      .replace(/secret/gi, '***')
      .replace(/token/gi, '***')
      .trim();
  }
}

export const Toast = new ToastSystem();

/**
 * Example implementation for Phase 2+ with react-hot-toast:
 * 
 * import toast from 'react-hot-toast';
 * 
 * // Register callbacks in your app initialization
 * Toast.registerCallback('success', (message, options) => {
 *   toast.success(message, { duration: options?.duration || 3000 });
 * });
 * 
 * Toast.registerCallback('error', (message, options) => {
 *   toast.error(message, { duration: options?.duration || 4000 });
 * });
 * 
 * Toast.registerCallback('warning', (message, options) => {
 *   toast(message, { 
 *     icon: '⚠️',
 *     duration: options?.duration || 3000 
 *   });
 * });
 * 
 * Toast.registerCallback('info', (message, options) => {
 *   toast(message, { 
 *     icon: 'ℹ️',
 *     duration: options?.duration || 2000 
 *   });
 * });
 */
