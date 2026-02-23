export type SeverityLevel = 'Severe' | 'Moderate' | 'Normal';

export interface Village {
    id: string;
    name: string;
    population: number;
    stressIndex: number; // 0 to 100
    severity: SeverityLevel;
    predictedTankerDemand: number; // in liters or tankers needed
    coordinates: [number, number]; // [latitude, longitude]
}

export const mockVillages: Village[] = [
    {
        id: 'v1',
        name: 'Paithan',
        population: 15400,
        stressIndex: 85,
        severity: 'Severe',
        predictedTankerDemand: 12,
        coordinates: [19.4891, 75.3855]
    },
    {
        id: 'v2',
        name: 'Vaijapur',
        population: 12200,
        stressIndex: 72,
        severity: 'Severe',
        predictedTankerDemand: 8,
        coordinates: [19.9272, 74.7291]
    },
    {
        id: 'v3',
        name: 'Gangapur',
        population: 9800,
        stressIndex: 65,
        severity: 'Moderate',
        predictedTankerDemand: 4,
        coordinates: [19.6974, 75.0089]
    },
    {
        id: 'v4',
        name: 'Kannad',
        population: 11500,
        stressIndex: 45,
        severity: 'Moderate',
        predictedTankerDemand: 2,
        coordinates: [20.2644, 75.1384]
    },
    {
        id: 'v5',
        name: 'Sillod',
        population: 14300,
        stressIndex: 25,
        severity: 'Normal',
        predictedTankerDemand: 0,
        coordinates: [20.3060, 75.6534]
    },
    {
        id: 'v6',
        name: 'Phulambri',
        population: 8600,
        stressIndex: 20,
        severity: 'Normal',
        predictedTankerDemand: 0,
        coordinates: [20.0841, 75.4216]
    },
    {
        id: 'v7',
        name: 'Khuldabad',
        population: 7500,
        stressIndex: 88,
        severity: 'Severe',
        predictedTankerDemand: 10,
        coordinates: [20.0075, 75.1873]
    },
    {
        id: 'v8',
        name: 'Soygaon',
        population: 6200,
        stressIndex: 58,
        severity: 'Moderate',
        predictedTankerDemand: 3,
        coordinates: [20.5350, 75.5262]
    }
];
