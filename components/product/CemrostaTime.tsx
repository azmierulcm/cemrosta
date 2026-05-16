'use client';

import React from 'react';
import { DateTime } from 'luxon';

interface TimeProps {
  isoUtc?: string;
  format?: string;
  className?: string;
}

/**
 * Cemrosta Standard Time Component
 * Strictly handles timezone conversions using Luxon.
 * Defaults to Local Time for UI display.
 */
export const CemrostaTime = ({ isoUtc, format = 'HH:mm', className }: TimeProps) => {
  if (!isoUtc) return <span className={className}>--:--</span>;

  let displayText = '--:--';
  try {
    // 1. Parse UTC strictly
    const utcTime = DateTime.fromISO(isoUtc, { zone: 'utc' });
    
    // 2. Convert to User's Local Time (or specific airport TZ)
    const localTime = utcTime.toLocal();
    displayText = localTime.toFormat(format);
  } catch (err) {
    console.error('Timezone conversion error:', err);
    displayText = 'Error';
  }

  return (
    <span className={className}>
      {displayText}
    </span>
  );
};
