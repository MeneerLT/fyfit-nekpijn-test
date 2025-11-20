
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Answers, AppStep, Classification, ClassificationLevel, Question } from './types';
import { QUESTIONS, CLASSIFICATION_THRESHOLDS, CLASSIFICATION_DETAILS, APPOINTMENT_URL, FALLBACK_EMAIL, MAX_SCORE } from './constants';

// --- Helper Hook for Persistent State ---
function usePersistentState<T,>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialState;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialState;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [key, state]);

  return [state, setState];
}

// --- Icons ---

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const HappyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9v-.008zm6 0h.008v.008H15v-.008z" />
    </svg>
);

const SadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16a4.5 4.5 0 00-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9v-.008zm6 0h.008v.008H15v-.008z" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// --- UI Components ---

const Header: React.FC = () => (
  <header className="w-full flex flex-col items-center justify-center py-6 mb-4">
      <div className="mb-2 flex items-baseline select-none">
        <span className="text-6xl font-light text-gray-800 tracking-tighter">Fy</span>
        <div className="w-3 h-3 bg-fyfit-orange rounded-full mx-1.5 mb-2"></div>
        <span className="text-6xl font-light text-gray-800 tracking-tighter">Fit</span>
      </div>
      <div className="text-center">
        <h2 className="text-sm md:text-base font-bold text-gray-600 uppercase tracking-widest">Fysiotherapie Nijmegen</h2>
        <h1 className="text-2xl md:text-3xl font-bold text-fyfit-orange mt-1">Nekpijn test</h1>
      </div>
  </header>
);

interface ProgressBarProps {
  current: number;
  total: number;
}
const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.max(0, (current / total) * 100);
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
        <span>Voortgang</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-fyfit-orange h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(249,115,22,0.3)]"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

interface SliderInputProps {
  question: Question;
  value: number;
  onChange: (id: string, value: number) => void;
}
const SliderInput: React.FC<SliderInputProps> = ({ question, value, onChange }) => {
  return (
    <div className="w-full my-6 animate-slide-up">
      <label className="block text-xl md:text-2xl font-semibold text-gray-900 mb-8 text-center leading-snug">
        {question.text}
      </label>
      
      <div className="relative px-4 py-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <input
            id={question.id}
            type="range"
            min="0"
            max="10"
            value={value}
            onChange={(e) => onChange(question.id, parseInt(e.target.value, 10))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fyfit-orange focus:outline-none focus:ring-2 focus:ring-fyfit-orange/30"
          />
          <style>{`
            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 24px;
              width: 24px;
              border-radius: 50%;
              background: #F97316;
              margin-top: -4px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
          `}</style>
          
          <div className="flex justify-between items-center mt-6">
             <div className={`flex flex-col items-center transition-colors duration-300 ${value < 4 ? 'text-green-600' : 'text-gray-400'}`}>
                <HappyIcon className="h-8 w-8 mb-1" />
                <span className="text-xs font-medium">Geen last</span>
            </div>
            
            <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-fyfit-orange tabular-nums">{value}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold mt-1">Score</span>
            </div>

            <div className={`flex flex-col items-center transition-colors duration-300 ${value > 7 ? 'text-red-600' : 'text-gray-400'}`}>
                <SadIcon className="h-8 w-8 mb-1" />
                <span className="text-xs font-medium">Veel last</span>
            </div>
          </div>
      </div>
    </div>
  );
};

const MultipleChoiceInput: React.FC<{
  question: Question;
  onSelect: (id: string, value: number) => void;
}> = ({ question, onSelect }) => (
  <div className="w-full my-6 animate-slide-up">
    <p className="block text-xl md:text-2xl font-semibold text-gray-900 mb-8 text-center leading-snug">
        {question.text}
    </p>
    <div className="grid grid-cols-1 gap-3">
      {question.options?.map((option) => (
        <button
          key={option.text}
          onClick={() => onSelect(question.id, option.value)}
          className="group relative w-full text-left p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-fyfit-orange hover:bg-orange-50/50 transition-all duration-200 flex items-center justify-between"
        >
          <span className="text-lg text-gray-700 font-medium group-hover:text-gray-900">{option.text}</span>
          <span className="h-6 w-6 rounded-full border-2 border-gray-300 group-hover:border-fyfit-orange group-hover:bg-fyfit-orange transition-all flex items-center justify-center">
             <svg className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
          </span>
        </button>
      ))}
    </div>
  </div>
);

// --- Screen Components ---

const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="text-center animate-fade-in py-4">
    <div className="inline-block p-3 bg-orange-100 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-fyfit-orange">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Gratis Nekpijn Check</h1>
    <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
        Ervaart u nekklachten? Doe de professionele zelftest van <strong>Fy Fit</strong>.
        <br className="hidden md:block"/> Binnen 2 minuten inzicht in de ernst van uw klachten.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
        {[
            { label: 'Direct uitslag', icon: '⚡' },
            { label: 'Gratis advies', icon: '💎' },
            { label: 'Fysio expertise', icon: '👨‍⚕️' }
        ].map((item) => (
            <div key={item.label} className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-gray-700">{item.label}</span>
            </div>
        ))}
    </div>

    <button 
        onClick={onStart} 
        className="bg-fyfit-orange text-white font-bold py-4 px-10 rounded-xl text-lg hover:bg-fyfit-dark transform hover:-translate-y-0.5 transition-all shadow-lg shadow-orange-200 flex items-center justify-center mx-auto"
    >
      Start de test <ArrowRightIcon />
    </button>
    <p className="text-xs text-gray-400 mt-4">100% vrijblijvend & anoniem te starten</p>
  </div>
);

