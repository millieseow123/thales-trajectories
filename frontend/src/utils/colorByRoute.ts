import chroma from 'chroma-js';

const scale = chroma.scale('Set3').colors(100); 

export function getColorByRoute(adep: string, ades: string): string {
    const key = `${adep}-${ades}`;
    const index = Array.from(key).reduce((acc, char) => acc + char.charCodeAt(0), 0) % scale.length;
    return scale[index];
}
