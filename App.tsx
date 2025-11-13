
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Answers, AppStep, Classification, ClassificationLevel, Question } from './types';
import { QUESTIONS, CLASSIFICATION_THRESHOLDS, CLASSIFICATION_DETAILS, APPOINTMENT_URL, FALLBACK_EMAIL } from './constants';

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


// --- UI Components ---

interface ProgressBarProps {
  current: number;
  total: number;
}
const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.max(0, (current / total) * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 my-6">
      <div
        className="bg-fyfit-orange h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
      <p className="text-sm text-gray-500 text-center mt-2">Vraag {current} van {total}</p>
    </div>
  );
};

const HappyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9v-.008zm6 0h.008v.008H15v-.008z" />
    </svg>
);

const SadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 9.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 14.25h.008v.008H9v-.008zm6 0h.008v.008H15v-.008z" />
    </svg>
);

interface SliderInputProps {
  question: Question;
  value: number;
  onChange: (id: string, value: number) => void;
}
const SliderInput: React.FC<SliderInputProps> = ({ question, value, onChange }) => {
  return (
    <div className="w-full my-8 text-center">
      <label htmlFor={question.id} className="block text-lg md:text-xl font-medium text-gray-800 mb-4">{question.text}</label>
      <input
        id={question.id}
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(question.id, parseInt(e.target.value, 10))}
        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg accent-fyfit-orange"
      />
      <div className="flex justify-between items-center text-gray-600 mt-4 px-1">
        <div className="flex flex-col items-center space-y-1 w-24 text-center">
            <HappyIcon className="h-8 w-8 text-green-500" />
            <span className="text-xs">Geen hinder</span>
        </div>
        <span className="font-bold text-fyfit-orange text-3xl">{value}</span>
        <div className="flex flex-col items-center space-y-1 w-24 text-center">
            <SadIcon className="h-8 w-8 text-red-500" />
            <span className="text-xs">Maximale hinder</span>
        </div>
      </div>
    </div>
  );
};

// --- Screen Components ---

const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="text-center">
    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Gratis Online Nekpijn Test</h1>
    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Beantwoord 7 korte vragen en ontvang direct een indicatie van uw nekklachten. De test duurt slechts 2 minuten.</p>
    <button onClick={onStart} className="bg-fyfit-orange text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity shadow-lg">
      Start de test
    </button>
  </div>
);

