import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExpiryStatus(expiryDate: Date): {
  status: 'expired' | 'expiring' | 'fresh';
  label: string;
  color: string;
  days: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0,0,0,0);

  const daysUntilExpiry = differenceInDays(expiry, today);

  if (daysUntilExpiry < 0) {
    return {
      status: 'expired',
      label: `Expired ${formatDistanceToNow(expiry, { addSuffix: true })}`,
      color: 'bg-destructive/80 text-destructive-foreground',
      days: daysUntilExpiry,
    };
  }
  if (daysUntilExpiry <= 7) {
    return {
      status: 'expiring',
      label: `Expires in ${daysUntilExpiry} day(s)`,
      color: 'bg-warning text-warning-foreground',
      days: daysUntilExpiry,
    };
  }
  return {
    status: 'fresh',
    label: `Expires on ${format(expiry, 'MMM d, yyyy')}`,
    color: 'bg-secondary text-secondary-foreground',
    days: daysUntilExpiry,
  };
}
