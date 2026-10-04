import { DATABASE_CONSTANTS, PaymentStatus } from './database.constants';

/**
 * Calculate payment status based on total amount and payments
 */
export function calculatePaymentStatus(
  totalAmount: number,
  paidAmount: number,
): PaymentStatus {
  if (paidAmount <= 0) {
    return DATABASE_CONSTANTS.PAYMENT_STATUS.NON_PAYE;
  }
  
  if (paidAmount >= totalAmount) {
    return DATABASE_CONSTANTS.PAYMENT_STATUS.PAYE;
  }
  
  return DATABASE_CONSTANTS.PAYMENT_STATUS.PARTIEL;
}

/**
 * Calculate remaining amount
 */
export function calculateRemainingAmount(
  totalAmount: number,
  paidAmount: number,
): number {
  return Math.max(0, totalAmount - paidAmount);
}

/**
 * Validate geographic coordinates for Niamey area
 */
export function validateNiameyCoordinates(
  latitude: number,
  longitude: number,
): boolean {
  const { NORTH, SOUTH, EAST, WEST } = DATABASE_CONSTANTS.NIAMEY_BOUNDS;
  
  return (
    latitude >= SOUTH &&
    latitude <= NORTH &&
    longitude >= WEST &&
    longitude <= EAST
  );
}

/**
 * Validate Niger phone number format
 */
export function validateNigerPhone(phone: string): boolean {
  return DATABASE_CONSTANTS.PHONE_REGEX.test(phone);
}

/**
 * Format phone number for Niger
 */
export function formatNigerPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Check if it starts with 227 (Niger country code)
  if (digits.startsWith('227')) {
    const number = digits.substring(3);
    if (number.length === 8) {
      return `+227 ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4, 6)} ${number.substring(6, 8)}`;
    }
  }
  
  // If 8 digits, assume local number
  if (digits.length === 8) {
    return `+227 ${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4, 6)} ${digits.substring(6, 8)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Generate pagination metadata
 */
export function generatePaginationMeta(
  total: number,
  page: number,
  pageSize: number,
) {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Create activity log description
 */
export function createActivityDescription(
  action: string,
  entityType: string,
  entityName?: string,
): string {
  const actionMap = {
    create: 'créé',
    update: 'modifié',
    delete: 'supprimé',
    activate: 'activé',
    deactivate: 'désactivé',
  };
  
  const entityMap = {
    client: 'client',
    user: 'utilisateur',
    service: 'service',
    intervention: 'intervention',
    payment: 'paiement',
  };
  
  const actionText = actionMap[action] || action;
  const entityText = entityMap[entityType] || entityType;
  
  if (entityName) {
    return `${entityText} "${entityName}" ${actionText}`;
  }
  
  return `${entityText} ${actionText}`;
}