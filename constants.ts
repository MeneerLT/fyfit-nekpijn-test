import type { Question, Classification, ClassificationLevel } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'pijnscore',
    text: 'Op een schaal van 0 (geen pijn) tot 10 (ergst denkbare pijn), hoe beoordeelt u uw gemiddelde nekpijn van de afgelopen week?',
    type: 'slider',
    scored: true,
  },
  {
    id: 'wanneer_pijn',
    text: 'Wanneer ervaart u de meeste klachten?',
    type: 'multiple-choice',
    options: [
      { text: "Vooral 's ochtends bij het opstaan", value: 5 },
      { text: 'Tijdens of na mijn werk/studie', value: 7 },
      { text: 'Bij specifieke bewegingen', value: 3 },
      { text: 'Gedurende de hele dag door', value: 10 },
    ],
    scored: true,
  },
  {
    id: 'duur_klachten',
    text: 'Hoe lang heeft u al last van deze klachten?',
    type: 'multiple-choice',
    options: [
      { text: 'Een paar dagen', value: 2 },
      { text: 'Enkele weken', value: 5 },
      { text: '1 tot 3 maanden', value: 8 },
      { text: 'Langer dan 3 maanden', value: 10 },
    ],
    scored: true,
  },
  {
    id: 'concentratie',
    text: 'In hoeverre heeft uw nekpijn invloed op uw concentratie (bijv. bij lezen of schermwerk)?',
    type: 'slider',
    scored: true,
  },
  {
    id: 'al_geprobeerd',
    text: 'Wat heeft u al geprobeerd om de pijn te verlichten?',
    type: 'multiple-choice',
    options: [
      { text: 'Nog niets, ik hoopte dat het overging', value: 2 },
      { text: 'Ik heb rust genomen', value: 3 },
      { text: 'Pijnstillers gebruikt', value: 4 },
      { text: 'Zelf oefeningen gedaan', value: 5 },
    ],
    scored: true,
  },
  {
    id: 'doel',
    text: 'Wat zou u het liefst weer willen doen zonder nekpijn?',
    type: 'multiple-choice',
    options: [
      { text: 'Gewoon weer pijnvrij slapen', value: 1 },
      { text: "Mijn werk/hobby's kunnen doen zonder last", value: 2 },
      { text: 'Weer kunnen sporten', value: 3 },
      { text: 'Een dag zonder zeurende pijn ervaren', value: 4 },
    ],
    scored: false,
  },
  {
    id: 'motivatie',
    text: 'Hoe gemotiveerd bent u om actief aan een oplossing te werken voor uw nekpijn?',
    type: 'slider',
    scored: false,
  },
];

export const MAX_SCORE = 45; // Max score from all 'scored: true' questions

export const CLASSIFICATION_THRESHOLDS: Record<ClassificationLevel, { min: number; max: number }> = {
  'Licht': { min: 0, max: 12 },
  'Matig': { min: 13, max: 25 },
  'Ernstig': { min: 26, max: 38 },
  'Zeer ernstig': { min: 39, max: MAX_SCORE },
};

export const CLASSIFICATION_DETAILS: Record<ClassificationLevel, Classification> = {
  'Licht': {
    level: 'Licht',
    description: 'Uw score duidt op een lichte mate van beperking. De pijn is aanwezig maar heeft een minimale impact op uw dagelijks leven.',
    urgency: 'U hoeft zich geen zorgen te maken, maar laat een fysiotherapeut meekijken als dit aanhoudt.'
  },
  'Matig': {
    level: 'Matig',
    description: 'Uw score geeft aan dat de nekpijn een matige impact heeft. Bepaalde activiteiten kunnen al lastig zijn.',
    urgency: 'Plan deze week nog een intake om verergering te voorkomen.'
  },
  'Ernstig': {
    level: 'Ernstig',
    description: 'Uw score wijst op een ernstige beperking. De pijn heeft waarschijnlijk een aanzienlijke invloed op uw functioneren.',
    urgency: 'Wacht niet langer – een persoonlijk behandelplan kan snel verlichting geven.'
  },
  'Zeer ernstig': {
    level: 'Zeer ernstig',
    description: 'Uw score is zeer hoog, wat duidt op een zeer ernstige beperking. Uw dagelijks leven wordt waarschijnlijk sterk beïnvloed door de pijn.',
    urgency: 'Neem binnen enkele dagen contact op met onze manueel therapeut.'
  },
};

export const APPOINTMENT_URL = 'https://www.fysiotherapienijmegen.nl/afspraak/';
export const FALLBACK_EMAIL = 'info@fysiotherapienijmegen.nl';