const QuestionScreen: React.FC<{ 
    answers: Answers;
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
    onComplete: () => void;
}> = ({ answers, setAnswers, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentQuestion = QUESTIONS[currentIndex];

    const handleAnswerChange = (id: string, value: number) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleNext = () => {
        if (currentIndex < QUESTIONS.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };
    
    return (
        <div className="w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-6">Nekpijn Test</h2>
            <ProgressBar current={currentIndex + 1} total={QUESTIONS.length} />
            <SliderInput 
                question={currentQuestion} 
                value={answers[currentQuestion.id] || 0}
                onChange={handleAnswerChange}
            />
            <div className="mt-10 text-center">
                <button onClick={handleNext} className="bg-fyfit-orange text-white font-bold py-3 px-12 rounded-lg text-lg hover:opacity-90 transition-opacity shadow-lg">
                    {currentIndex < QUESTIONS.length - 1 ? 'Volgende' : 'Bekijk mijn resultaat'}
                </button>
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
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bijna klaar!</h2>
            <p className="text-gray-600 mb-6">Voer uw gegevens in om uw persoonlijke score en advies te ontvangen.</p>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <input type="text" placeholder="Naam *" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fyfit-orange focus:outline-none"/>
                <input type="email" placeholder="E-mailadres *" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fyfit-orange focus:outline-none"/>
                <input type="tel" placeholder="Telefoonnummer (optioneel)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fyfit-orange focus:outline-none"/>
                <div className="flex items-start space-x-3 text-left">
                    <input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="h-5 w-5 mt-1 rounded border-gray-300 text-fyfit-orange focus:ring-fyfit-orange"/>
                    <label htmlFor="consent" className="text-sm text-gray-600">Ik geef toestemming dat mijn testresultaat wordt bekeken door een fysiotherapeut voor een gratis en vrijblijvend advies.</label>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-fyfit-orange text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity shadow-lg">
                    Toon mijn uitslag
                </button>
            </form>
        </div>
    );
};

const ResultScreen: React.FC<{ answers: Answers, userInfo: { name: string, email: string, phone: string, consent: boolean } }> = ({ answers, userInfo }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    
    // FIX: Explicitly define the type for the reduce accumulator `sum` as `number`.
    // TypeScript was incorrectly inferring `sum` as `unknown`, causing a type error during the addition.
    const score = useMemo(() => Object.values(answers).reduce((sum: number, val) => sum + (val as number), 0), [answers]);

    const classification: Classification = useMemo(() => {
        for (const [level, range] of Object.entries(CLASSIFICATION_THRESHOLDS)) {
            if (score >= range.min && score <= range.max) {
                return CLASSIFICATION_DETAILS[level as ClassificationLevel];
            }
        }
        return CLASSIFICATION_DETAILS['Licht'];
    }, [score]);

    const handleResultsSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        const payload = {
            source: "fyfit-nekpijn-webapp",
            timestamp: new Date().toISOString(),
            contact: { naam: userInfo.name, email: userInfo.email, telefoon: userInfo.phone },
            answers: answers,
            total: score,
            classification: classification.level,
        };

        const webhookUrl = process.env.WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("WEBHOOK_URL is not configured. Cannot submit results automatically.");
            setSubmitError(`Het automatisch doorsturen is momenteel niet beschikbaar. U kunt contact opnemen via ${FALLBACK_EMAIL}.`);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Webhook submission failed');
            console.log('GA Event: Nekpijn test voltooid');
            setIsSubmitted(true);
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitError('Er is iets misgegaan bij het versturen. Probeer het later opnieuw of neem direct contact op.');
        } finally {
            setIsSubmitting(false);
        }
    }, [userInfo, answers, score, classification]);

    const scoreColorClass = score > 40 ? 'text-red-600' : score > 20 ? 'text-yellow-600' : 'text-green-600';

    if (isSubmitted) {
        return (
            <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
                <h2 className="text-3xl font-bold text-green-800 mb-2">Bedankt!</h2>
                <p className="text-green-700 mb-6">Je resultaten zijn succesvol doorgestuurd. Ons team neemt spoedig contact met je op voor een gratis en vrijblijvend adviesgesprek.</p>
                <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="bg-fyfit-orange text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity shadow-lg inline-block">
                    Plan direct een intake
                </a>
            </div>
        );
    }
    
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Uw Resultaat</h2>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto">
                <p className="text-gray-600 text-lg">Uw totale score is:</p>
                <p className={`text-7xl font-bold my-2 ${scoreColorClass}`}>{score}<span className="text-4xl text-gray-400">/70</span></p>
                <p className={`text-2xl font-semibold mb-4 ${scoreColorClass}`}>{classification.level}</p>
                <p className="text-gray-700 text-left mb-4">{classification.description}</p>
                <div className="bg-orange-50 text-orange-800 p-4 rounded-lg text-left font-medium border border-orange-200">
                    <p><strong>Ons advies:</strong> {classification.urgency}</p>
                </div>
            </div>
            <div className="mt-8">
                <button onClick={handleResultsSubmit} disabled={isSubmitting} className="bg-gray-800 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-700 transition-colors shadow-lg disabled:bg-gray-400">
                    {isSubmitting ? 'Bezig met versturen...' : 'Stuur mijn resultaten naar Fy Fit'}
                </button>
                {submitError && <p className="text-red-500 text-sm mt-4">{submitError}</p>}
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
    
    const renderStep = () => {
        switch (step) {
            case 'intro':
                return <IntroScreen onStart={() => setStep('questions')} />;
            case 'questions':
                return <QuestionScreen answers={answers} setAnswers={setAnswers} onComplete={() => setStep('lead-capture')} />;
            case 'lead-capture':
                return <LeadCaptureScreen onSubmit={handleLeadSubmit} />;
            case 'results':
                return <ResultScreen answers={answers} userInfo={userInfo} />;
            default:
                return <IntroScreen onStart={() => setStep('questions')} />;
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
             <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-10 lg:p-12 transition-all duration-300">
                {renderStep()}
             </div>
             <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Fy Fit Fysiotherapie Nijmegen. Alle rechten voorbehouden.</p>
            </footer>
        </main>
    );
}
