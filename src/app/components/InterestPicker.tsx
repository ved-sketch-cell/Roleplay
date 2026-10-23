import { useState } from 'react';
import { useDeviceState } from '../mobile/state';
import { Check, ArrowRight, Search, Sparkles, Shapes, X } from 'lucide-react';
import { interestCategories } from './InterestCategories';
import { accentStyle } from '../mobile/visuals';

interface InterestPickerProps {
  onChangeCategory: (interests: string[]) => void;
  categoryId: string;
  onComplete: (interests: string[]) => void;
  initialInterests?: string[];
  editing?: boolean;
}

export function InterestPicker({ onChangeCategory, categoryId, onComplete, initialInterests = [], editing = false }: InterestPickerProps) {
  const category = interestCategories.find(c => c.id === categoryId) || interestCategories[0];
  const [selected, setSelected] = useDeviceState('interest-selection:' + categoryId, initialInterests.filter(i => category.subInterests.includes(i)));
  const [query, setQuery] = useState('');
  const chosen = selected.filter(i => category.subInterests.includes(i));
  const allSelected = Array.from(new Set([...initialInterests.filter(i => !category.subInterests.includes(i)), ...chosen]));
  const visible = category.subInterests.filter(i => i.toLowerCase().includes(query.trim().toLowerCase()));
  const toggle = (interest: string) => setSelected(previous => previous.includes(interest) ? previous.filter(i => i !== interest) : [...previous, interest]);

  return <section className="mobile-interest-picker mobile-flow-page" aria-label="Choose interests">
    <div className="interest-picker-body">
      <div className="interest-picker-intro">
        <span className="interest-category-art" aria-hidden="true" style={{ background: `radial-gradient(circle at 25% 20%, ${category.color}80, #8169ec33 55%, #24222f)` }}>{category.icon}<Sparkles size={19}/></span>
        <span className="mobile-eyebrow">{editing ? 'YOUR INTERESTS' : 'FIND YOUR PEOPLE'}</span>
        <h1>{editing ? 'Make it feel like you.' : 'What sparks your curiosity?'}</h1>
        <p>Pick a few favourites. You can change them anytime.</p>
      </div>
      <div className="interest-category-heading"><div><h2>{category.name}</h2><small>{category.subInterests.length} interests to explore</small></div><button className="mobile-text-button" onClick={() => onChangeCategory(allSelected)}><Shapes size={17}/>Change category</button></div>
      <label className="mobile-search"><Search size={19}/><input aria-label="Search this category" type="search" placeholder="Find your favourites" value={query} onChange={event => setQuery(event.target.value)}/>{query && <button className="mobile-icon-button" aria-label="Clear interest search" onClick={() => setQuery('')}><X size={18}/></button>}</label>
      {chosen.length > 0 && <div className="interest-selected-summary"><span><Check size={15}/>{chosen.length} chosen in {category.name}</span><button className="mobile-text-button" onClick={() => setSelected([])}>Clear selection</button></div>}
      <div className="mobile-interest-grid" aria-label={category.name + ' interests'}>{visible.map(interest => {
        const index = category.subInterests.indexOf(interest);
        const checked = chosen.includes(interest);
        return <button style={accentStyle(['purple', 'cyan', 'pink', 'amber', 'lime', 'blue'][index % 6])} key={interest} aria-pressed={checked} onClick={() => toggle(interest)}><span className="interest-choice-dot" aria-hidden="true">{checked ? <Check size={16}/> : <Sparkles size={15}/>}</span><span>{interest}</span></button>;
      })}</div>
      {visible.length === 0 && <div className="mobile-empty" role="status"><Search size={25}/><strong>No interests found</strong><p>Try a different word.</p><button className="mobile-secondary-button" onClick={() => setQuery('')}>Show all interests</button></div>}
      <p className="interest-picker-note">{editing ? 'Your choices help shape your profile.' : 'Next, choose how you like to chat.'}</p>
    </div>
    <footer className="mobile-flow-footer interest-picker-footer">
      <div role="status" aria-live="polite"><strong>{allSelected.length} {allSelected.length === 1 ? 'interest' : 'interests'} selected</strong><small>{editing ? 'Save to your profile' : allSelected.length ? 'Next: conversation preferences' : 'Choose an interest to continue'}</small></div>
      <button className="mobile-primary-button" disabled={allSelected.length === 0} onClick={() => onComplete(allSelected)}>{editing ? 'Save interests' : 'Continue'}<ArrowRight size={18}/></button>
    </footer>
  </section>;
}
