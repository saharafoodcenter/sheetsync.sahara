import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ExpiryStatus = {
  status: 'expired' | 'expiring' | 'fresh';
  label: string;
  color: string;
  days: number;
};

export function getExpiryStatus(expiryDate: Date, comparisonDate: Date): ExpiryStatus {
  const today = new Date(comparisonDate);
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0,0,0,0);

  const daysUntilExpiry = differenceInDays(expiry, today);

  if (daysUntilExpiry < 0) {
    return {
      status: 'expired',
      label: `Expired ${formatDistanceToNow(expiry, { addSuffix: true, now: today })}`,
      color: 'border-red-500/50 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950 dark:text-red-400',
      days: daysUntilExpiry,
    };
  }
  if (daysUntilExpiry <= 7) {
    let label;
    if (daysUntilExpiry === 0) {
      label = 'Expires today';
    } else if (daysUntilExpiry === 1) {
      label = 'Expires tomorrow';
    } else {
      label = `Expires in ${daysUntilExpiry} days`;
    }
    return {
      status: 'expiring',
      label: label,
      color: 'border-amber-500/50 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950 dark:text-amber-400',
      days: daysUntilExpiry,
    };
  }
  return {
    status: 'fresh',
    label: `Expires on ${format(expiry, 'MMM d, yyyy')}`,
    color: 'border-green-500/50 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-950 dark:text-green-400',
    days: daysUntilExpiry,
  };
}
