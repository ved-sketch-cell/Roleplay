import {useFlowState} from '../mobile/FlowState';
import {ArrowLeft,ArrowRight,Check,Compass,LockKeyhole,Sparkles} from 'lucide-react';
import '../mobile/questionnaire.css';
import {useEffect,useRef} from 'react';

interface PersonalityQuizProps {
  onBack: () => void;
  onComplete: (personality: PersonalityResult) => void;
}

export interface PersonalityResult {
  type: string;
  traits: {
    introvert: number; // 0-100
    intuitive: number; // 0-100
    thinking: number; // 0-100
    judging: number; // 0-100
  };
  communicationStyle: 'direct' | 'empathetic' | 'analytical' | 'casual';
  energyLevel: 'high' | 'medium' | 'low';
  interactionPreference: 'one-on-one' | 'small-group' | 'large-group' | 'flexible';
}

const questions = [
  {
    id: 1,
    question: 'How do you prefer to recharge after a long day?',
    options: [
      { text: 'Alone time with a book or hobby', score: { introvert: 20 } },
      { text: 'Hanging out with a few close friends', score: { introvert: 10 } },
      { text: 'Going out to social events', score: { introvert: -10 } },
      { text: 'Large gatherings and parties', score: { introvert: -20 } }
    ]
  },
  {
    id: 2,
    question: 'When making decisions, what matters most to you?',
    options: [
      { text: 'Logic and facts', score: { thinking: 20 } },
      { text: 'How it affects others', score: { thinking: -20 } },
      { text: 'Both logic and emotions equally', score: { thinking: 0 } },
      { text: 'My gut feeling', score: { intuitive: 15 } }
    ]
  },
  {
    id: 3,
    question: 'How do you approach planning?',
    options: [
      { text: 'Detailed plans well in advance', score: { judging: 20 } },
      { text: 'Basic outline, flexible execution', score: { judging: 5 } },
      { text: 'Spontaneous, go with the flow', score: { judging: -15 } },
      { text: 'Last-minute rush works best for me', score: { judging: -20 } }
    ]
  },
  {
    id: 4,
    question: 'In conversations, you tend to:',
    options: [
      { text: 'Listen more, speak when necessary', score: { introvert: 15 } },
      { text: 'Balance between listening and sharing', score: { introvert: 0 } },
      { text: 'Share stories and experiences actively', score: { introvert: -10 } },
      { text: 'Lead the conversation enthusiastically', score: { introvert: -20 } }
    ]
  },
  {
    id: 5,
    question: 'When learning something new, you prefer:',
    options: [
      { text: 'Understanding the big picture first', score: { intuitive: 20 } },
      { text: 'Step-by-step detailed instructions', score: { intuitive: -15 } },
      { text: 'Hands-on experimentation', score: { intuitive: 10 } },
      { text: 'Theoretical concepts and models', score: { thinking: 15 } }
    ]
  },
  {
    id: 6,
    question: 'Your communication style is:',
    options: [
      { text: 'Direct and to the point', score: { thinking: 15, communicationStyle: 'direct' } },
      { text: 'Warm and considerate', score: { thinking: -15, communicationStyle: 'empathetic' } },
      { text: 'Detailed and analytical', score: { thinking: 10, communicationStyle: 'analytical' } },
      { text: 'Relaxed and friendly', score: { communicationStyle: 'casual' } }
    ]
  },
  {
    id: 7,
    question: 'Your energy levels throughout the day:',
    options: [
      { text: 'Always high, ready for anything', score: { energyLevel: 'high' } },
      { text: 'Steady and consistent', score: { energyLevel: 'medium' } },
      { text: 'Prefer calm and relaxed pace', score: { energyLevel: 'low' } },
      { text: 'Varies based on interest', score: { energyLevel: 'medium' } }
    ]
  },
  {
    id: 8,
    question: 'Ideal group size for meaningful conversations:',
    options: [
      { text: 'One-on-one conversations', score: { interactionPreference: 'one-on-one', introvert: 15 } },
      { text: 'Small group of 3-5 people', score: { interactionPreference: 'small-group' } },
      { text: 'Larger groups of 6-10 people', score: { interactionPreference: 'large-group', introvert: -10 } },
      { text: 'Any size works for me', score: { interactionPreference: 'flexible' } }
    ]
  },
  {
    id: 9,
    question: 'When facing a problem, you:',
    options: [
      { text: 'Analyze all possible solutions', score: { thinking: 20, intuitive: -10 } },
      { text: 'Trust your instincts', score: { intuitive: 20, thinking: -10 } },
      { text: 'Seek advice from others', score: { thinking: -5, introvert: -10 } },
      { text: 'Try different approaches until something works', score: { judging: -15 } }
    ]
  },
  {
    id: 10,
    question: 'In a group project, you naturally:',
    options: [
      { text: 'Take the lead and organize', score: { judging: 15, introvert: -10 } },
      { text: 'Support and help where needed', score: { thinking: -15 } },
      { text: 'Focus on creative ideas', score: { intuitive: 20 } },
      { text: 'Work independently on tasks', score: { introvert: 20 } }
    ]
  }
];