const QuestionScreen: React.FC<{ 
    answers: Answers;
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
    onComplete: () => void;
}> = ({ answers, setAnswers, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentQuestion = QUESTIONS[currentIndex];

    const handleNext = useCallback(() => {
        if (currentIndex < QUESTIONS.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    }, [currentIndex, onComplete]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const handleSliderChange = (id: string, value: number) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleOptionSelect = (id: string, value: number) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        setTimeout(() => {
            handleNext();
        }, 250);
    };
    
    return (
        <div className="w-full max-w-xl mx-auto">
            <ProgressBar current={currentIndex + 1} total={QUESTIONS.length} />
            
            <div key={currentQuestion.id} className="min-h-[400px] flex flex-col justify-between">
                {/* Input Area */}
                <div>
                    {currentQuestion.type === 'slider' ? (
                        <SliderInput 
                            question={currentQuestion} 
                            value={answers[currentQuestion.id] || 0}
                            onChange={handleSliderChange}
                        />
                    ) : (
                        <MultipleChoiceInput
                            question={currentQuestion}
                            onSelect={handleOptionSelect}
                        />
                    )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="mt-8 flex flex-col gap-4 animate-fade-in">
                     {currentQuestion.type === 'slider' && (
                        <button onClick={handleNext} className="w-full bg-gray-900 text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-gray-800 transition-all flex justify-center items-center shadow-md">
                            {currentIndex < QUESTIONS.length - 1 ? 'Volgende vraag' : 'Bekijk resultaat'}
                            <ArrowRightIcon />
                        </button>
                    )}

                    {currentIndex > 0 && (
                        <button 
                            onClick={handlePrevious} 
                            className="mx-auto text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center py-2 px-4 rounded-lg hover:bg-gray-50 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Vorige vraag
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const LeadCaptureScreen: React.FC<{ onSubmit: (name: string, email: string, phone: string, consent: boolean) => void }> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !consent) {
            setError('Vul alstublieft uw naam, e-mailadres in en geef toestemming.');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('Voer een geldig e-mailadres in.');
            return;
        }
        setError('');
        onSubmit(name, email, phone, consent);
    };

    return (
        <div className="animate-slide-up max-w-lg mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                    <CheckIcon />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Test afgerond!</h2>
                <p className="text-gray-600">Vul uw gegevens in om uw persoonlijke score, classificatie en advies direct te bekijken.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fyfit-orange focus:border-fyfit-orange focus:outline-none transition-shadow" placeholder="Bijv. Jan Jansen" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fyfit-orange focus:border-fyfit-orange focus:outline-none transition-shadow" placeholder="naam@voorbeeld.nl" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer (optioneel)</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fyfit-orange focus:border-fyfit-orange focus:outline-none transition-shadow" placeholder="06 12345678" />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start space-x-3">
                    <div className="mt-0.5">
                        <input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-fyfit-orange focus:ring-fyfit-orange cursor-pointer"/>
                    </div>
                    <label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer leading-snug">
                        Ik ontvang graag mijn uitslag en ga ermee akkoord dat Fy Fit contact kan opnemen voor een vrijblijvende toelichting.
                    </label>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}
                
                <button type="submit" className="w-full bg-fyfit-orange text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-fyfit-dark transition-all shadow-lg shadow-orange-200 flex justify-center items-center">
                    Toon mijn uitslag
                </button>
                
                <div className="flex justify-center items-center text-gray-400 text-xs mt-4">
                    <LockIcon />
                    <span className="ml-1">Uw gegevens worden veilig verwerkt</span>
                </div>
            </form>
        </div>
    );
};

const ScoreGauge: React.FC<{ score: number; max: number }> = ({ score, max }) => {
    const percentage = Math.min(100, Math.max(0, (score / max) * 100));
    
    return (
        <div className="relative h-6 bg-gray-200 rounded-full w-full mb-6 overflow-hidden">
             {/* Gradient Background */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 opacity-50"></div>
            
            {/* Marker */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg border-x border-gray-400 transform -translate-x-1/2 transition-all duration-1000 ease-out z-10"
                style={{ left: `${percentage}%` }}
            ></div>
             <div 
                className="absolute top-0 bottom-0 w-3 h-3 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 mt-[12px] transition-all duration-1000 ease-out z-20"
                style={{ left: `${percentage}%` }}
            ></div>
        </div>
    );
}


const ResultScreen: React.FC<{ 
    answers: Answers, 
    userInfo: { name: string, email: string, phone: string, consent: boolean },
    onReset: () => void 
}> = ({ answers, userInfo, onReset }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<React.ReactNode | null>(null);
    
    const score = useMemo(() => {
        return Object.entries(answers).reduce((sum, [questionId, val]) => {
            const question = QUESTIONS.find(q => q.id === questionId);
            if (question && (question.scored === undefined || question.scored)) {
                return sum + (val as number);
            }
            return sum;
        }, 0);
    }, [answers]);

    const classification: Classification = useMemo(() => {
        for (const [level, range] of Object.entries(CLASSIFICATION_THRESHOLDS)) {
            if (score >= range.min && score <= range.max) {
                return CLASSIFICATION_DETAILS[level as ClassificationLevel];
            }
        }
        return CLASSIFICATION_DETAILS['Licht'];
    }, [score]);

     const detailedAnswers = useMemo(() => {
      return Object.entries(answers).map(([id, value]) => {
          const question = QUESTIONS.find(q => q.id === id);
          if (!question) {
              return { question: `Onbekende Vraag (${id})`, answerValue: value, answerText: String(value) };
          }
          let answerText = String(value);
          if (question.type === 'multiple-choice') {
              const option = question.options?.find(o => o.value === value);
              answerText = option ? option.text : 'N/A';
          }
          return { question: question.text, answerValue: value, answerText: answerText };
      });
  }, [answers]);

    const handleResultsSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        // Construct a professional, plain-text email report
        const subject = `NIEUW: ${classification.level.toUpperCase()} nekklachten - ${userInfo.name}`;
        
        // Clean, modern plain text layout
        const formattedBody = `
NIEUWE AANVRAAG VIA NEKPIJN CHECK
--------------------------------------------------

CLIËNT GEGEVENS
Naam:      ${userInfo.name}
Email:     ${userInfo.email}
Telefoon:  ${userInfo.phone || '-'}

RESULTAAT
Score:     ${score} / ${MAX_SCORE}
Niveau:    ${classification.level.toUpperCase()}
Advies:    ${classification.urgency}

--------------------------------------------------
GEDETAILLEERDE ANTWOORDEN
--------------------------------------------------
${detailedAnswers.map((a, i) => `
${i + 1}. ${a.question}
   » ${a.answerText}
`).join('')}
--------------------------------------------------
`;

        // We specifically do NOT include the raw 'answers' array in the payload root 
        // to prevent automation tools from dumping the raw JSON at the top of the email.
        // We only send the contact info (for routing) and the formatted report.
        const payload = {
            contact: { naam: userInfo.name, email: userInfo.email, telefoon: userInfo.phone },
            classification: classification.level,
            total: score,
            report: formattedBody 
        };

        const webhookUrl = 'https://hooks.zapier.com/hooks/catch/18311438/u8sozuy/';

        if (!webhookUrl) {
            const mailtoLink = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedBody)}`;
            setSubmitError(<>Het automatisch doorsturen is momenteel niet ingesteld. <br /><a href={mailtoLink} target="_blank" rel="noopener noreferrer" className="font-bold text-fyfit-orange underline">Klik hier om handmatig te mailen.</a></>);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Webhook submission failed');
            setIsSubmitted(true);
        } catch (error) {
            console.error('Submission error:', error);
             // Fallback to mailto with the pretty body
             const mailtoLink = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedBody)}`;
             setSubmitError(<>Er ging iets mis met het automatisch versturen. <a href={mailtoLink} className="underline font-bold">Klik hier om de resultaten alsnog per mail te sturen.</a></>);
        } finally {
            setIsSubmitting(false);
        }
    }, [userInfo, answers, score, classification, detailedAnswers]);

    // Colors based on classification
    const colors = {
        'Licht': 'bg-green-50 text-green-800 border-green-200',
        'Matig': 'bg-yellow-50 text-yellow-800 border-yellow-200',
        'Ernstig': 'bg-orange-50 text-orange-800 border-orange-200',
        'Zeer ernstig': 'bg-red-50 text-red-800 border-red-200',
    }[classification.level];

    if (isSubmitted) {
        return (
            <div className="text-center animate-fade-in py-8">
                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Bedankt, {userInfo.name}!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Je resultaten zijn veilig ontvangen. Een van onze specialisten bekijkt je situatie en neemt spoedig contact op.</p>
                
                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-lg mb-8 max-w-md mx-auto">
                    <p className="text-sm text-gray-500 mb-2">Geen tijd om te wachten?</p>
                    <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="block w-full bg-fyfit-orange text-white font-bold py-3 px-6 rounded-lg hover:bg-fyfit-dark transition-colors">
                        Plan direct zelf een afspraak
                    </a>
                </div>
                
                <button onClick={onReset} className="text-sm text-gray-400 hover:text-gray-600 underline">
                    Terug naar begin
                </button>
            </div>
        );
    }
    
    return (
        <div className="text-center animate-fade-in">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Jouw Nekpijn Profiel</h2>
            <h3 className={`text-4xl font-bold mb-8 ${colors.includes('red') ? 'text-red-600' : colors.includes('orange') ? 'text-orange-600' : 'text-gray-800'}`}>
                {classification.level}
            </h3>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto mb-8">
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Gezond</span>
                        <span>Zeer Ernstig</span>
                    </div>
                    <ScoreGauge score={score} max={MAX_SCORE} />
                    <p className="text-gray-500 font-medium">Score: <span className="text-gray-900 font-bold">{score}</span> / {MAX_SCORE}</p>
                </div>

                <p className="text-gray-700 text-lg mb-6 leading-relaxed">{classification.description}</p>
                
                <div className={`p-5 rounded-xl border text-left flex items-start space-x-3 ${colors}`}>
                    <div className="mt-1 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                         <p className="font-bold mb-1">Advies van Fy Fit:</p>
                         <p>{classification.urgency}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto">
                <button onClick={handleResultsSubmit} disabled={isSubmitting} className="w-full bg-gray-900 text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-gray-800 transition-all shadow-lg flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verwerken...
                        </>
                    ) : 'Verstuur naar specialist'}
                </button>
                {submitError && <div className="text-red-500 text-sm mt-4 bg-red-50 p-3 rounded-lg">{submitError}</div>}
                
                <div className="mt-6">
                    <button onClick={onReset} className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors">
                        Test opnieuw starten
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
    const [step, setStep] = usePersistentState<AppStep>('fyfit_step', 'intro');
    
    const initialAnswers = QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: 0 }), {});
    const [answers, setAnswers] = usePersistentState<Answers>('fyfit_answers', initialAnswers);
    
    const [userInfo, setUserInfo] = usePersistentState('fyfit_userinfo', { name: '', email: '', phone: '', consent: false });

    const handleLeadSubmit = (name: string, email: string, phone: string, consent: boolean) => {
        setUserInfo({ name, email, phone, consent });
        setStep('results');
    };

    const handleReset = () => {
        setAnswers(initialAnswers);
        setUserInfo({ name: '', email: '', phone: '', consent: false });
        setStep('intro');
        window.scrollTo(0,0);
    };
    
    const renderStep = () => {
        switch (step) {
            case 'intro':
                return <IntroScreen onStart={() => setStep('questions')} />;
            case 'questions':
                return <QuestionScreen answers={answers} setAnswers={setAnswers} onComplete={() => setStep('lead-capture')} />;
            case 'lead-capture':
                return <LeadCaptureScreen onSubmit={handleLeadSubmit} />;
            case 'results':
                return <ResultScreen answers={answers} userInfo={userInfo} onReset={handleReset} />;
            default:
                return <IntroScreen onStart={() => setStep('questions')} />;
        }
    };

    return (
        <main className="min-h-screen flex flex-col font-sans bg-bg-soft text-slate-800">
             <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6">
                 <div className="w-full max-w-2xl mx-auto">
                    <Header />
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-6 sm:p-10 md:p-12 border border-white relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-orange-50 rounded-full opacity-50 pointer-events-none filter blur-3xl"></div>
                        <div className="relative z-10">
                             {renderStep()}
                        </div>
                    </div>
                    <footer className="text-center mt-8 text-gray-400 text-xs">
                        <p>&copy; {new Date().getFullYear()} Fy Fit Fysiotherapie Nijmegen • <a href="#" className="hover:text-fyfit-orange">Privacy</a></p>
                    </footer>
                 </div>
             </div>
        </main>
    );
}
