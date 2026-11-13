export const formatAmount = (amount: number): string =>
  `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (isoDate: string): string => {
  const date  = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today))     return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
};

export const formatDateFull = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-PH', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  });

export const todayISO = (): string => new Date().toISOString().split('T')[0];
