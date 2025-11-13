
import type { Question, Classification, ClassificationLevel } from './types';

export const QUESTIONS: Question[] = [
  { id: 'werk_huishouden', text: 'In hoeverre beperkt je nekpijn je bij je werk, studie of huishoudelijke taken?' },
  { id: 'slapen', text: 'In hoeverre verstoort je nekpijn je nachtrust?' },
  { id: 'sport_recreatie', text: 'In hoeverre belemmert je nekpijn je bij sport, hobby\'s of andere leuke activiteiten?' },
  { id: 'autorijden', text: 'In hoeverre ervaar je last van je nek tijdens het autorijden of fietsen?' },
  { id: 'verzorging', text: 'In hoeverre beïnvloedt de pijn simpele dingen als wassen en aankleden?' },
  { id: 'concentratie', text: 'In hoeverre heeft je nekpijn invloed op je concentratie, bijvoorbeeld bij lezen of op een scherm kijken?' },
  { id: 'sociaal', text: 'In hoeverre beperkt de pijn je in het afspreken met vrienden of familie?' },
];

export const CLASSIFICATION_THRESHOLDS: Record<ClassificationLevel, { min: number; max: number }> = {
  'Licht': { min: 0, max: 20 },
  'Matig': { min: 21, max: 40 },
  'Ernstig': { min: 41, max: 60 },
  'Zeer ernstig': { min: 61, max: 70 },
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
