/** Format "2026-09-10T14:00:00.000Z" → "10 Sep 2026" */
export const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

/** Compute a human-readable countdown to a future ISO timestamp */
export const getCountdown = (isoTarget: string) => {
    const diffMs = new Date(isoTarget).getTime() - Date.now();
    if (diffMs <= 0) return 'Available now';
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);
    const remH = diffH % 24;
    if (diffD > 0) return `${diffD}d ${remH}h remaining`;
    const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return diffH > 0 ? `${diffH}h ${diffM}m remaining` : `${diffM}m remaining`;
};

/** Short day label from "YYYY-MM-DD" */
export const shortDay = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });

/** Color mapping according to completion rate percentage */
export const getRateColor = (pct: number, primaryColor: string) => {
    if (pct >= 80) return '#10B981';
    if (pct >= 50) return primaryColor;
    return '#EF4444';
};
