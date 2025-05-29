import { describe, it, expect } from 'vitest';
import { getColorByRoute } from './colorByRoute';

describe('getColorByRoute', () => {
    it('should return a consistent color for the same route', () => {
        const color1 = getColorByRoute('WSSS', 'RJTT');
        const color2 = getColorByRoute('WSSS', 'RJTT');
        expect(color1).toBe(color2);
    });

    it('should return different colors for different routes', () => {
        const color1 = getColorByRoute('WSSS', 'RJTT');
        const color2 = getColorByRoute('WSSS', 'KLAX');
        expect(color1).not.toBe(color2);
    });

    it('should handle empty strings', () => {
        expect(() => getColorByRoute('', '')).not.toThrow();
    });

    it('should return consistent color even with weird characters', () => {
        const color = getColorByRoute('@@@', '$$$');
        expect(color).toMatch(/^hsl\(/);
    });
      
});
