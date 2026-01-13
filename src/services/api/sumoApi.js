import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT } from './apiConfig'
import { rateLimiter } from '../rateLimiter/rateLimiter'

/**
 * Create Axios instance with base configuration
 */
const sumoApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - apply rate limiting
 */
sumoApiClient.interceptors.request.use(
  async (config) => {
    // Check if we can make the request
    if (!rateLimiter.canMakeRequest()) {
      console.warn('Rate limit reached, waiting...')
      await rateLimiter.waitForAvailability()
    }

    // Record the request
    rateLimiter.recordRequest()

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - handle errors globally
 */
sumoApiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data)

      // Handle specific status codes
      switch (error.response.status) {
        case 429:
          // Too Many Requests
          throw new Error('Rate limit exceeded. Please wait before making more requests.')
        case 404:
          throw new Error('Data not found. Please check the tournament or division.')
        case 500:
          throw new Error('Server error. Please try again later.')
        default:
          throw new Error(`API request failed: ${error.response.statusText}`)
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request)
      throw new Error('Network error. Please check your internet connection.')
    } else {
      // Something else happened
      console.error('Error:', error.message)
      throw new Error(error.message)
    }
  }
)

export default sumoApiClient
