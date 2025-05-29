export type Airport = {
    icao: string;
    name: string;
    country: string;
};

export type AirportOption = {
    value: string;
    label: string;
};

export type GroupedAirportOption = {
    label: string;
    options: AirportOption[];
};

export function groupAirportsByCountry(airports: Airport[]): GroupedAirportOption[] {
    const grouped = Object.entries(
        airports.reduce((acc, airport) => {
            const country = airport.country.slice(0, 2);
            if (!acc[country]) acc[country] = [];
            acc[country].push({
                value: airport.icao,
                label: `${airport.icao} - ${airport.name}`,
            });
            return acc;
        }, {} as Record<string, AirportOption[]>)
    ).map(([country, options]) => ({
        label: country,
        options: options.sort((a, b) =>
            a.label.split(" - ")[1].localeCompare(b.label.split(" - ")[1])
        ),
    }));

    grouped.sort((a, b) => a.label.localeCompare(b.label));
    return grouped;
}
  