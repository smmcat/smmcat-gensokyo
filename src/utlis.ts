export const random = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** 血量可视化 */
export const generateHealthDisplay = (current: number, total: number): string => {
    const ratio = current / total;
    const displayLength = 10;
    const filledLength = Math.floor(ratio * displayLength);
    const unfilledLength = displayLength - filledLength;

    const filled = "■".repeat(filledLength);
    const unfilled = "□".repeat(unfilledLength);
    return filled + unfilled;
}