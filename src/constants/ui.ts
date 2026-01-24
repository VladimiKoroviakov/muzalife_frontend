export const UI_MESSAGES = {
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    SERVER: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    DEFAULT: 'An unexpected error occurred.',
  },
  SUCCESS: {
    SAVED: 'Changes saved successfully.',
    DELETED: 'Item deleted successfully.',
    UPLOADED: 'File uploaded successfully.',
  },
} as const;