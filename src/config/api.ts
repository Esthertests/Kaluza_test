/**
 * Centralized API configuration
 * Single source of truth for all API-related settings
 */

export const API_CONFIG = {
  BASE_URL: process.env.AGIFY_BASE_URL || 'https://api.agify.io',
  TIMEOUT: parseInt(process.env.AGIFY_TIMEOUT || '8000'),
  RATE_LIMIT_DELAY: 1000, 
  API_KEY: process.env.AGIFY_API_KEY || '', // API key for the Agify API, it is optional and can be provided in the request headers
} as const;

export default API_CONFIG;
