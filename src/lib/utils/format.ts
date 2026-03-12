/**
 * Format a date as a human-readable relative time string.
 *
 * Examples: "in 2 days", "3 hours ago", "just now"
 */
export function formatRelativeTime(date: Date): string {
	const now = Date.now();
	const diffMs = date.getTime() - now;
	const absDiffMs = Math.abs(diffMs);
	const isFuture = diffMs > 0;

	const seconds = Math.floor(absDiffMs / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (seconds < 60) {
		return 'just now';
	}

	let value: number;
	let unit: string;

	if (days > 0) {
		value = days;
		unit = days === 1 ? 'day' : 'days';
	} else if (hours > 0) {
		value = hours;
		unit = hours === 1 ? 'hour' : 'hours';
	} else {
		value = minutes;
		unit = minutes === 1 ? 'minute' : 'minutes';
	}

	return isFuture ? `in ${value} ${unit}` : `${value} ${unit} ago`;
}
