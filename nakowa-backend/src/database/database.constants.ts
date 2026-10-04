// Database constants for Nakowa MVP

export const DATABASE_CONSTANTS = {
  // Default pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // User constraints
  MIN_PASSWORD_LENGTH: 6,
  
  // Geographic bounds for Niamey, Niger
  NIAMEY_BOUNDS: {
    NORTH: 13.6000,
    SOUTH: 13.4000,
    EAST: 2.2000,
    WEST: 2.0000,
    CENTER: {
      lat: 13.5137,
      lng: 2.1098,
    },
  },
  
  // Status mappings
  PAYMENT_STATUS: {
    NON_PAYE: 'NON_PAYE',
    PARTIEL: 'PARTIEL',
    PAYE: 'PAYE',
  } as const,
  
  // Default services for Nakowa
  DEFAULT_SERVICES: [
    'Vidange',
    'Nettoyage', 
    'Assainissement',
    'Curage',
  ] as const,
  
  // Common phone number formats for Niger
  PHONE_REGEX: /^\+227\s\d{2}\s\d{2}\s\d{2}\s\d{2}$/,
  
  // Email validation
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export type PaymentStatus = typeof DATABASE_CONSTANTS.PAYMENT_STATUS[keyof typeof DATABASE_CONSTANTS.PAYMENT_STATUS];