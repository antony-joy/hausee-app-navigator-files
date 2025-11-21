import * as React from 'react';

/********************
 * Design tokens (forced light background)
 ********************/
const COLORS = {
  coral: '#EF4D68',
  coralSoft: '#FFF1F3',
  aqua: '#58DBC2',
  charcoal: '#293847',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  surface: '#FFFFFF',
  background: '#FFFFFF', // force light background to avoid dark mode overrides
  error: '#EF4444'
};

function cx(...xs){ return xs.filter(Boolean).join(' '); }

/********************
 * Base UI
 ********************/
function SectionCard({ title, subtitle, children }){
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: COLORS.lightGray }}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>{title}</div>}
          {subtitle && <div className="text-xs mt-0.5" style={{ color: COLORS.gray }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
function FieldLabel({ children }){ return <div className="text-[14px] font-medium" style={{ color: COLORS.charcoal }}>{children}</div>; }
function SubLabel({ children }){ return <div className="text-[11px] mt-0.5" style={{ color: COLORS.gray }}>{children}</div>; }



function TextInput({ value, onChange, placeholder, leftIcon, error }){
  const border = error ? COLORS.error : COLORS.lightGray;
  return (
    <div className="relative mt-2">
      {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }}>{leftIcon}</span>}
      <input aria-invalid={!!error} className={cx('w-full h-12 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2', leftIcon? 'pl-10 pr-3' : 'px-3')} style={{ borderColor: border }} placeholder={placeholder} value={value} onChange={onChange}/>
    </div>
  );
}
function TextArea({ value, onChange, placeholder }){
  return <textarea className="w-full min-h-[96px] p-3 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2" style={{ borderColor: COLORS.lightGray }} placeholder={placeholder} value={value} onChange={onChange}/>;
}


function Chip({ active, children, onClick }){
  return <button type="button" onClick={onClick} className={cx('px-3 h-12 rounded-[16px] border text-sm', active? 'border-[#EF4D68] bg-[#FFF1F3]' : 'border-gray-300 bg-white')} style={{ minHeight:48 }}>{children}</button>;
}
function Tag({ children, onRemove }){
  return (
    <span className="inline-flex items-center gap-2 px-2.5 h-8 rounded-full text-xs border bg-white" style={{ borderColor: COLORS.lightGray }}>
      {children}
      <button type="button" aria-label="Remove" onClick={onRemove} className="rounded-full w-5 h-5 grid place-items-center" style={{ background: '#F3F4F6' }}>×</button>
    </span>
  );
}

/********************
 * Toasts
 ********************/
function useToasts(){
  const [toasts,setToasts]=React.useState([]);
  const push=(text)=>{ const id=Date.now(); setToasts(t=> [...t,{id,text}]); setTimeout(()=> setToasts(t=> t.filter(x=> x.id!==id)), 2500); };
  return { toasts, push };
}

/********************
 * City list (Ontario) for autosuggest
 ********************/
const CITIES = [
  'Ajax','Arnprior','Aurora','Barrie','Belleville','Brampton','Brant','Brantford','Brockville','Burlington','Caledon','Cambridge','Carleton Place','Chatham-Kent','Clarence-Rockland','Collingwood','Cornwall','Dryden','East Gwillimbury','Elliot Lake','Georgina','Gravenhurst','Greater Sudbury','Guelph','Haldimand County','Halton Hills','Hamilton','Hawkesbury','Huntsville','Kawartha Lakes','Kenora','Kingston','Kitchener','Leamington','London','Markham','Midland','Milton','Mississauga','Newmarket','Niagara Falls','Norfolk County','North Bay','Oakville','Orangeville','Orillia','Oshawa','Ottawa','Owen Sound','Parry Sound','Pembroke','Perth','Peterborough','Pickering','Port Colborne','Prince Edward County','Quinte West','Richmond Hill','Sarnia','Sault Ste. Marie','Smiths Falls','St. Catharines','St. Thomas','Stratford','Temiskaming Shores','Thorold','Thunder Bay','Tillsonburg','Timmins','Toronto','Uxbridge','Vaughan','Waterloo','Welland','Whitby','Windsor','Woodstock'
];

