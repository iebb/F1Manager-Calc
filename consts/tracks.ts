import {TracksGame22} from "./tracks_game22";

export interface Track {
  name: string;
  location: string;
  country: string;
  trackcode: string;
  code: string;
  setup: number[];
  perfectEffects: number[][];
  perfectSetups: number[][];
  suffix: string;
  id: string;
}

export const tracks: Track[] = [
  {
    "name": "Unspecified",
    "location": "",
    "country": "-",
    "trackcode": "",
    "code": "XX",
    "suffix": "",
    "id": "XX",
    "setup": [
      0.5,
      0.5,
      0.5,
      0.5,
      0.5
    ]
  },
  {
    "name": "Sakhir",
    "location": "Sakhir",
    "country": "Bahrain",
    "trackcode": "Bahrain",
    "code": "BH",
    "suffix": "",
    "id": "BH",
    "setup": [
      0.4,
      0.2857142857142857,
      0.375,
      0.875,
      0.5
    ]
  },
  {
    "name": "Jeddah",
    "location": "Jeddah",
    "country": "Saudi Arabia",
    "trackcode": "Jeddah",
    "code": "SA",
    "suffix": "",
    "id": "SA",
    "setup": [
      0.75,
      0.2857142857142857,
      0,
      0.9375,
      0.05
    ]
  },
  {
    "name": "Melbourne",
    "location": "Melbourne",
    "country": "Australia",
    "trackcode": "AlbertPark",
    "code": "AU",
    "suffix": "",
    "id": "AU",
    "setup": [
      0.8,
      0.5714285714285714,
      0.25,
      0.5,
      0.55
    ]
  },
  {
    "name": "Imola",
    "location": "Imola",
    "country": "Italy (Emilia-Romagna)",
    "trackcode": "Imola",
    "code": "IT",
    "suffix": "EMI",
    "id": "IT-EMI",
    "setup": [
      0.65,
      0.5,
      0.625,
      1,
      0.05
    ]
  },
  {
    "name": "Miami",
    "location": "Miami",
    "country": "United States",
    "trackcode": "Miami",
    "code": "US",
    "suffix": "MIAMI",
    "id": "US-MIAMI",
    "setup": [
      0.8,
      0.6428571428571429,
      0.75,
      0.8125,
      0.25
    ]
  },
  {
    "name": "Catalunya",
    "location": "Barcelona",
    "country": "Spain",
    "trackcode": "Barcelona",
    "code": "ES",
    "suffix": "",
    "id": "ES",
    "setup": [
      0.85,
      0.7142857142857143,
      0.25,
      0.75,
      0.8
    ]
  },
  {
    "name": "Monte Carlo",
    "location": "Monte Carlo",
    "country": "Monaco",
    "trackcode": "Monaco",
    "code": "MC",
    "suffix": "",
    "id": "MC",
    "setup": [
      1,
      1,
      0.125,
      0.8125,
      0.85
    ]
  },
  {
    "name": "Baku",
    "location": "Baku",
    "country": "Azerbaijan",
    "trackcode": "Baku",
    "code": "AZ",
    "suffix": "",
    "id": "AZ",
    "setup": [
      0.25,
      0.21428571428571427,
      0.75,
      0.125,
      0.7
    ]
  },
  {
    "name": "Montréal",
    "location": "Montréal",
    "country": "Canada",
    "trackcode": "Montreal",
    "code": "CA",
    "suffix": "",
    "id": "CA",
    "setup": [
      0.4,
      0.42857142857142855,
      0.875,
      0.5,
      0.65
    ]
  },
  {
    "name": "Silverstone",
    "location": "Silverstone",
    "country": "Great Britain",
    "trackcode": "Silverstone",
    "code": "GB",
    "suffix": "",
    "id": "GB",
    "setup": [
      0.6,
      0.35714285714285715,
      0,
      0.625,
      0.35
    ]
  },
  {
    "name": "Spielberg",
    "location": "Spielberg",
    "country": "Austria",
    "trackcode": "RedBullRing",
    "code": "AT",
    "suffix": "",
    "id": "AT",
    "setup": [
      0.55,
      0.6428571428571429,
      0.875,
      0.3125,
      0.45
    ]
  },
  {
    "name": "Paul Ricard",
    "location": "Le Castellet",
    "country": "France",
    "trackcode": "PaulRicard",
    "code": "FR",
    "suffix": "",
    "id": "FR",
    "setup": [
      0.6,
      0.35714285714285715,
      0.625,
      0.6875,
      0.35
    ]
  },
  {
    "name": "Hungaroring",
    "location": "Budapest",
    "country": "Hungary",
    "trackcode": "Hungaroring",
    "code": "HU",
    "suffix": "",
    "id": "HU",
    "setup": [
      1,
      0.8571428571428571,
      0.875,
      0.3125,
      0.45
    ]
  },
  {
    "name": "Spa-Francorchamps",
    "location": "Spa-Francorchamps",
    "country": "Belgium",
    "trackcode": "SpaFrancorchamps",
    "code": "BE",
    "suffix": "",
    "id": "BE",
    "setup": [
      0.3,
      0.07142857142857142,
      0.625,
      0.8125,
      0.65
    ]
  },
  {
    "name": "Zandvoort",
    "location": "Zandvoort",
    "country": "Netherlands",
    "trackcode": "Zandvoort",
    "code": "NL",
    "suffix": "",
    "id": "NL",
    "setup": [
      0.95,
      0.6428571428571429,
      0.375,
      0.625,
      0.75
    ]
  },
  {
    "name": "Monza",
    "location": "Monza",
    "country": "Italy",
    "trackcode": "Monza",
    "code": "IT",
    "suffix": "",
    "id": "IT",
    "setup": [
      0.1,
      0,
      0.875,
      0.375,
      0.85
    ]
  },
  {
    "name": "Marina Bay",
    "location": "Marina Bay",
    "country": "Singapore",
    "trackcode": "MarinaBay",
    "code": "SG",
    "suffix": "",
    "id": "SG",
    "setup": [
      0.75,
      0.9285714285714286,
      0.125,
      0.0625,
      0.9
    ]
  },
  {
    "name": "Suzuka",
    "location": "Suzuka",
    "country": "Japan",
    "trackcode": "Suzuka",
    "code": "JP",
    "suffix": "",
    "id": "JP",
    "setup": [
      0.7,
      0.5714285714285714,
      0.5,
      0.9375,
      0
    ]
  },
  {
    "name": "Austin",
    "location": "Austin",
    "country": "United States",
    "trackcode": "CircuitOfTheAmericas",
    "code": "US",
    "suffix": "",
    "id": "US",
    "setup": [
      0.85,
      0.5714285714285714,
      0.875,
      0.875,
      0.35
    ]
  },
  {
    "name": "Mexico City",
    "location": "Mexico City",
    "country": "Mexico",
    "trackcode": "HermanosRodriguez",
    "code": "MX",
    "suffix": "",
    "id": "MX",
    "setup": [
      0.65,
      0.5714285714285714,
      0.875,
      1,
      0.5
    ]
  },
  {
    "name": "Interlagos",
    "location": "São Paulo",
    "country": "Brazil",
    "trackcode": "Interlagos",
    "code": "BR",
    "suffix": "",
    "id": "BR",
    "setup": [
      0.7,
      0.5714285714285714,
      0.875,
      0.75,
      0.4
    ]
  },
  {
    "name": "Yas Marina",
    "location": "Yas Island",
    "country": "Abu Dhabi, UAE",
    "trackcode": "YasMarina",
    "code": "AE",
    "suffix": "",
    "id": "AE",
    "setup": [
      0.5,
      0.5,
      0.625,
      0.625,
      0.7
    ]
  },
].map(x => {
  const sx = TracksGame22[x.trackcode] || {
    perfectEffects: [
      [0,1],[0,1],[0,1],[0,1],[0,1]
    ],
    perfectSetups: [
      [0,1],[0,1],[0,1],[0,1],[0,1]
    ]
  };
  return {
    ...x,
    perfectEffects: sx.perfectEffects,
    perfectSetups: [
      sx.perfectSetups[0],
      sx.perfectSetups[1],
      [0,2],[0,2],
      sx.perfectSetups[4],
    ],
  }
});