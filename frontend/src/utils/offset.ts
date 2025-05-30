export function getIncreasingOffset(zoomLevel: number): number {
    if (zoomLevel >= 12) return 0.01;
    if (zoomLevel >= 10) return 0.007;
    if (zoomLevel >= 8) return 0.005;
    return 0.0008;
}

export function getDecreasingOffset(zoomLevel: number): number {
    if (zoomLevel >= 12) return 0.001;
    if (zoomLevel >= 10) return 0.03;
    if (zoomLevel >= 8) return 0.05;
    return 0.03;
}