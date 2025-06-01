import { describe, it, expect } from 'vitest';
import { getColorByRoute } from './colorByRoute';
import { computeTotalDistance } from './computeDistance';
import { haversineDistance } from "./distanceUtils";
import { isICAO } from './icao';
import { groupAirportsByCountry } from './groupAirportsByCountry';
import { getIcaoToCoordsMap, getNearestAirport, type Airport } from './loadAirports';
import { getIncreasingOffset, getDecreasingOffset } from './offset';

describe('getColorByRoute', () => {
    it('returns a consistent color for the same route', () => {
        expect(getColorByRoute('WSSS', 'RJTT')).toBe(getColorByRoute('WSSS', 'RJTT'));
    });
    it('returns different colors for different routes', () => {
        expect(getColorByRoute('WSSS', 'RJTT')).not.toBe(getColorByRoute('WSSS', 'KLAX'));
    });
    it('handles empty strings', () => {
        expect(() => getColorByRoute('', '')).not.toThrow();
    });
    it('returns a valid hex color for weird characters', () => {
        expect(getColorByRoute('@@@', '$$$')).toMatch(/^#([0-9a-f]{6})$/i);
    });
});

describe('computeTotalDistance', () => {
    it('returns 0 for less than 2 waypoints', () => {
        expect(computeTotalDistance([])).toBe(0);
        expect(computeTotalDistance([{ latitude: 1, longitude: 2 }])).toBe(0);
    });
    it('computes correct distance for two points', () => {
        const dist = computeTotalDistance([
            { latitude: 0, longitude: 0 },
            { latitude: 0, longitude: 1 }
        ]);
        expect(dist).toBeGreaterThan(100); 
    });
});

describe('isICAO', () => {
    it('returns true for valid ICAO', () => {
        expect(isICAO('WSSS')).toBe(true);
        expect(isICAO('RJTT')).toBe(true);
    });
    it('returns false for invalid ICAO', () => {
        expect(isICAO('SIN')).toBe(false);
        expect(isICAO('1234')).toBe(false);
        expect(isICAO('')).toBe(false);
    });
});

describe('groupAirportsByCountry', () => {
    it('groups airports by country code', () => {
        const airports = [
            { icao: 'WSSS', name: 'Changi', country: 'Singapore' },
            { icao: 'RJTT', name: 'Haneda', country: 'Japan' },
            { icao: 'KLAX', name: 'LAX', country: 'United States' }
        ];
        const grouped = groupAirportsByCountry(airports);
        expect(grouped.some(g => g.options.some(o => o.value === 'WSSS'))).toBe(true);
        expect(grouped.some(g => g.options.some(o => o.value === 'RJTT'))).toBe(true);
        expect(grouped.some(g => g.options.some(o => o.value === 'KLAX'))).toBe(true);
    });
});

describe('getIcaoToCoordsMap', () => {
    it('maps ICAO to coordinates', () => {
        const airports: Airport[] = [
            { icao: 'WSSS', name: 'Changi', lat: 1.35, lon: 103.82 },
            { icao: 'RJTT', name: 'Haneda', lat: 35.55, lon: 139.77 }
        ];
        const map = getIcaoToCoordsMap(airports);
        expect(map['WSSS']).toEqual([1.35, 103.82]);
        expect(map['RJTT']).toEqual([35.55, 139.77]);
    });
});

describe('getNearestAirport', () => {
    const airports: Airport[] = [
        { icao: 'WSSS', name: 'Changi', lat: 1.35, lon: 103.82 },
        { icao: 'RJTT', name: 'Haneda', lat: 35.55, lon: 139.77 }
    ];
    it('returns nearest airport within maxDist', () => {
        const nearest = getNearestAirport(1.36, 103.83, airports , 100);
        expect(nearest?.icao).toBe('WSSS');
    });
    it('returns null if no airport within maxDist', () => {
        const nearest = getNearestAirport(0, 0, airports, 1);
        expect(nearest).toBeNull();
    });
});

describe('haversineDistance', () => {
    it('returns 0 for same point', () => {
        expect(haversineDistance(1, 2, 1, 2)).toBeCloseTo(0);
    });
    it('returns correct distance for known points', () => {
        const dist = haversineDistance(0, 0, 0, 1);
        expect(dist).toBeGreaterThan(100);
    });
});

describe('getIncreasingOffset', () => {
    it('returns correct offset for zoom levels', () => {
        expect(getIncreasingOffset(12)).toBe(0.01);
        expect(getIncreasingOffset(10)).toBe(0.007);
        expect(getIncreasingOffset(8)).toBe(0.005);
        expect(getIncreasingOffset(6)).toBe(0.0008);
    });
});

describe('getDecreasingOffset', () => {
    it('returns correct offset for zoom levels', () => {
        expect(getDecreasingOffset(12)).toBeLessThan(getDecreasingOffset(8));
    });
});