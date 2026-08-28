// ==========================================
// FINTECH FORMATTING UTILITIES (INDIAN & GLOBAL)
// ==========================================

/**
 * Formats a number to Indian Rupee currency format
 * e.g., 248500 -> "₹2,48,500"
 */
export function formatINR(amount: number, options: { showDecimals?: boolean; compact?: boolean } = {}): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const { showDecimals = false, compact = false } = options;

  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 10000000) {
      // Crores
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (abs >= 100000) {
      // Lakhs
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (abs >= 1000) {
      // Thousands
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Formats standard number with Indian grouping (e.g. 1,00,000)
 */
export function formatIndianNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Formats percentage e.g. 55.3%
 */
export function formatPercent(val: number, decimals: number = 1): string {
  if (isNaN(val) || val === null || val === undefined) return '0.0%';
  return `${val.toFixed(decimals)}%`;
}

/**
 * Formats ISO timestamp to human readable format
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const now = Date.now();
    const target = new Date(isoString).getTime();
    const diffSec = Math.floor((now - target) / 1000);

    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return isoString;
  }
}
