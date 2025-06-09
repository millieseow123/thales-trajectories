function stableRouteHash(key: string): number {
    let hash = 2166136261; // FNV-1a 32-bit hash
    for (let i = 0; i < key.length; i++) {
        hash ^= key.charCodeAt(i);
        hash *= 16777619;
    }
    return hash >>> 0; 
}
  
export function getColorByRoute(adep: string, ades: string): string {
    const key = `${adep}-${ades}`;
    const hash = stableRouteHash(key);

    const hue = (hash % 360); 
    const saturation = 80 + (hash % 10); 
    const lightness = 50 + (hash % 10); 

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
  