export function PersonalityQuiz({ onBack, onComplete }: PersonalityQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useFlowState('PersonalityQuiz.currentQuestion',0);
  const [answers, setAnswers] = useFlowState<number[]>('PersonalityQuiz.answers',[]);
  const [selectedOption, setSelectedOption] = useFlowState<number | null>('PersonalityQuiz.selectedOption',null);

  const questionIndex=Number.isInteger(currentQuestion)&&currentQuestion>=0&&currentQuestion<questions.length?currentQuestion:0;
  const question=questions[questionIndex];
  const body=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null);
  const choices=useRef<(HTMLButtonElement|null)[]>([]);
  useEffect(()=>{body.current?.scrollTo({top:0});heading.current?.focus({preventScroll:true});},[questionIndex]);
  const chooseAnswer=(index:number)=>{setSelectedOption(index);const next=[...answers];next[questionIndex]=index;setAnswers(next);};
  const hasSelection=selectedOption!==null&&selectedOption>=0&&selectedOption<question.options.length;
  const progress = ((questionIndex + 1) / questions.length) * 100;

  const handleAnswer = (skip=false) => {
    if (!skip&&!hasSelection) return;
    const newAnswers=[...answers];newAnswers[questionIndex]=skip?-1:selectedOption!;
    setAnswers(newAnswers);

    if (questionIndex < questions.length - 1) {
      setCurrentQuestion(questionIndex + 1);
      setSelectedOption(answers[questionIndex+1]??null);
    } else {
      // Calculate personality
      calculatePersonality(newAnswers);
    }
  };

  const calculatePersonality = (finalAnswers: number[]) => {
    const traits = {
      introvert: 50,
      intuitive: 50,
      thinking: 50,
      judging: 50
    };

    let communicationStyle: any = 'casual';
    let energyLevel: any = 'medium';
    let interactionPreference: any = 'flexible';

    finalAnswers.forEach((answerIndex, questionIndex) => {
      const answer = questions[questionIndex]?.options[answerIndex];
      if(!answer)return;
      const score = answer.score as any;

      if (score.introvert !== undefined) traits.introvert += score.introvert;
      if (score.intuitive !== undefined) traits.intuitive += score.intuitive;
      if (score.thinking !== undefined) traits.thinking += score.thinking;
      if (score.judging !== undefined) traits.judging += score.judging;
      if (score.communicationStyle) communicationStyle = score.communicationStyle;
      if (score.energyLevel) energyLevel = score.energyLevel;
      if (score.interactionPreference) interactionPreference = score.interactionPreference;
    });

    // Clamp values between 0 and 100
    traits.introvert = Math.max(0, Math.min(100, traits.introvert));
    traits.intuitive = Math.max(0, Math.min(100, traits.intuitive));
    traits.thinking = Math.max(0, Math.min(100, traits.thinking));
    traits.judging = Math.max(0, Math.min(100, traits.judging));

    // Determine personality type
    const type = 
      (traits.introvert > 50 ? 'I' : 'E') +
      (traits.intuitive > 50 ? 'N' : 'S') +
      (traits.thinking > 50 ? 'T' : 'F') +
      (traits.judging > 50 ? 'J' : 'P');

    const result: PersonalityResult = {
      type:finalAnswers.some(i=>i>=0)?type:'Explorer',
      traits,
      communicationStyle,
      energyLevel,
      interactionPreference
    };

    onComplete(result);
  };

  const previous=()=>{if(questionIndex>0){setCurrentQuestion(questionIndex-1);setSelectedOption(answers[questionIndex-1]??null);}else onBack();};
  const skipAll=()=>onComplete({type:'Explorer',traits:{introvert:50,intuitive:50,thinking:50,judging:50},communicationStyle:'casual',energyLevel:'medium',interactionPreference:'flexible'});
  return <div className="conversation-questionnaire">
    <header className="questionnaire-header"><button className="mobile-icon-button" onClick={previous} aria-label={questionIndex?'Previous question':'Back to interests'}><ArrowLeft size={21}/></button><div><p className="mobile-eyebrow">FIND YOUR PEOPLE</p><h1 tabIndex={-1}>Your conversation style.</h1><p>10 optional questions · about 2 minutes</p></div><span className="questionnaire-header-icon" aria-hidden="true"><Compass size={23}/></span></header>
    <div className="questionnaire-progress"><div><span>Question {questionIndex+1} of {questions.length}</span><span>{questionIndex===questions.length-1?'Last one!':'Your pace. Your preferences.'}</span></div><div className="questionnaire-progress-track" role="progressbar" aria-label="Question progress" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={questionIndex+1} aria-valuetext={`Question ${questionIndex+1} of ${questions.length}`}><span style={{width:progress+'%'}}/></div></div>
    <div className="questionnaire-body" ref={body}>
      <div className="questionnaire-question"><span className="questionnaire-question-icon" aria-hidden="true"><Sparkles size={22}/></span><p className="mobile-eyebrow">A LITTLE MORE ABOUT YOU</p><h2 ref={heading} tabIndex={-1} id="preference-question">{question.question}</h2><p id="preference-hint">Choose what fits today. There are no right answers.</p></div>
      <div className="questionnaire-options" role="radiogroup" aria-labelledby="preference-question" aria-describedby="preference-hint">{question.options.map((option,index)=><button key={index} ref={el=>{choices.current[index]=el;}} type="button" role="radio" aria-label={option.text} aria-checked={hasSelection&&selectedOption===index} tabIndex={hasSelection?(selectedOption===index?0:-1):index===0?0:-1} onClick={()=>chooseAnswer(index)} onKeyDown={e=>{if(!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?question.options.length-1:(index+(['ArrowDown','ArrowRight'].includes(e.key)?1:question.options.length-1))%question.options.length;chooseAnswer(next);choices.current[next]?.focus();}}><span className="questionnaire-radio" aria-hidden="true">{hasSelection&&selectedOption===index?<Check size={15}/>:String.fromCharCode(65+index)}</span><span>{option.text}</span></button>)}</div>
      <p className="questionnaire-selection" role="status">{hasSelection?'Answer selected. Continue when you’re ready.':'Choose an answer or skip this question.'}</p>
      <p className="questionnaire-privacy"><LockKeyhole size={15}/>Preferences stay on this device. The next screen shows fictional sample matches. This isn’t a personality assessment.</p>
      <button className="questionnaire-skip-all" onClick={skipAll}>Skip & explore sample matches</button>
    </div>
    <footer className="questionnaire-footer"><div className="questionnaire-footer-actions"><button className="questionnaire-skip" onClick={()=>handleAnswer(true)}>Skip question</button><button className="questionnaire-next" onClick={()=>handleAnswer()} disabled={!hasSelection}><span>{questionIndex<questions.length-1?'Next Question':'See my matches'}</span><ArrowRight size={19}/></button></div><small>{questionIndex<questions.length-1?`${questions.length-questionIndex-1} questions after this · answers save as you go`:'You can change your preferences later'}</small></footer>
  </div>;
}
