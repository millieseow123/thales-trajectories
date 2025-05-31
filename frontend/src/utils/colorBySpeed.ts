export function getColorBySpeed(speed: number): string {
    if (speed > 900) return '#ff0000';      
    if (speed > 600) return '#ffa500';      
    if (speed > 300) return '#1fc600';     
    return '#00ff00';                     
}