/********************
 * Multi-select Autosuggest (chips + dropdown)
 ********************/
function MultiSelectAutosuggest({ value, onChange, placeholder='Type to search cities' }){
  const [input, setInput] = React.useState('');
  const containerRef = React.useRef(null);
  const selected = React.useMemo(() => (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean), [value]);

  const lowerSet = new Set(selected.map(s => s.toLowerCase()));
  const suggestions = React.useMemo(() => {
    const q = input.trim().toLowerCase();
    const pool = CITIES.filter(c => !lowerSet.has(c.toLowerCase()));
    if(!q) return pool.slice(0,8);
    return pool.filter(c => c.toLowerCase().includes(q)).slice(0,8);
  }, [input, value]);

  const commit = (city) => {
    if(!city) return;
    if(lowerSet.has(city.toLowerCase())) return;
    const next = [...selected, city].join(', ');
    onChange({ target: { value: next } });
    setInput('');
  };

  const removeAt = (idx) => {
    const next = selected.filter((_,i)=> i!==idx).join(', ');
    onChange({ target: { value: next } });
  };

  const onKeyDown = (e) => {
    if(e.key==='Enter'){
      e.preventDefault();
      if(suggestions[0]) commit(suggestions[0]);
    } else if(e.key==='Backspace' && input===''){
      if(selected.length){ removeAt(selected.length-1); }
    }
  };

  const [open, setOpen] = React.useState(false);
  React.useEffect(()=>{
    const onDoc = (ev)=>{ if(containerRef.current && !containerRef.current.contains(ev.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return ()=> document.removeEventListener('mousedown', onDoc);
  },[]);

  return (
    <div ref={containerRef} className="mt-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((c,idx)=> <Tag key={c} onRemove={()=> removeAt(idx)}>{c}</Tag>)}
      </div>
      <div className="relative">
        <input
          className="w-full h-12 rounded-xl bg-[#F5F5F5] border px-3 outline-none focus:ring-2"
          style={{ borderColor: COLORS.lightGray }}
          value={input}
          placeholder={placeholder}
          onFocus={()=> setOpen(true)}
          onChange={(e)=> { setInput(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
        />
        {open && suggestions.length>0 && (
          <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-xl border bg-white shadow-sm" style={{ borderColor: COLORS.lightGray }}>
            {suggestions.map(c => (
              <button type="button" key={c} className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB]" onClick={()=> commit(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/********************
 * Single-select Autosuggest
 ********************/
function SingleSelectAutosuggest({ value, onChange, placeholder='Type to search city' }){
  const [input, setInput] = React.useState(value || '');
  const containerRef = React.useRef(null);
  React.useEffect(()=>{ setInput(value || ''); }, [value]);

  const suggestions = React.useMemo(() => {
    const q = (input || '').trim().toLowerCase();
    if(!q) return CITIES.slice(0,8);
    return CITIES.filter(c => c.toLowerCase().includes(q)).slice(0,8);
  }, [input]);

  const commit = (city) => {
    if(!city) return;
    onChange({ target: { value: city } });
    setInput(city);
    setOpen(false);
  };

  const [open, setOpen] = React.useState(false);
  React.useEffect(()=>{
    const onDoc = (ev)=>{ if(containerRef.current && !containerRef.current.contains(ev.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return ()=> document.removeEventListener('mousedown', onDoc);
  },[]);

  const onKeyDown = (e) => {
    if(e.key==='Enter'){
      e.preventDefault();
      if(suggestions[0]) commit(suggestions[0]);
    } else if(e.key==='Escape'){
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="mt-2">
      <div className="relative">
        <input
          className="w-full h-12 rounded-xl bg-[#F5F5F5] border px-3 outline-none focus:ring-2"
          style={{ borderColor: COLORS.lightGray }}
          value={input}
          placeholder={placeholder}
          onFocus={()=> setOpen(true)}
          onChange={(e)=> { setInput(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
        />
        {open && suggestions.length>0 && (
          <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-xl border bg-white shadow-sm" style={{ borderColor: COLORS.lightGray }}>
            {suggestions.map(c => (
              <button type="button" key={c} className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB]" onClick={()=> commit(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/********************
 * Checkbox Chips (multi-select stored as comma-separated string)
 ********************/
function CheckChips({ value, options, onChange }){
  const selected = React.useMemo(()=> (value||'').split(',').map(s=>s.trim()).filter(Boolean), [value]);
  const toggle = (opt)=>{
    const has = selected.includes(opt);
    const next = has ? selected.filter(o=> o!==opt) : [...selected, opt];
    onChange(next.join(', '));
  };
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {options.map(opt=> (
        <button type="button" key={opt} onClick={()=> toggle(opt)} className={cx('px-3 h-12 rounded-[16px] border text-sm', selected.includes(opt)? 'border-[#EF4D68] bg-[#FFF1F3]':'border-gray-300 bg-white')}>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded border" style={{ borderColor: COLORS.lightGray, background: selected.includes(opt)? COLORS.coralSoft: '#fff' }} />
            {opt}
          </span>
        </button>
      ))}
    </div>
  );
}

/********************
 * Tests (console)
 ********************/
function runTests(){
  const gen = (intent)=>{
    const wantsBuyer = intent==='firstBuy' || intent==='nextBuy' || intent==='sellToBuy';
    const wantsSeller = intent==='sellOnly' || intent==='sellToBuy';
    return ['personal','intent', ...(wantsBuyer? ['buyer']:[]), ...(wantsSeller? ['seller']:[]), 'final'];
  };
  console.assert(JSON.stringify(gen('firstBuy')) === JSON.stringify(['personal','intent','buyer','final']), 'Test A failed');
  console.assert(JSON.stringify(gen('sellOnly')) === JSON.stringify(['personal','intent','seller','final']), 'Test B failed');
  console.assert(JSON.stringify(gen('sellToBuy')) === JSON.stringify(['personal','intent','buyer','seller','final']), 'Test C failed');
  console.assert(JSON.stringify(gen('')) === JSON.stringify(['personal','intent','final']), 'Test D failed');

  const first = (q)=> CITIES.filter(c=> c.toLowerCase().includes(q.toLowerCase()))[0];
  console.assert(first('mil')==='Milton', 'City test mil→Milton failed');
  console.assert(first('tor')==='Toronto', 'City test tor→Toronto failed');
  console.assert(first('sau')==='Sault Ste. Marie', 'City test sau→Sault Ste. Marie failed');
  console.assert(CITIES.includes('Milton') && CITIES.includes('Toronto'), 'Cities list missing core items');
}

/********************
 * Confirmation Screen (post-submit) with summary
 ********************/
function ConfirmationScreen({ data, onEdit }){
  const human = (v)=> (v==='' || v===undefined || v===null) ? '—' : String(v);
  const yesNo = (v)=> v ? 'YES' : 'NO';
  const intentLabel = {
    firstBuy:'Buy my first house',
    nextBuy:'Buy another house',
    sellToBuy:'Sell my current house to buy a new house',
    sellOnly:'Sell my current house'
  }[data?.intent] || '—';
  const wantsBuyer = data?.intent==='firstBuy' || data?.intent==='nextBuy' || data?.intent==='sellToBuy';
  const wantsSeller = data?.intent==='sellOnly' || data?.intent==='sellToBuy';

  return (
    <div className="min-h-[100dvh]" style={{ background: COLORS.background }}>
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2 text-green-700">✅ Request Received!</div>
          <p className="text-gray-700">What happens next:</p>
        </div>
        <ol className="text-left list-decimal list-inside text-gray-700 space-y-2 my-4">
          <li>We’ll review your profile within 24–48 hours.</li>
          <li>We’ll match you with up to 3 qualified agents in your area.</li>
          <li>Agents will contact you directly via your preferred method.</li>
        </ol>
        <p className="text-gray-600 mb-6 text-center">You can edit your details anytime before we start matching.</p>

        <div className="space-y-4">
          <SectionCard title="About You">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-gray-500">First Name</dt><dd className="text-gray-900">{human(data?.firstName)}</dd>
              <dt className="text-gray-500">Last Name</dt><dd className="text-gray-900">{human(data?.lastName)}</dd>
              <dt className="text-gray-500">Email</dt><dd className="text-gray-900">{human(data?.email)}</dd>
              <dt className="text-gray-500">Phone</dt><dd className="text-gray-900">{human(data?.phone)}</dd>
              <dt className="text-gray-500">Referral?</dt><dd className="text-gray-900">{human(data?.hasReferral)}</dd>
              {data?.hasReferral==='YES' && (<>
                <dt className="text-gray-500">Referral Code</dt><dd className="text-gray-900">{human(data?.referralCode)}</dd>
              </>)}
            </dl>
          </SectionCard>

          <SectionCard title="Property Intent">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-gray-500">Intent</dt><dd className="text-gray-900">{intentLabel}</dd>
            </dl>
          </SectionCard>

          {wantsBuyer && (
            <SectionCard title="Buyer Details">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <dt className="text-gray-500">Timing</dt><dd className="text-gray-900">{human(data?.buy_when)}</dd>
                <dt className="text-gray-500">Cities</dt><dd className="text-gray-900">{human(data?.buy_cities)}</dd>
                <dt className="text-gray-500">Home Type</dt><dd className="text-gray-900">{human(data?.buy_type)}</dd>
                <dt className="text-gray-500">Budget</dt><dd className="text-gray-900">{human(data?.buy_budget)}</dd>
                <dt className="text-gray-500">Pre-approval</dt><dd className="text-gray-900">{human(data?.buy_pre)}</dd>
                {data?.buy_pre==='YES' && (<>
                  <dt className="text-gray-500">Pre-approved Price</dt><dd className="text-gray-900">{human(data?.buy_pre_price)}</dd>
                </>)}
                <dt className="text-gray-500">Primary Residence</dt><dd className="text-gray-900">{human(data?.buy_primary)}</dd>
              </dl>
            </SectionCard>
          )}

          {wantsSeller && (
            <SectionCard title="Seller Details">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <dt className="text-gray-500">City</dt><dd className="text-gray-900">{human(data?.sell_city)}</dd>
                <dt className="text-gray-500">Address / Intersection</dt><dd className="text-gray-900">{human(data?.sell_address)}</dd>
                <dt className="text-gray-500">Home Type</dt><dd className="text-gray-900">{human(data?.sell_type)}</dd>
                <dt className="text-gray-500">Timing</dt><dd className="text-gray-900">{human(data?.sell_when)}</dd>
                <dt className="text-gray-500">Expected Price</dt><dd className="text-gray-900">{human(data?.sell_price)}</dd>
              </dl>
            </SectionCard>
          )}

          <SectionCard title="General">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-gray-500">Signed with Agent</dt><dd className="text-gray-900">{human(data?.agent_signed)}</dd>
              <dt className="text-gray-500">Consent</dt><dd className="text-gray-900">{human(data?.consent)}</dd>
              <dt className="text-gray-500">Terms Accepted</dt><dd className="text-gray-900">{yesNo(!!data?.terms)}</dd>
              <dt className="text-gray-500">Notes</dt><dd className="text-gray-900">{human(data?.notes)}</dd>
            </dl>
          </SectionCard>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button onClick={onEdit} className="px-6 py-2 rounded-lg text-white" style={{ background: COLORS.coral }}>Edit My Request</button>
        </div>
      </div>
    </div>
  );
}

/********************
 * Select Module (steps + state)
 ********************/
function SelectModule(){
  const {toasts,push}=useToasts();
  React.useEffect(()=>{ runTests(); },[]);

  const load = () => { try { return JSON.parse(localStorage.getItem('select_form')||'{}'); } catch { return {}; } };
  const [form,setForm] = React.useState(()=>({
    firstName:'', lastName:'', email:'', phone:'', hasReferral:'', referralCode:'',
    intent:'',
    buy_when:'', buy_cities:'', buy_type:'', buy_budget:'', buy_pre:'', buy_pre_price:'', buy_primary:'',
    sell_city:'', sell_address:'', sell_type:'', sell_when:'', sell_price:'',
    agent_signed:'', notes:'', consent:'', terms:false,
    ...(load()||{})
  }));

  React.useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem('select_form', JSON.stringify(form)); } catch {}
    }, 350);
    return () => clearTimeout(t);
  }, [form]);

  const [submitted, setSubmitted] = React.useState(false);

  const bind = (key) => ({
    value: String(form[key] ?? ''),
    onChange: (e) => {
      const next = e && e.target ? e.target.value : e;
      setForm(f => ({ ...f, [key]: String(next ?? '') }));
    }
  });

  const labelToIntent = (label) => ({
    'Buy my first house':'firstBuy',
    'Buy another house':'nextBuy',
    'Sell my current house to buy a new house':'sellToBuy',
    'Sell my current house':'sellOnly'
  }[label]||'');
  const intentToLabel = (key) => ({
    firstBuy:'Buy my first house',
    nextBuy:'Buy another house',
    sellToBuy:'Sell my current house to buy a new house',
    sellOnly:'Sell my current house'
  }[key]||'');

  const wantsBuyer = form.intent==='firstBuy' || form.intent==='nextBuy' || form.intent==='sellToBuy';
  const wantsSeller = form.intent==='sellOnly' || form.intent==='sellToBuy';
  const steps = [
    { key:'personal', title:'About You' },
    { key:'intent',   title:'Property Intent' },
    ...(wantsBuyer ? [{ key:'buyer',  title:'Buyer Questions' }] : []),
    ...(wantsSeller ? [{ key:'seller', title:'Seller Questions' }] : []),
    { key:'final',    title:'General & Submit' },
  ];
  const [stepIdx,setStepIdx] = React.useState(0);
  React.useEffect(()=>{ setStepIdx(i => Math.min(i, steps.length-1)); },[form.intent]);
  const cur = steps[stepIdx]?.key;

  const set = (patch)=> setForm(f=> ({...f, ...patch}));
  const RequiredNote = () => <div className="text-[11px] mt-1" style={{color:COLORS.gray}}>Fields marked * are required</div>;
  const ErrorText = ({show, text='This field is required'})=> show? <div className="text-xs mt-1" style={{color:COLORS.error}}>{text}</div> : null;
  const RadioChips = ({value, options, onChange}) => (
    <div className="mt-2 grid grid-cols-2 gap-2">
      {options.map(opt=> (
        <Chip key={opt} active={value===opt} onClick={()=> onChange(value===opt? '' : opt)}>{opt}</Chip>
      ))}
    </div>
  );

  const isEmpty = (v)=> v===undefined || v===null || String(v).trim()==='';
  const validate = ()=>{
    if(cur==='personal'){
      const need = [form.firstName, form.lastName, form.email, form.phone];
      if(need.some(v=> isEmpty(v))) return false;
      if(form.hasReferral==='YES' && isEmpty(form.referralCode)) return false;
      return true;
    }
    if(cur==='intent') return !isEmpty(form.intent);
    if(cur==='buyer')  return [form.buy_when, form.buy_cities, form.buy_type, form.buy_budget, form.buy_pre].every(v=> !isEmpty(v));
    if(cur==='seller') return [form.sell_city, form.sell_type, form.sell_when].every(v=> !isEmpty(v));
    if(cur==='final')  return form.agent_signed!=='' && form.consent==='YES' && !!form.terms;
    return true;
  };
  const [touched,setTouched]=React.useState(false);

  const next = ()=>{
    setTouched(true);
    if(!validate()){
      push('Please complete required fields');
      return;
    }
    if(stepIdx<steps.length-1){
      setStepIdx(i=>i+1);
      setTouched(false);
    } else {
      setSubmitted(true);
    }
  };
  const prev = ()=> setStepIdx(i=> Math.max(0,i-1));

  const INTENT = ['Buy my first house','Buy another house','Sell my current house to buy a new house','Sell my current house'];
  const BUY_TIMING = ['Ready to buy in next 3 months','Anytime in next 6 months','Some time in next 6 - 12 months','Unsure at the moment or in next 1-2 years'];
  const BUY_TYPES = ['Freehold Townhouse','Condo/Condo Townhouse','Semi-Detached House','Detached House'];
  const BUDGETS = ['$900K or less','$900k - $1.1M','$1.1M-$1.3M','$1.3M - $1.6M','$1.6M or more'];
  const SELL_TIMING = ['At the earliest possible','Anytime in next 6 months','Sometime in next 6- 10 months','Unsure at the moment'];
  const SELL_TYPES = BUY_TYPES; const SELL_PRICE = BUDGETS;

  if(submitted){
    return <ConfirmationScreen data={form} onEdit={()=> setSubmitted(false)} />;
  }

  const PersonalStep = () => {
    const showRefCode = form.hasReferral==='YES';
    return (
      <SectionCard title="About You" subtitle="Tell us how we can reach you">
        <RequiredNote/>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <FieldLabel>What's your name? *</FieldLabel>
            <SubLabel>First Name</SubLabel>
            <TextInput {...bind('firstName')} placeholder=""/>
            <ErrorText show={touched && isEmpty(form.firstName)} />
          </div>
          <div>
            <FieldLabel className="invisible">&nbsp;</FieldLabel>
            <SubLabel>Last Name</SubLabel>
            <TextInput {...bind('lastName')} placeholder=""/>
            <ErrorText show={touched && isEmpty(form.lastName)} />
          </div>
        </div>
        <div className="mt-3">
          <FieldLabel>What's your email? *</FieldLabel>
          <TextInput {...bind('email')} placeholder="example@example.com"/>
          <ErrorText show={touched && isEmpty(form.email)} />
        </div>
        <div className="mt-3">
          <FieldLabel>What's your phone number? *</FieldLabel>
          <SubLabel>Phone Number</SubLabel>
          <TextInput {...bind('phone')} placeholder=""/>
          <ErrorText show={touched && isEmpty(form.phone)} />
        </div>
        <div className="mt-3">
          <FieldLabel>Do you have a referral code (Hausee ID) from a Hausee Circle member?</FieldLabel>
          <RadioChips value={form.hasReferral} options={['YES','No']} onChange={(v)=> set({hasReferral:v, ...(v!=='YES'? {referralCode:''}:{})})} />
        </div>
        {showRefCode && (
          <div className="mt-3">
            <FieldLabel>Please provide the referral code (Hausee ID) you received from a Hausee Circle member. *</FieldLabel>
            <TextInput {...bind('referralCode')} placeholder=""/>
            <ErrorText show={touched && isEmpty(form.referralCode)} />
          </div>
        )}
      </SectionCard>
    );
  };

  const IntentStep = () => (
    <SectionCard title="Property Intent" subtitle="What are you planning to do?">
      <RequiredNote/>
      <div className="mt-3">
        <RadioChips value={intentToLabel(form.intent)} options={INTENT} onChange={(label)=> set({ intent: labelToIntent(label) })} />
        <ErrorText show={touched && isEmpty(form.intent)} />
      </div>
    </SectionCard>
  );

  const BuyerStep = () => (
    <SectionCard title="Questions for Buyers" subtitle="Shown if your intent includes buying">
      <RequiredNote/>
      <div className="mt-3">
        <FieldLabel>When are you looking to buy the house? *</FieldLabel>
        <RadioChips value={form.buy_when} options={BUY_TIMING} onChange={(v)=> set({buy_when:v})}/>
        <ErrorText show={touched && isEmpty(form.buy_when)} />
      </div>
      <div className="mt-3">
        <FieldLabel>Where are you looking to buy a house? *</FieldLabel>
        <SubLabel>Select all the cities your are interested</SubLabel>
        <MultiSelectAutosuggest value={form.buy_cities} onChange={(e)=> set({buy_cities: e.target.value})} placeholder="Start typing a city (e.g., Milton)" />
        <ErrorText show={touched && isEmpty(form.buy_cities)} />
      </div>
      <div className="mt-3">
        <FieldLabel>What type of house are you looking to buy? *</FieldLabel>
        <CheckChips value={form.buy_type} options={BUY_TYPES} onChange={(val)=> set({buy_type: val})}/>
        <ErrorText show={touched && isEmpty(form.buy_type)} />
      </div>
      <div className="mt-3">
        <FieldLabel>What's your budget?</FieldLabel>
        <RadioChips value={form.buy_budget} options={BUDGETS} onChange={(v)=> set({buy_budget:v})}/>
      </div>
      <div className="mt-3">
        <FieldLabel>Do you have a mortgage pre-approval for your purchase?</FieldLabel>
        <RadioChips value={form.buy_pre} options={['YES','NO']} onChange={(v)=> set({buy_pre:v})}/>
      </div>
      {form.buy_pre==='YES' && (
        <div className="mt-3">
          <FieldLabel>What's your pre-approved purchase price?</FieldLabel>
          <TextInput {...bind('buy_pre_price')} placeholder=""/>
        </div>
      )}
      <div className="mt-3">
        <FieldLabel>Are you buying this property to use it as your primary residence?</FieldLabel>
        <RadioChips value={form.buy_primary} options={['Yes','No']} onChange={(v)=> set({buy_primary:v})}/>
      </div>
    </SectionCard>
  );

  const SellerStep = () => (
    <SectionCard title="Questions for Sellers" subtitle="Shown if your intent includes selling">
      <RequiredNote/>
      <div className="mt-3">
        <FieldLabel>Where is the house located that you want to sell? *</FieldLabel>
        <SubLabel>Select the city</SubLabel>
        <SingleSelectAutosuggest value={form.sell_city} onChange={(e)=> set({sell_city: e.target.value})} placeholder="Start typing a city (e.g., Milton)" />
        <ErrorText show={touched && isEmpty(form.sell_city)} />
      </div>
      <div className="mt-3">
        <FieldLabel>What's the major intersection or address of the house?</FieldLabel>
        <SubLabel>We want to be respectful of your privacy. We are asking for this information because this helps agents prepare well for their first conversation with you.</SubLabel>
        <TextInput {...bind('sell_address')} placeholder=""/>
      </div>
      <div className="mt-3">
        <FieldLabel>What is the type of house that you are looking to sell?</FieldLabel>
        <RadioChips value={form.sell_type} options={SELL_TYPES} onChange={(v)=> set({sell_type:v})}/>
      </div>
      <div className="mt-3">
        <FieldLabel>When are you looking to sell the house? *</FieldLabel>
        <RadioChips value={form.sell_when} options={SELL_TIMING} onChange={(v)=> set({sell_when:v})}/>
        <ErrorText show={touched && isEmpty(form.sell_when)} />
      </div>
      <div className="mt-3">
        <FieldLabel>How much are you hoping to sell it for?</FieldLabel>
        <RadioChips value={form.sell_price} options={SELL_PRICE} onChange={(v)=> set({sell_price:v})}/>
      </div>
    </SectionCard>
  );

  const FinalStep = () => (
    <SectionCard title="General & Final" subtitle="A few last details">
      <div className="mt-1 mb-2 text-[11px]" style={{color:COLORS.gray}}>Submitting means you agree to the Terms.</div>
      <div className="mt-3">
        <FieldLabel>Are you working with an agent with whom you have signed any contract? *</FieldLabel>
        <SubLabel>Real estate agents mostly get an agreement signed by their client to work with them, a Buyers Representation Agreement for buying a home and a Listing Agreement for selling a home.</SubLabel>
        <RadioChips value={form.agent_signed} options={['Yes','No']} onChange={(v)=> set({agent_signed:v})}/>
        <ErrorText show={touched && (form.agent_signed==='')} />
      </div>
      <div className="mt-3">
        <FieldLabel>Anything else we need to know?</FieldLabel>
        <SubLabel>That can help us find you the best options on the real estate services.</SubLabel>
        <TextArea value={form.notes||''} onChange={(e)=> set({notes:e.target.value})} placeholder=""/>
      </div>
      <div className="mt-3">
        <FieldLabel>Do you consent to receive communication from Hausee.ca team and the referred agents? *</FieldLabel>
        <SubLabel>We promise we won't spam your inbox. We will make the agent introductions over email and occasionally get in touch with you over the phone, text, email, or WhatsApp to check in or follow up. Your information will not be shared with anyone else. Please report to us if anyone else contacts you with our name.</SubLabel>
        <RadioChips value={form.consent} options={['YES','NO']} onChange={(v)=> set({consent:v})}/>
        <ErrorText show={touched && (form.consent!=='YES')} text="Consent must be YES to proceed" />
      </div>
      <div className="mt-3 space-y-2">
        <FieldLabel>Terms & Conditions *</FieldLabel>
        <SubLabel>Please scroll and read the below information carefully.</SubLabel>
        <div className="max-h-40 overflow-auto rounded-lg border p-3 text-sm" style={{ borderColor: COLORS.lightGray }}>
          <p className="mb-2">By clicking on submit button, you understand and agree to the following terms and conditions</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>You understand and agree that the information you have provided is true and correct.</li>
            <li>You understand and agree that you will be introduced initially to three agents only who are interested in offering their real estate services to you. You can request more agents at any time.</li>
            <li>You understand and agree that the real estate agents suggested by Hausee don't represent Hause, they represent the respective brokerage they are associated with</li>
          </ol>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.terms} onChange={(e)=> set({terms:e.target.checked})}/>
          <span className="text-sm" style={{color:COLORS.charcoal}}>I agree to the Terms & Conditions *</span>
        </label>
        <ErrorText show={touched && !form.terms} />
      </div>
    </SectionCard>
  );

  const stepsRender = {
    personal: <PersonalStep/>,
    intent:   <IntentStep/>,
    buyer:    <BuyerStep/>,
    seller:   <SellerStep/>,
    final:    <FinalStep/>,
  };

  const nextLabel = stepIdx < steps.length-1 ? 'Next' : 'Submit Request';

  return (
    <div className="min-h-[100dvh] pb-20" style={{ background: COLORS.background }}>
      <div className="px-4 py-3 space-y-4 max-w-2xl mx-auto">
        <header>
          <div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>{steps[stepIdx]?.title || 'Select'}</div>
          <div className="flex gap-2 mt-2">
            {steps.map((_,i)=> (
              <span key={_.key} className={cx('inline-block w-2.5 h-2.5 rounded-full border', i===stepIdx? 'bg-[#EF4D68] border-[#EF4D68]':'bg-transparent')} style={{ borderColor: i===stepIdx? COLORS.coral : COLORS.lightGray }} />
            ))}
          </div>
        </header>

        {stepsRender[steps[stepIdx]?.key]}

        <div className="grid grid-cols-2 gap-2">
          <button className="h-10 rounded-lg border" style={{ borderColor: COLORS.lightGray }} onClick={prev} disabled={stepIdx===0}>Back</button>
          <button className="h-10 rounded-lg text-white" style={{ background: COLORS.coral }} onClick={next}>{nextLabel}</button>
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(t=> (
          <div key={t.id} className="pointer-events-auto px-3 py-2 rounded-lg shadow-sm text-sm" style={{ background: COLORS.charcoal, color:'#fff' }}>{t.text}</div>
        ))}
      </div>
    </div>
  );
}

export default function SelectTab(){
  return <SelectModule />;
}
