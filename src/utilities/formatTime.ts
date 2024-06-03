export function formatVideoTimeWithText(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} min ${remainingSeconds} sec`;
}