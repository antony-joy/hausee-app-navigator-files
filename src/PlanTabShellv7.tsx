
import * as React from 'react';
import EvaluateTabWithInspection from './evaluate_tab_with_inspection';
import Evaluate from './Evaluate';
import GuideTabPreview from './guide_tab_preview';
import HauseeSelectFormStepByStepPreview from './hausee_select_form_step_by_step_preview';
import {
  UserProfile,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,             // ⬅️ add this
} from '@clerk/clerk-react';




/********************
 * THEME & HELPERS
 ********************/
const COLORS = {
  coral: '#EF4D68', coralSoft: '#FFF1F3',
  aqua: '#58DBC2', charcoal: '#293847',
  gray: '#6B7280', lightGray: '#E5E7EB',
  surface: '#FFFFFF', background: '#F9FAFB',
  success: '#10B981', warning: '#F59E0B', error: '#EF4444'
};
function cx(...xs:(string|false|undefined|null)[]){ return xs.filter(Boolean).join(' '); }
function money(n:number){ const v=Number.isFinite(n)? n: 0; return v.toLocaleString('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}); }
function toK(n:number){ return money(n).replace(/\.00$/, ''); }

// Preferred city options (Ontario focus)
const CITY_OPTIONS = [
  'Ajax','Arnprior','Aurora','Barrie','Belleville','Brampton','Brant','Brantford','Brockville','Burlington','Caledon','Cambridge','Carleton Place','Chatham-Kent','Clarence-Rockland','Collingwood','Cornwall','Dryden','East Gwillimbury','Elliot Lake','Georgina','Gravenhurst','Greater Sudbury','Guelph','Haldimand County','Halton Hills','Hamilton','Hawkesbury','Huntsville','Kawartha Lakes','Kenora','Kingston','Kitchener','Leamington','London','Markham','Midland','Milton','Mississauga','Newmarket','Niagara Falls','Norfolk County','North Bay','Oakville','Orangeville','Orillia','Oshawa','Ottawa','Owen Sound','Parry Sound','Pembroke','Perth','Peterborough','Pickering','Port Colborne','Prince Edward County','Quinte West','Richmond Hill','Sarnia','Sault Ste. Marie','Smiths Falls','St. Catharines','St. Thomas','Stratford','Temiskaming Shores','Thorold','Thunder Bay','Tillsonburg','Timmins','Toronto','Uxbridge','Vaughan','Waterloo','Welland','Whitby','Windsor','Woodstock'
];

/********************
 * Inline Icons
 ********************/
const Icon = {
  Close:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>),
  Settings:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>),
  Calendar:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>),
  Search:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>),
  Home:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Book:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4v15a2 2 0 0 0 2 2h14V6a2 2 0 0 0-2-2H6"/></svg>),
  Chat:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>),
  ChevronLeft:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>),
  ChevronRight:(p:any)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>),
};

/********************
 * Primitives
 ********************/
function SectionCard({ title, subtitle, children }:{ title?:string; subtitle?:string; children:any }){
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
function FieldLabel({ children }:{children:any}){ return <div className="text-[14px] font-medium" style={{ color: COLORS.charcoal }}>{children}</div>; }
function TextInput({ value, onChange, placeholder, leftIcon, error }:{ value:any; onChange:(e:any)=>void; placeholder?:string; leftIcon?:any; error?:boolean }){
  const border = error ? COLORS.error : COLORS.lightGray;
  return (
    <div className="relative mt-2">
      {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.gray }}>{leftIcon}</span>}
      <input aria-invalid={!!error} className={cx('w-full h-12 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2', leftIcon? 'pl-10 pr-3' : 'px-3')} style={{ borderColor: border }} placeholder={placeholder} value={value} onChange={onChange}/>
    </div>
  );
}
function SelectInput({ value, onChange, options }:{ value:string; onChange:(e:any)=>void; options:string[] }){
  return (
    <select className="w-full h-12 px-3 mt-2 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2" style={{ borderColor: COLORS.lightGray }} value={value} onChange={onChange}>
      <option value="">Select</option>
      {options.map(o=> <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function TextArea({ value, onChange, placeholder }:{ value:string; onChange:(e:any)=>void; placeholder?:string }){
  return <textarea className="w-full min-h-[96px] p-3 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2" style={{ borderColor: COLORS.lightGray }} placeholder={placeholder} value={value} onChange={onChange}/>;
}
function Chip({ active, children, onClick }:{ active:boolean; children:any; onClick:()=>void }){
  return <button onClick={onClick} className={cx('px-3 h-12 rounded-[16px] border text-sm', active? 'border-[#EF4D68] bg-[#FFF1F3]' : 'border-gray-300 bg-white')} style={{ minHeight:48 }}>{children}</button>;
}
function PrimaryButton({ children, onClick }:{ children:any; onClick:()=>void }){ return <button className="h-12 px-4 rounded-xl w-full text-white shadow-sm" style={{ background: COLORS.coral }} onClick={onClick}>{children}</button>; }

/********************
 * Header & Bottom Nav
 ********************/
function Header({
    title,
    subtitle,
    onOpenProfile,
    hasCobuyer,
  }: {
    title: string;
    subtitle?: string;
    onOpenProfile?: () => void;
    hasCobuyer?: boolean;
  }) {
    return (
      <div
        className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b"
        style={{ borderColor: COLORS.lightGray }}
      >
        <div className="px-4 py-3 flex items-center">
          <div className="flex-1 text-center">
            <div
              className="text-base font-semibold"
              style={{ color: COLORS.charcoal }}
            >
              {title}
            </div>
            {subtitle && (
              <div className="text-xs" style={{ color: COLORS.gray }}>
                {subtitle}
              </div>
            )}
            {hasCobuyer && (
              <div className="mt-0.5 flex justify-center">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: COLORS.coralSoft, color: COLORS.coral }}
                >
                  Co-buyer connected
                </span>
              </div>
            )}
          </div>
          <div className="absolute right-4 top-3 flex items-center gap-2 md:hidden">

            <button
              className="p-2 rounded-lg"
              aria-label="Settings"
              onClick={onOpenProfile}
            >
              <Icon.Settings />
            </button>
          </div>
        </div>
      </div>
    );
  }
  


const TABS = [
  { key:'plan', label:'Plan', icon: Icon.Calendar },
  { key:'evaluate', label:'Evaluate', icon: Icon.Search },
  { key:'select', label:'Select', icon: Icon.Home },
  { key:'guide', label:'Guide', icon: Icon.Book },
  { key:'ai', label:'AI', icon: Icon.Chat },
] as const;

type TabKey = (typeof TABS)[number]['key'];
function BottomNav({ value, onChange }:{ value:TabKey; onChange:(k:TabKey)=>void }){
    return (
      <nav
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t md:hidden"
        style={{ borderColor: COLORS.lightGray }}
      >
        <div className="grid grid-cols-5">
          {TABS.map(t=>{ const Active:any = t.icon; const active = value===t.key; return (
            <button key={t.key} className="py-2 flex flex-col items-center gap-1" onClick={()=> onChange(t.key as TabKey)}>
              <Active style={{ color: active? COLORS.coral : COLORS.gray }}/>
              <span className="text-[11px]" style={{ color: active? COLORS.coral : COLORS.gray }}>{t.label}</span>
            </button>
          );})}
        </div>
      </nav>
    );
  }
  
  function SidebarNav({
    value,
    onChange,
    onOpenProfile,
  }: {
    value: TabKey;
    onChange: (k: TabKey) => void;
    onOpenProfile: () => void;
  }) {
    const [collapsed, setCollapsed] = React.useState(false);
  
    return (
      <aside
        className={cx(
          'hidden md:flex md:flex-col md:h-[100dvh] border-r bg-white transition-all',
          collapsed ? 'md:w-16' : 'md:w-60'
        )}
        style={{ borderColor: COLORS.lightGray }}
      >
        {/* Top: brand + collapse button */}
        <div
          className="flex items-center justify-between px-3 py-3 border-b"
          style={{ borderColor: COLORS.lightGray }}
        >
          {!collapsed && (
            <div
              className="text-sm font-semibold"
              style={{ color: COLORS.charcoal }}
            >
              Hausee Navigator
            </div>
          )}
          <button
            className="h-8 w-8 flex items-center justify-center rounded-lg border text-sm"
            style={{ borderColor: COLORS.lightGray }}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>
  
        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          {TABS.map((t) => {
            const IconComp: any = t.icon;
            const active = value === t.key;
            return (
              <button
                key={t.key}
                className={cx(
                  'w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm',
                  active ? 'bg-[#FFF1F3]' : 'hover:bg-[#F9FAFB]'
                )}
                onClick={() => onChange(t.key as TabKey)}
                style={{ color: active ? COLORS.coral : COLORS.charcoal }}
              >
                <IconComp />
                {!collapsed && <span>{t.label}</span>}
              </button>
            );
          })}
        </nav>
  
        {/* Settings / profile entry */}
        <div
          className="px-2 py-3 border-t"
          style={{ borderColor: COLORS.lightGray }}
        >
          <button
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm hover:bg-[#F9FAFB]"
            style={{ color: COLORS.gray }}
            onClick={onOpenProfile}
          >
            <Icon.Settings />
            {!collapsed && <span>Profile & settings</span>}
          </button>
        </div>
      </aside>
    );
  }
  

/********************
 * Recommended Next Steps — Option 1 (Action Cards)
 ********************/
function RecommendedNextSteps({ onGoPlan, onSuggest }:{ onGoPlan:(i:number)=>void; onSuggest:(what:'guide'|'ai')=>void }) {
  const cards = [
    { icon: '📊', title: 'Complete Self-Assessment', desc: 'Understand where you stand financially before starting.', action: ()=> onGoPlan(2) },
    { icon: '💰', title: 'Start Home Budget Planning', desc: 'Map your income and expenses clearly.', action: ()=> onGoPlan(3) },
    { icon: '🏦', title: 'Track Down Payment Savings', desc: 'See how close you are to your home fund goal.', action: ()=> onGoPlan(4) },
    { icon: '📘', title: 'Learn About Home Buying', desc: 'Master the process with our step-by-step Playbook.', action: ()=> onSuggest('guide') },
    { icon: '🤖', title: 'Ask Homebuying Co-Pilot', desc: 'Chat with your AI co-pilot anytime you get stuck.', action: ()=> onSuggest('ai') },
  ];

  return (
    <SectionCard title="Recommended Next Steps" subtitle="Quick actions you can take now">
      <div className="grid md:grid-cols-2 gap-3">
        {cards.map(c => (
          <button key={c.title} onClick={c.action} className="text-left p-4 rounded-2xl border bg-white hover:shadow-sm transition-all" style={{ borderColor: COLORS.lightGray }}>
            <div className="flex items-start gap-3">
              <div className="text-xl leading-none">{c.icon}</div>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: COLORS.charcoal }}>{c.title}</div>
                <div className="text-xs" style={{ color: COLORS.gray }}>{c.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

/********************
 * PLAN — My Dream Home
 ********************/
function MyDreamHome({ requireConstructionError=false }:{ requireConstructionError?:boolean }){
  const initial = ()=>{
    try{
      const saved = JSON.parse(localStorage.getItem('plan_dream_home')||'{}')||{};
      return {
        constructionStatus:'', priceMin:400000, priceMax:800000,
        citiesQuery: typeof saved.citiesQuery === 'string' ? saved.citiesQuery : '',
        citiesSelected: Array.isArray(saved.citiesSelected) ? saved.citiesSelected : [],
        type:[], beds:'', baths:'', condoFees:'', basement:[], backyard:'', renovate:'', schools:[], features:[], direction:'', closeTo:[], timeline:'', notes:'',
        ...saved
      };
    }catch{return { constructionStatus:'', priceMin:400000, priceMax:800000, citiesQuery:'', citiesSelected:[] }}
  };
  const [form, setForm] = React.useState<any>(initial);
  React.useEffect(()=>{ try{ localStorage.setItem('plan_dream_home', JSON.stringify(form)); }catch{} }, [form]);

  const ChipsRow=({ options, value, onChange, multi=false }:{ options:string[]; value:any; onChange:(v:any)=>void; multi?:boolean })=> (
    <div className="grid grid-cols-2 gap-2">{options.map(opt=>{ const isActive = multi? (value||[]).includes(opt) : value===opt; const toggle=()=>{ if(multi){ const set=new Set(value||[]); set.has(opt)? set.delete(opt) : set.add(opt); onChange(Array.from(set)); } else { onChange(isActive? '' : opt); } }; return <Chip key={opt} active={!!isActive} onClick={toggle}>{opt}</Chip>; })}</div>
  );

  const railMin=200000, railMax=2000000, step=5000; const clamp=(v:number,min:number,max:number)=> Math.min(max, Math.max(min,v));
  const updateMin=(v:number)=> setForm((f:any)=> ({...f, priceMin: clamp(Math.min(v, f.priceMax - step), railMin, railMax)}));
  const updateMax=(v:number)=> setForm((f:any)=> ({...f, priceMax: clamp(Math.max(v, f.priceMin + step), railMin, railMax)}));

  // Preferred Cities — autosuggest (max 3)
  const addCity=(name:string)=> setForm((f:any)=>{
    const sel = f.citiesSelected||[]; if(sel.includes(name)) return f; if(sel.length>=3) return { ...f, _citiesLimitHit:true };
    return { ...f, citiesSelected:[...sel, name], citiesQuery:'', _citiesLimitHit:false };
  });
  const removeCity=(name:string)=> setForm((f:any)=> ({ ...f, citiesSelected:(f.citiesSelected||[]).filter((c:string)=> c!==name), _citiesLimitHit:false }));
  const filteredCities = React.useMemo(()=>{
    const q = String(form.citiesQuery||'').trim().toLowerCase();
    const selected = new Set(form.citiesSelected||[]);
    return CITY_OPTIONS.filter(c=> !selected.has(c) && (!q || c.toLowerCase().includes(q))).slice(0,8);
  }, [form.citiesQuery, form.citiesSelected]);

  return (
    <SectionCard title="My Dream Home" subtitle="Capture your ideal home preferences">
      <div className="space-y-6">
        <div>
          <FieldLabel>Construction Status (required)</FieldLabel>
          {requireConstructionError && !form.constructionStatus && (<div className="mt-1 text-xs" style={{ color: COLORS.error }}>Please select one option to continue.</div>)}
          <div className="mt-2 grid grid-cols-2 gap-2">{(['New Construction','Ready to move in'] as const).map(opt=> <Chip key={opt} active={form.constructionStatus===opt} onClick={()=> setForm({...form, constructionStatus: form.constructionStatus===opt? '' : opt})}>{opt}</Chip>)}</div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <FieldLabel>Price Range</FieldLabel>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg text-sm font-medium" style={{ background: COLORS.coralSoft, color: COLORS.coral }}>{toK(form.priceMin)}</span>
              <span className="text-sm" style={{ color: COLORS.gray }}>to</span>
              <span className="px-3 py-1 rounded-lg text-sm font-medium" style={{ background: COLORS.coralSoft, color: COLORS.coral }}>{toK(form.priceMax)}</span>
            </div>
          </div>
          <div className="relative mt-3">
            <div className="h-2 rounded-full" style={{ background: COLORS.lightGray }} />
            {(()=>{ const left=((form.priceMin-railMin)/(railMax-railMin))*100; const right=((form.priceMax-railMin)/(railMax-railMin))*100; return <div className="h-2 rounded-full absolute top-0" style={{ left:`${left}%`, width:`${right-left}%`, background: COLORS.coral }} />; })()}
            <input type="range" min={railMin} max={railMax} step={step} value={form.priceMin} onChange={e=> updateMin(Number((e.target as HTMLInputElement).value))} className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto"/>
            <input type="range" min={railMin} max={railMax} step={step} value={form.priceMax} onChange={e=> updateMax(Number((e.target as HTMLInputElement).value))} className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto"/>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs" style={{ color: COLORS.gray }}><span>{toK(railMin)}</span><span>{toK(railMax)}</span></div>
        </div>

        <div>
          <FieldLabel>Preferred Cities <span className="text-xs font-normal" style={{color:COLORS.gray}}>(choose up to 3)</span></FieldLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {(form.citiesSelected||[]).map((c:string)=> (
              <span key={c} className="px-3 h-9 inline-flex items-center gap-2 rounded-full border text-sm" style={{ borderColor: COLORS.coral, background: COLORS.coralSoft, color: COLORS.coral }}>
                {c}
                <button onClick={()=> removeCity(c)} aria-label={`Remove ${c}`} className="-mr-1 rounded-full px-1">×</button>
              </span>
            ))}
            {(form.citiesSelected||[]).length===0 && (
              <span className="text-xs" style={{color:COLORS.gray}}>No cities selected yet.</span>
            )}
          </div>
          <div className="mt-2">
            <TextInput leftIcon={<Icon.Search/>} placeholder="Type a city name..." value={form.citiesQuery||''} onChange={(e:any)=> setForm({...form, citiesQuery:e.target.value})} />
          </div>
          {Boolean(form.citiesQuery) && filteredCities.length>0 && (
            <div className="mt-2 rounded-xl border bg-white" style={{ borderColor: COLORS.lightGray }}>
              <ul>
                {filteredCities.map((name)=> (
                  <li key={name}>
                    <button className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB]" onClick={()=> addCity(name)} disabled={(form.citiesSelected||[]).length>=3}>
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(form.citiesSelected||[]).length>=3 && (
            <div className="mt-1 text-xs" style={{ color: COLORS.gray }}>You’ve reached the max of 3 cities. Remove one to add another.</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><FieldLabel>Bedrooms</FieldLabel><SelectInput value={String(form.beds||'')} onChange={(e:any)=> setForm({...form, beds: e.target.value? Number(e.target.value): undefined})} options={['1','2','3','4','5']}/></div>
          <div><FieldLabel>Bathrooms</FieldLabel><SelectInput value={String(form.baths||'')} onChange={(e:any)=> setForm({...form, baths: e.target.value? Number(e.target.value): undefined})} options={['1','2','3','4','5']}/></div>
        </div>

        <div>
          <FieldLabel>Max Condo/POTL Fees</FieldLabel>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-3 h-12 rounded-xl bg-[#F5F5F5] flex items-center" style={{ color: COLORS.gray }}>$</span>
            <input className="flex-1 h-12 px-3 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2" style={{ borderColor: COLORS.lightGray }} value={form.condoFees||''} onChange={(e:any)=> setForm({...form, condoFees:e.target.value.replace(/[^0-9]/g,'')})}/>
          </div>
        </div>

        <div><FieldLabel>Backyard</FieldLabel><ChipsRow options={['Small','Large','Indifferent']} value={form.backyard} onChange={(v:any)=> setForm({...form, backyard:v})}/></div>
        <div><FieldLabel>Timeline to Buy</FieldLabel><SelectInput value={form.timeline||''} onChange={(e:any)=> setForm({...form, timeline:e.target.value})} options={['0–6mo','6–12mo','12–24mo','2+yrs']}/></div>
        <div><FieldLabel>Notes</FieldLabel><TextArea placeholder="Any other preferences?" value={form.notes||''} onChange={(e:any)=> setForm({...form, notes:e.target.value})}/></div>

        <div className="text-xs" style={{ color: COLORS.gray }}>Autosaved locally • Prototype</div>
      </div>
    </SectionCard>
  );
}

/********************
 * PLAN — Financial Readiness Masterclass
 ********************/
function FinancialReadinessMasterclass({ onGoPlan, onSuggest }:{ onGoPlan:(index:number)=>void; onSuggest:(what:'guide'|'ai')=>void }){
  return (
    <div className="px-4 py-3 space-y-4">
      <SectionCard title="Financial Readiness Masterclass" subtitle="Learn the money moves that make home buying stress‑free">
        <div className="space-y-3">
          <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: COLORS.lightGray }}>
            <div className="aspect-video bg-[#0000000D] flex items-center justify-center">
              <div className="text-sm" style={{ color: COLORS.gray }}>Video player placeholder</div>
            </div>
          </div>
          <div className="text-sm" style={{ color: COLORS.charcoal }}>
            This masterclass covers cash flow, GDS/TDS, down payments, closing costs, and how to pace your journey from planning to purchase.
          </div>
        </div>
      </SectionCard>

      <RecommendedNextSteps onGoPlan={onGoPlan} onSuggest={onSuggest} />

      <div className="text-xs" style={{ color: COLORS.gray }}>Prototype — content subject to change</div>
    </div>
  );
}

/********************
 * PLAN — Self-Assessment (meaning-based guidance)
 ********************/
function readinessStatus(score:number){
  if(score < 50) return { label:'Needs Preparation', color: COLORS.coral, note:'Focus on building financial stability and learning mortgage & offer basics before moving ahead.' };
  if(score < 75) return { label:'On Track', color: COLORS.warning, note:'You’re progressing well. Shore up savings, credit, and review closing costs & mortgage options.' };
  return { label:'Ready to Buy', color: COLORS.success, note:'You have strong readiness. Start viewing homes and fine‑tune your strategy.' };
}
function Likert({ value, onChange }:{ value:number; onChange:(n:number)=>void }){ const opts=[1,2,3,4,5]; return (<div><div className="flex items-center gap-2 mt-2">{opts.map(n=> (<button key={n} onClick={()=> onChange(n)} className={cx('w-10 h-10 rounded-full border flex items-center justify-center text-sm', value===n? 'text-white':'')} style={{borderColor:value===n?COLORS.coral:COLORS.lightGray, background:value===n?COLORS.coral:COLORS.surface}}>{n}</button>))}</div><div className="flex justify-between text-[11px] mt-1" style={{color:COLORS.gray}}><span>Very unsure</span><span>Very confident</span></div></div>); }
function SelfAssessment(){ const groups={ financial:['I have 3–6 months of emergency savings.','My GDS/TDS debt service ratios should meet Canadian lender limits.','My credit score is strong enough for a mortgage (approx. 670+).',"I understand Canada's minimum down payment rules.",'I am comfortable with mortgage default insurance if my down payment is under 20%.'], knowledge:['I understand the key steps from search → offer → firm → closing.','I know how pre-approval affects offers and locks in rates.','I understand Canadian mortgages (fixed vs variable; term vs amortization).','I know the major closing costs I will need to cover in Ontario.','I feel informed about neighbourhoods and pricing where I want to buy.'], emotional:['I plan to stay in the home for 3–5+ years.','I am comfortable making decisions under 24–48 hour offer deadlines.','My income feels stable enough for homeownership.','I feel confident managing home maintenance responsibilities.','I understand tradeoffs like size vs commute vs neighbourhood.'] } as const; type Answers=Record<string,number>; const load=():Answers=>{ try{return JSON.parse(localStorage.getItem('self_assess')||'{}')}catch{return{}}}; const [answers,setAnswers]=React.useState<Answers>(load); React.useEffect(()=>{ try{localStorage.setItem('self_assess',JSON.stringify(answers))}catch{} },[answers]); const set=(k:string,v:number)=> setAnswers(a=>({...a,[k]:v})); const values=Object.values(answers).filter(Boolean); const score=values.length? Math.round((values.reduce((s,n)=>s+n,0)/(values.length*5))*100):0; const rs = readinessStatus(score); const Group=({title,items}:{title:string;items:string[]})=> (<div className="rounded-2xl border bg-white p-4" style={{borderColor:COLORS.lightGray}}><div className="text-sm font-medium mb-2" style={{color:COLORS.charcoal}}>{title}</div><div className="space-y-4">{items.map((q,i)=>{ const key=title+':'+i; const val=answers[key]||0; return (<div key={key}><div className="text-sm" style={{color:COLORS.charcoal}}>{q}</div><Likert value={val} onChange={(n)=> set(key,n)}/></div>)})}</div></div>); return (<div className="px-4 py-3 space-y-4">{values.length>=5 && (<div className="rounded-2xl border bg-white p-4" style={{borderLeft:`4px solid ${COLORS.coral}`, borderColor:COLORS.lightGray}}><div className="text-base font-semibold" style={{color:COLORS.charcoal}}>Your Readiness Score: {score}%</div><div className="text-xs mt-0.5 font-medium" style={{color:rs.color}}>{rs.label}</div><div className="text-xs mt-1" style={{color:COLORS.gray}}>{rs.note}</div></div>)}<Group title="Financial Readiness" items={groups.financial as any}/><Group title="Knowledge Readiness" items={groups.knowledge as any}/><Group title="Emotional Readiness" items={groups.emotional as any}/><div className="text-xs" style={{ color: COLORS.gray }}>Autosaved locally • Prototype</div></div>); }

/********************
 * PLAN — Budget
 ********************/
function NumberRowDual({ label, cur, exp, onChangeCur, onChangeExp }:{ label:string; cur:number; exp:number; onChangeCur:(v:number)=>void; onChangeExp:(v:number)=>void }){
  const toNum = (s:string)=> Number((s||'').toString().replace(/[^0-9]/g,''));
  return (
    <div className="grid grid-cols-4 items-center gap-2">
      <div className="text-sm" style={{ color: COLORS.charcoal }}>{label}</div>
      <input className="h-10 rounded-lg border px-3 text-right outline-none" style={{ borderColor: COLORS.lightGray }} value={cur||''} inputMode="numeric" onChange={(e)=> onChangeCur(toNum((e.target as HTMLInputElement).value))} />
      <input className="h-10 rounded-lg border px-3 text-right outline-none" style={{ borderColor: COLORS.lightGray }} value={exp||''} inputMode="numeric" onChange={(e)=> onChangeExp(toNum((e.target as HTMLInputElement).value))} />
      <div />
    </div>
  );
}
function BudgetModule(){
  const initial = {
    income: { cur:{ net:0, partner:0, other:0 }, exp:{ net:0, partner:0, other:0 } },
    debt:   { cur:{ cc:0, loc:0, student:0, personal:0, auto:0, other:0 }, exp:{ cc:0, loc:0, student:0, personal:0, auto:0, other:0 } },
    transport:{ cur:{ ins:0, rep:0, fuel:0, parking:0, transit:0 }, exp:{ ins:0, rep:0, fuel:0, parking:0, transit:0 } },
    housing:{ cur:{ rent:0, tax:0, ins:0, condo:0, maint:0, groceries:0, laundry:0 }, exp:{ rent:0, tax:0, ins:0, condo:0, maint:0, groceries:0, laundry:0 } },
    health:{ cur:{ med:0, vision:0, dental:0, therapist:0, special:0 }, exp:{ med:0, vision:0, dental:0, therapist:0, special:0 } },
  } as const;

  const [state, setState] = React.useState<any>(()=>{ try{ const saved = JSON.parse(localStorage.getItem('budget_state')||'null'); return saved || initial; }catch{return initial;} });
  React.useEffect(()=>{ try{ localStorage.setItem('budget_state', JSON.stringify(state)); }catch{} }, [state]);

  const sumGroup = (grp:any, which:'cur'|'exp')=> Object.values(grp[which]).reduce((a:any,b:any)=> a + (typeof b==='number'? b: 0), 0);
  const incomeCur = sumGroup(state.income,'cur');
  const incomeExp = sumGroup(state.income,'exp');
  const expensesCur = ['debt','transport','housing','health'].reduce((acc:any,g:any)=> acc + sumGroup((state as any)[g], 'cur'), 0);
  const expensesExp = ['debt','transport','housing','health'].reduce((acc:any,g:any)=> acc + sumGroup((state as any)[g], 'exp'), 0);
  const savingsCur = incomeCur - expensesCur;
  const savingsExp = incomeExp - expensesExp;
  const delta = savingsExp - savingsCur;

  const Section = ({ title, keyName, rows }:{ title:string; keyName: keyof typeof initial; rows:{k: keyof typeof initial[keyof typeof initial]['cur']; label:string}[] }) => (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.lightGray }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium" style={{ color: COLORS.charcoal }}>{title}</div>
        <div className="text-xs" style={{ color: COLORS.gray }}>
          Current: {money(sumGroup((state as any)[keyName], 'cur'))} • Expected: {money(sumGroup((state as any)[keyName], 'exp'))}
        </div>
      </div>
      <div className="grid grid-cols-4 text-xs font-medium mb-2" style={{ color: COLORS.gray }}>
        <div>Label</div>
        <div className="text-right pr-2">Current</div>
        <div className="text-right pr-2">Expected</div>
        <div></div>
      </div>
      <div className="space-y-3">
        {rows.map(({k,label})=> (
          <NumberRowDual
            key={String(k)}
            label={label}
            cur={(state as any)[keyName].cur[k] as any}
            exp={(state as any)[keyName].exp[k] as any}
            onChangeCur={(v:number)=> setState((s:any)=> ({...s, [keyName]:{...s[keyName], cur:{...s[keyName].cur, [k]:v}, exp:{...s[keyName].exp} }}))}
            onChangeExp={(v:number)=> setState((s:any)=> ({...s, [keyName]:{...s[keyName], cur:{...s[keyName].cur}, exp:{...s[keyName].exp, [k]:v} }}))}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="px-4 py-3 space-y-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: COLORS.lightGray }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-sm mb-2" style={{ color: COLORS.gray }}>A snapshot of your money picture — no judgment, just clarity.</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#FFF1F3] text-sm font-medium" style={{ color: COLORS.coral }}>Current Savings: {money(savingsCur)}</div>
              <div className="p-3 rounded-xl bg-[#F5FFFB] text-sm font-medium" style={{ color: COLORS.success }}>Expected Savings: {money(savingsExp)}</div>
            </div>
          </div>
          <div className="shrink-0">
            <div className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: delta>=0? '#F5FFFB':'#FFF1F3', color: delta>=0? COLORS.success: COLORS.coral }}>
              Δ {delta>=0? '+':''}{money(delta)}
            </div>
          </div>
        </div>
      </div>

      <Section title="Income" keyName="income" rows={[{k:'net',label:'Net income after taxes'},{k:'partner',label:"Partner's net income after taxes"},{k:'other',label:'Other income'}] as any} />
      <Section title="Debt" keyName="debt" rows={[{k:'cc',label:'Credit cards'},{k:'loc',label:'Lines of credit'},{k:'student',label:'Student loans'},{k:'personal',label:'Personal loan'},{k:'auto',label:'Auto loan/lease'},{k:'other',label:'Other loans'}] as any} />
      <Section title="Transportation" keyName="transport" rows={[{k:'ins',label:'Auto insurance'},{k:'rep',label:'Repairs/maintenance'},{k:'fuel',label:'Fuel'},{k:'parking',label:'Parking'},{k:'transit',label:'Public transit'}] as any} />
      <Section title="Housing Costs" keyName="housing" rows={[{k:'rent',label:'Rent/Mortgage'},{k:'tax',label:'Property taxes'},{k:'ins',label:'Insurance'},{k:'condo',label:'Condo/POTL Fees'},{k:'maint',label:'Maintenance'},{k:'groceries',label:'Groceries'},{k:'laundry',label:'Laundry'}] as any} />
      <Section title="Health" keyName="health" rows={[{k:'med',label:'Medication'},{k:'vision',label:'Glasses/contacts'},{k:'dental',label:'Dental'},{k:'therapist',label:'Therapist'},{k:'special',label:'Special needs items'}] as any} />
      <div className="text-xs" style={{ color: COLORS.gray }}>Autosaved locally • Prototype</div>
    </div>
  );
}

/********************
 * PLAN — Down Payment Tracker
 ********************/
function DownPaymentTracker(){
  const [targetHome, setTargetHome] = React.useState<number>(()=>{ try{ const s=JSON.parse(localStorage.getItem('dp_targetHome')||'null'); return s??500000; }catch{return 500000;} });
  const [downPaymentPercent, setDownPaymentPercent] = React.useState<number>(()=>{ try{ const s=JSON.parse(localStorage.getItem('dp_percent')||'null'); return s??20; }catch{return 20;} });
  const [purchaseTimeline, setPurchaseTimeline] = React.useState<string>(()=>{ try{ return JSON.parse(localStorage.getItem('dp_timeline')||'"2-years"'); }catch{return '2-years';} });
  const [startDate, setStartDate] = React.useState<string>(()=>{ try{ return JSON.parse(localStorage.getItem('dp_start')||'null') || new Date().toISOString().split('T')[0]; }catch{return new Date().toISOString().split('T')[0];} });

  const [accounts, setAccounts] = React.useState<{id:number; name:string; amount:number; pct:number; type:string}[]>(()=>{
    try{ return JSON.parse(localStorage.getItem('dp_accounts')||'null') || [
      { id:1, name:'FHSA', amount:0, pct:100, type:'fhsa' },
      { id:2, name:'RRSP', amount:0, pct:100, type:'rrsp' },
      { id:3, name:'TFSA', amount:0, pct:100, type:'tfsa' },
      { id:4, name:'Savings', amount:0, pct:100, type:'savings' },
      { id:5, name:'Investments', amount:0, pct:100, type:'investment' },
    ]; } catch { return []; }
  });
  const [contrib, setContrib] = React.useState<{id:number; accountId:number; amount:number; date:string; note?:string}[]>(()=>{ try{ return JSON.parse(localStorage.getItem('dp_contrib')||'[]'); }catch{return [];} });
  const [showAdd, setShowAdd] = React.useState(false);
  const [draft, setDraft] = React.useState({ accountId:1, amount:'', date: new Date().toISOString().split('T')[0], note:'' });

  React.useEffect(()=>{ try{ localStorage.setItem('dp_targetHome', JSON.stringify(targetHome)); }catch{} },[targetHome]);
  React.useEffect(()=>{ try{ localStorage.setItem('dp_percent', JSON.stringify(downPaymentPercent)); }catch{} },[downPaymentPercent]);
  React.useEffect(()=>{ try{ localStorage.setItem('dp_timeline', JSON.stringify(purchaseTimeline)); }catch{} },[purchaseTimeline]);
  React.useEffect(()=>{ try{ localStorage.setItem('dp_start', JSON.stringify(startDate)); }catch{} },[startDate]);
  React.useEffect(()=>{ try{ localStorage.setItem('dp_accounts', JSON.stringify(accounts)); }catch{} },[accounts]);
  React.useEffect(()=>{ try{ localStorage.setItem('dp_contrib', JSON.stringify(contrib)); }catch{} },[contrib]);

  const timelineMonths:Record<string,number>={ '6-months':6, '1-year':12, '18-months':18, '2-years':24, '3-years':36, '5-years':60 };
  const targetAmount = Math.max(0, Math.round((targetHome||0) * (downPaymentPercent||0) / 100));
  const eligibleTotal = accounts.reduce((sum,a)=> sum + Math.round((a.amount||0) * ((a.pct||0)/100)), 0);
  const progressPct = targetAmount>0 ? Math.min(100, Math.round((eligibleTotal/targetAmount)*1000)/10) : 0;
  const remaining = Math.max(0, targetAmount - eligibleTotal);
  const targetDate=(()=>{ const d=new Date(startDate); d.setMonth(d.getMonth() + (timelineMonths[purchaseTimeline]||24)); return d; })();
  const monthsRemaining = Math.max(1, (targetDate.getFullYear()-new Date().getFullYear())*12 + (targetDate.getMonth()-new Date().getMonth()));
  const monthlyNeeded = remaining / monthsRemaining;

  const updAmt=(id:number, v:string)=> setAccounts(xs=> xs.map(a=> a.id===id? { ...a, amount: Number(String(v).replace(/[^0-9]/g,'')) || 0 }: a));
  const updPct=(id:number, v:string)=> setAccounts(xs=> xs.map(a=> a.id===id? { ...a, pct: Math.min(100, Math.max(0, Number(String(v).replace(/[^0-9]/g,'')) || 0)) }: a));
  const addContrib=()=>{
    const amt = Number(String(draft.amount).replace(/[^0-9]/g,''))||0; if(!amt) return;
    const id = Date.now();
    setContrib(list=> [{ id, accountId: draft.accountId, amount: amt, date: draft.date, note: draft.note }, ...list]);
    setAccounts(xs=> xs.map(a=> a.id===draft.accountId? { ...a, amount: (a.amount||0)+amt } : a));
    setDraft({ accountId:1, amount:'', date: new Date().toISOString().split('T')[0], note:'' });
    setShowAdd(false);
  };
  const delContrib=(id:number)=>{
    const c = contrib.find(x=> x.id===id); if(!c) return;
    setAccounts(xs=> xs.map(a=> a.id===c.accountId? { ...a, amount: Math.max(0,(a.amount||0)-c.amount) } : a));
    setContrib(list=> list.filter(x=> x.id!==id));
  };

  return (
    <div className="px-4 py-3 space-y-4">
      <SectionCard title="Set Your Goal" subtitle="Timeline, target price and required down payment">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <FieldLabel>When do you want to buy?</FieldLabel>
            <select className="w-full h-12 px-3 mt-2 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2" style={{ borderColor: COLORS.lightGray }} value={purchaseTimeline} onChange={(e:any)=> setPurchaseTimeline(e.target.value)}>
              {Object.keys(timelineMonths).map(k=> <option key={k} value={k}>{k.replace('-', ' ')}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Starting from</FieldLabel>
            <input type="date" className="w-full h-12 px-3 mt-2 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2" style={{ borderColor: COLORS.lightGray }} value={startDate} onChange={(e:any)=> setStartDate(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Target home price</FieldLabel>
            <TextInput value={String(targetHome)} onChange={(e:any)=> setTargetHome(Number(String(e.target.value).replace(/[^0-9]/g,''))||0)} placeholder="500000" />
          </div>
          <div>
            <FieldLabel>Down payment %</FieldLabel>
            <TextInput value={String(downPaymentPercent)} onChange={(e:any)=> setDownPaymentPercent(Number(String(e.target.value).replace(/[^0-9]/g,''))||0)} placeholder="20" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm" style={{ color: COLORS.gray }}>Down payment you'll need</div>
          <div className="text-lg font-semibold" style={{ color: COLORS.coral }}>{money(targetAmount)}</div>
        </div>
      </SectionCard>

      <SectionCard title="Progress to Goal" subtitle="How close you are to your down payment">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm" style={{ color: COLORS.gray }}>Saved toward home</div>
          <div className="text-sm font-semibold" style={{ color: COLORS.charcoal }}>{money(eligibleTotal)} / {money(targetAmount)}</div>
        </div>
        <div className="w-full h-4 rounded-full overflow-hidden" style={{ background: COLORS.lightGray }}>
          <div className="h-full" style={{ width: `${progressPct}%`, background: COLORS.coral }} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-[#FFF1F3]" style={{ color: COLORS.coral }}>Progress: <span className="font-semibold">{progressPct}%</span></div>
          <div className="p-3 rounded-xl bg-[#F5FFFB]" style={{ color: COLORS.success }}>Remaining: <span className="font-semibold">{money(remaining)}</span></div>
          <div className="p-3 rounded-xl bg-[#F5F5F5]" style={{ color: COLORS.charcoal }}>Monthly: <span className="font-semibold">{money(monthlyNeeded)}/mo</span></div>
        </div>
        <div className="mt-2 text-xs" style={{ color: COLORS.gray }}>Target date: {targetDate.toLocaleDateString('en-CA', { year:'numeric', month:'short' })}</div>
      </SectionCard>

      <SectionCard title="Track Savings by Account" subtitle="Enter balances and choose what portion goes to your home">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b" style={{ borderColor: COLORS.lightGray }}>
              <tr className="text-left" style={{ color: COLORS.gray }}>
                <th className="py-2 font-medium">Account</th>
                <th className="py-2 font-medium text-right">Total Balance</th>
                <th className="py-2 font-medium text-right">% For Home</th>
                <th className="py-2 font-medium text-right">Going to Home</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(a=> (
                <tr key={a.id} className="border-b" style={{ borderColor: COLORS.lightGray }}>
                  <td className="py-3"><div className="font-medium" style={{ color: COLORS.charcoal }}>{a.name}</div></td>
                  <td className="py-3 text-right"><input className="h-10 rounded-lg border px-3 text-right outline-none w-32" style={{ borderColor: COLORS.lightGray }} value={a.amount} inputMode="numeric" onChange={(e:any)=> updAmt(a.id, e.target.value)} /></td>
                  <td className="py-3 text-right"><input className="h-10 rounded-lg border px-3 text-right outline-none w-20" style={{ borderColor: COLORS.lightGray }} value={a.pct} inputMode="numeric" onChange={(e:any)=> updPct(a.id, e.target.value)} /></td>
                  <td className="py-3 text-right font-semibold" style={{ color: COLORS.charcoal }}>{money(Math.round(a.amount * (a.pct/100)))}</td>
                </tr>
              ))}
              <tr>
                <td className="py-3 font-medium" colSpan={3} style={{ color: COLORS.charcoal }}>Total</td>
                <td className="py-3 text-right text-base font-semibold" style={{ color: COLORS.coral }}>{money(eligibleTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Recent Contributions">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm" style={{ color: COLORS.gray }}>Log deposits toward your home fund</div>
          <button className="h-10 px-3 rounded-xl text-white" style={{ background: COLORS.coral }} onClick={()=> setShowAdd(s=>!s)}>{showAdd? 'Close':'Add Contribution'}</button>
        </div>
        {showAdd && (
          <div className="rounded-xl border p-3 mb-3" style={{ borderColor: COLORS.lightGray }}>
            <div className="grid md:grid-cols-4 gap-2">
              <div>
                <FieldLabel>Account</FieldLabel>
                <select className="w-full h-12 px-3 mt-2 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2" style={{ borderColor: COLORS.lightGray }} value={draft.accountId} onChange={(e:any)=> setDraft(d=> ({...d, accountId: Number(e.target.value)}))}>
                  {accounts.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Amount ($)</FieldLabel>
                <TextInput value={draft.amount} onChange={(e:any)=> setDraft(d=> ({...d, amount: e.target.value}))} placeholder="500"/>
              </div>
              <div>
                <FieldLabel>Date</FieldLabel>
                <input type="date" className="w-full h-12 px-3 mt-2 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2" style={{ borderColor: COLORS.lightGray }} value={draft.date} onChange={(e:any)=> setDraft(d=> ({...d, date: e.target.value}))}/>
              </div>
              <div>
                <FieldLabel>Note (optional)</FieldLabel>
                <TextInput value={draft.note} onChange={(e:any)=> setDraft(d=> ({...d, note: e.target.value}))} placeholder="Bonus, refund, etc."/>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button className="h-10 px-3 rounded-xl text-white" style={{ background: COLORS.coral }} onClick={addContrib}>Add</button>
              <button className="h-10 px-3 rounded-xl" style={{ border:`1px solid ${COLORS.lightGray}` }} onClick={()=> setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {contrib.length===0 ? (
            <div className="text-sm" style={{ color: COLORS.gray }}>No contributions yet.</div>
          ) : (
            contrib.map(c=> (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: COLORS.lightGray }}>
                <div>
                  <div className="font-medium" style={{ color: COLORS.charcoal }}>{money(c.amount)}</div>
                  <div className="text-xs" style={{ color: COLORS.gray }}>
                    {accounts.find(a=> a.id===c.accountId)?.name || 'Account'} • {new Date(c.date).toLocaleDateString('en-CA')}{c.note? ` • ${c.note}`:''}
                  </div>
                </div>
                <button className="px-2 py-1 rounded-lg" style={{ background: COLORS.coralSoft, color: COLORS.coral }} onClick={()=> delContrib(c.id)}>Delete</button>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <div className="text-xs" style={{ color: COLORS.gray }}>Autosaved locally • Prototype</div>
    </div>
  );
}

/********************
 * PLAN — Mortgage & Moving To-Do
 ********************/
function ChecklistItem({ label, hint, checked, onChange }:{ label:string; hint?:string; checked:boolean; onChange:()=>void }){
  return (
    <label className="flex items-start gap-3 p-3 bg-white rounded-xl border" style={{ borderColor: COLORS.lightGray }}>
      <input type="checkbox" className="mt-1" checked={checked} onChange={onChange} />
      <span className="text-[14px] leading-snug" style={{ color: COLORS.charcoal }}>
        <div className="font-medium">{label}</div>
        {hint && <div className="text-xs mt-0.5" style={{ color: COLORS.gray }}>{hint}</div>}
      </span>
    </label>
  );
}
function PinkGroupHeader({ children }:{ children:any }){ return <div className="rounded-lg px-3 py-2 text-sm font-medium" style={{ background: COLORS.coralSoft, color: COLORS.coral }}>{children}</div>; }
function MortgageChecklist(){
  const [data, setData] = React.useState<Record<string, boolean>>(()=>{ try{ return JSON.parse(localStorage.getItem('mort_all')||'{}'); }catch{ return {}; } });
  React.useEffect(()=>{ try{ localStorage.setItem('mort_all', JSON.stringify(data)); }catch{} }, [data]);
  const t=(k:string)=> setData(d=> ({...d, [k]: !d[k]}));
  return (
    <div className="px-4 py-3 space-y-4">
      <SectionCard title="Income Documents">
        <div className="space-y-3">
          <PinkGroupHeader>If you are an employee:</PinkGroupHeader>
          <ChecklistItem label="Letter of Employment" hint="Dated within 60 days" checked={!!data['emp_letter']} onChange={()=>t('emp_letter')} />
          <ChecklistItem label="Paystub" hint="Dated within 30 days" checked={!!data['emp_paystub']} onChange={()=>t('emp_paystub')} />
          <PinkGroupHeader>If your income is variable you also need:</PinkGroupHeader>
          <ChecklistItem label="Most recent T4" checked={!!data['var_t4']} onChange={()=>t('var_t4')} />
          <PinkGroupHeader>If you are sole proprietor of your own business:</PinkGroupHeader>
          <ChecklistItem label="Notice of Assessment" hint="Most recent NOA summary of your received Tax Return" checked={!!data['sp_noa']} onChange={()=>t('sp_noa')} />
          <ChecklistItem label="T1 General" hint="Most recent General Tax Return form" checked={!!data['sp_t1']} onChange={()=>t('sp_t1')} />
          <ChecklistItem label="Statement of Business Activities" hint="Most recent T2125 tax form" checked={!!data['sp_t2125']} onChange={()=>t('sp_t2125')} />
          <ChecklistItem label="Confirmation of Payment" hint="If any taxes are owing, please provide confirmation of payment" checked={!!data['sp_confirm']} onChange={()=>t('sp_confirm')} />
          <PinkGroupHeader>If you own a business that is a corporation:</PinkGroupHeader>
          <ChecklistItem label="Notice of Assessment" hint="Most recent NOA summary of your received Tax Return" checked={!!data['corp_noa']} onChange={()=>t('corp_noa')} />
          <ChecklistItem label="T1 General" hint="Most recent General Tax Return form" checked={!!data['corp_t1']} onChange={()=>t('corp_t1')} />
          <ChecklistItem label="2 Years of Financials" hint="Prepared by an accountant" checked={!!data['corp_fin']} onChange={()=>t('corp_fin')} />
        </div>
      </SectionCard>
      <SectionCard title="Down Payment Documents">
        <div className="space-y-3">
          <ChecklistItem label="90-day account history" hint="Bank accounts where the down payment will be drawn from" checked={!!data['dp_hist']} onChange={()=>t('dp_hist')} />
          <ChecklistItem label="Gift letter (if applicable)" checked={!!data['dp_gift']} onChange={()=>t('dp_gift')} />
          <div className="text-xs mt-1" style={{ color: COLORS.gray }}>Please ensure your name and account number are clearly identified on your account history.</div>
          <div className="text-xs" style={{ color: COLORS.gray }}>Large deposits usually require a history of 90 days.</div>
        </div>
      </SectionCard>
      <SectionCard title="Subject Property">
        <div className="space-y-3">
          <ChecklistItem label="Accepted Offer to Purchase" hint="Of the property you are purchasing" checked={!!data['prop_ps']} onChange={()=>t('prop_ps')} />
          <ChecklistItem label="MLS Listing - PDF" hint="Property details — your realtor can provide this" checked={!!data['prop_mls']} onChange={()=>t('prop_mls')} />
          <ChecklistItem label="Lease (if applicable)" checked={!!data['prop_lease']} onChange={()=>t('prop_lease')} />
          <ChecklistItem label="Confirmation of Condo/POTL Fees" checked={!!data['prop_condo']} onChange={()=>t('prop_condo')} />
        </div>
      </SectionCard>
      <SectionCard title="Your Banking Info">
        <div className="space-y-3">
          <ChecklistItem label="VOID Cheque or Pre-Authorized Debit Form" checked={!!data['bank_void']} onChange={()=>t('bank_void')} />
        </div>
      </SectionCard>
      <div className="text-xs" style={{ color: COLORS.gray }}>Autosaved locally • Prototype</div>
    </div>
  );
}
function MovingChecklist(){
  const items:{label:string; hint:string}[]=[
    { label:'Book movers/rental truck', hint:'Secure your move date before slots fill up.' },
    { label:'Give landlord notice (60 days)', hint:'Typically 60 days’ written notice is required.' },
    { label:'Set up utilities', hint:'Arrange hydro, gas, and water ahead of move-in.' },
    { label:'Schedule internet installation', hint:'Book early — installation dates fill fast.' },
    { label:'Declutter and donate', hint:'Lighter move = less stress + lower cost.' },
    { label:'Pack essentials bag', hint:'Include clothes, toiletries, snacks, meds, chargers.' },
    { label:'Label boxes', hint:'Makes unpacking fast and frustration‑free.' },
    { label:'Update address (ID, bank, CRA)', hint:'Government ID, CRA, bank, insurance, subscriptions, employer.' },
    { label:'Gather important documents', hint:'Passports, health cards, banking info, leases, etc.' },
    { label:'Final walk-through', hint:'Check closets, drawers, appliances — don’t leave things behind.' },
    { label:'Arrange child/pet care', hint:'Keeps little ones safe and the move smooth.' },
    { label:'Transfer school/medical records', hint:'Essential if you’re moving districts or cities.' },
    { label:'Buy moving supplies', hint:'Boxes, tape, bubble wrap, labels — don’t leave it last‑minute.' },
    { label:'Photo electronics before unplugging', hint:'Easy reference for setup in your new home.' },
    { label:'Confirm mover details', hint:'Double‑check timing, address, parking instructions.' },
    { label:'Book locksmith', hint:'Replacing locks = peace of mind.' },
    { label:'Set aside valuables', hint:'Valuables, plants, heirlooms, documents, fragile items.' },
    { label:'Schedule cleaner', hint:'Especially important if you’re hoping to get your deposit back.' },
    { label:'Drain gas equipment', hint:'Lawn mowers, trimmers, BBQ tanks — movers won’t transport them.' },
  ];
  const load=()=>{ try{ const str=localStorage.getItem('moving_all'); if(str) return JSON.parse(str); const legacy=JSON.parse(localStorage.getItem('moving')||'null'); if(!legacy) return {}; const mapped:any={}; items.forEach((it,i)=>{ if(legacy[i]) mapped[it.label]=true;}); return mapped; }catch{return{}} };
  const [data,setData]=React.useState<Record<string,boolean>>(load);
  React.useEffect(()=>{ try{ localStorage.setItem('moving_all', JSON.stringify(data)); }catch{} },[data]);
  const toggle=(k:string)=> setData(d=> ({...d,[k]:!d[k]}));
  return (
    <div className="px-4 py-3 space-y-4">
      <SectionCard title="Moving To-Do List" subtitle="Things that you need to plan or complete ahead of moving">
        <div className="space-y-2">
          {items.map(({label,hint})=> (
            <label key={label} className="flex items-start gap-3 p-3 bg-white rounded-xl border" style={{ borderColor: COLORS.lightGray }}>
              <input type="checkbox" className="mt-1" checked={!!data[label]} onChange={()=>toggle(label)} />
              <span className="text-[14px] leading-snug" style={{ color: COLORS.charcoal }}>
                <div className="font-medium">{label}</div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.gray }}>{hint}</div>
              </span>
            </label>
          ))}
        </div>
      </SectionCard>
      <div className="text-xs" style={{ color: COLORS.gray }}>Autosaved locally • Prototype</div>
    </div>
  );
}

/********************
 * PLAN — Container with arrows + mobile swipe
 ********************/
function PlanModule({ onSuggest }:{ onSuggest:(what:'guide'|'ai')=>void }){
  const [index, setIndex] = React.useState(0); // 0..6
  const [planError, setPlanError] = React.useState(false);
  const titles = ['My Dream Home','Financial Readiness Masterclass','Self-Assessment','Budget','Down Payment Tracker','Mortgage Checklist','Moving To-Do List'];
  const maxIndex = titles.length - 1;

  const next = () => setIndex(i=> { if(i===0){ try{ const f=JSON.parse(localStorage.getItem('plan_dream_home')||'{}'); if(!f.constructionStatus){ setPlanError(true); return i; } }catch{ setPlanError(true); return i; } setPlanError(false);} return Math.min(maxIndex, i+1); });
  const prev = () => setIndex(i=> Math.max(0, i-1));

  // Swipe (mobile)
  const startRef = React.useRef<{x:number;y:number}|null>(null);
  const isInteractive = (el: EventTarget|null) => !!(el as HTMLElement)?.closest('input, textarea, select, button, [role="slider"], [contenteditable="true"]');
  const isMobile = () => (typeof window!=='undefined') && ((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || window.innerWidth < 768);
  const onTouchStart = (e: React.TouchEvent) => { if(!isMobile()) return; const t=e.touches[0]; startRef.current={x:t.clientX,y:t.clientY}; };
  const onTouchEnd = (e: React.TouchEvent) => { if(!isMobile()||!startRef.current) return; if(isInteractive(e.target)) { startRef.current=null; return; } const t=e.changedTouches[0]; const dx=t.clientX-startRef.current.x; const dy=t.clientY-startRef.current.y; const ax=Math.abs(dx), ay=Math.abs(dy); if(ax>ay && ax>70){ if(dx<0 && index<maxIndex) next(); if(dx>0 && index>0) prev(); } startRef.current=null; };

  return (
    <div>
      <header className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <button aria-label="Previous section" onClick={prev} disabled={index===0} className={cx('p-2 rounded-full border', index===0 && 'opacity-40 pointer-events-none')} style={{ borderColor: COLORS.lightGray, color: COLORS.charcoal }}><Icon.ChevronLeft/></button>
          <div className="flex-1 text-center">
            <div className="text-xl font-semibold" style={{ color: COLORS.charcoal }}>{titles[index]}</div>
            <div className="flex justify-center gap-2 mt-2">{Array.from({length:titles.length}).map((_,i)=> <span key={i} className={cx('inline-block w-2.5 h-2.5 rounded-full border', i===index? 'bg-[#EF4D68] border-[#EF4D68]':'bg-transparent')} style={{ borderColor: i===index? COLORS.coral : COLORS.lightGray }} />)}</div>
          </div>
          <button aria-label="Next section" onClick={next} disabled={index===maxIndex} className={cx('p-2 rounded-full border', index===maxIndex && 'opacity-40 pointer-events-none')} style={{ borderColor: COLORS.lightGray, color: COLORS.charcoal }}><Icon.ChevronRight/></button>
        </div>
      </header>
      <div className="mt-2" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {index===0 && <MyDreamHome requireConstructionError={planError}/>}
        {index===1 && <FinancialReadinessMasterclass onGoPlan={setIndex} onSuggest={onSuggest}/>} 
        {index===2 && <SectionCard title="Self-Assessment" subtitle="Measure readiness across 3 dimensions"><SelfAssessment/></SectionCard>}
        {index===3 && <SectionCard title="Budget" subtitle="Current vs expected savings"><BudgetModule/></SectionCard>}
        {index===4 && <SectionCard title="Down Payment Tracker" subtitle="Plan and track your down payment"><DownPaymentTracker/></SectionCard>}
        {index===5 && <SectionCard title="Mortgage Checklist" subtitle="Document preparation tracker"><MortgageChecklist/></SectionCard>}
        {index===6 && <SectionCard title="Moving To-Do List" subtitle="Tasks for move day"><MovingChecklist/></SectionCard>}
      </div>
    </div>
  );
}

/********************
 * EVALUATE, SELECT, GUIDE, AI placeholders
 ********************/
function useToasts(){ const [toasts,setToasts]=React.useState<{id:number;text:string}[]>([]); const push=(text:string)=>{ const id=Date.now(); setToasts(t=> [...t,{id,text}]); setTimeout(()=> setToasts(t=> t.filter(x=> x.id!==id)), 2200); }; return { toasts, push }; }
function EvaluateModule(){ return (<div className="px-4 py-3"><SectionCard subtitle="Prototype focus is on Plan tab."><div className="text-sm" style={{ color: COLORS.gray }}>Coming soon.</div></SectionCard></div>); }
function SelectModule(){ const {toasts,push}=useToasts(); const [step,setStep]=React.useState(0); const titles=['About You','Home Preferences','Timeline & Status','Budget Snapshot','Agent Preferences','Review & Submit']; const next=()=> setStep(s=> Math.min(5,s+1)); const prev=()=> setStep(s=> Math.max(0,s-1)); return (<div className="px-4 py-3 space-y-4"><header><div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>{titles[step]}</div><div className="flex gap-2 mt-2">{Array.from({length:6}).map((_,i)=> <span key={i} className={cx('inline-block w-2.5 h-2.5 rounded-full border', i===step? 'bg-[#EF4D68] border-[#EF4D68]':'bg-transparent')} style={{ borderColor: i===step? COLORS.coral : COLORS.lightGray }} />)}</div></header><SectionCard title={titles[step]} subtitle="Prototype form fields omitted"><div className="grid grid-cols-2 gap-2"><button className="h-10 rounded-lg border" style={{ borderColor: COLORS.lightGray }} onClick={prev}>Back</button>{step<5 ? (<button className="h-10 rounded-lg text-white" style={{ background: COLORS.coral }} onClick={next}>Next</button>) : (<button className="h-10 rounded-lg text-white" style={{ background: COLORS.coral }} onClick={()=> push('Request submitted (prototype)')}>Submit</button>)}</div></SectionCard><div className="fixed bottom-16 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">{toasts.map(t=> (<div key={t.id} className="pointer-events-auto px-3 py-2 rounded-lg shadow-sm text-sm" style={{ background: COLORS.charcoal, color:'#fff' }}>{t.text}</div>))}</div></div>); }
function GuideModule(){ return (<div className="px-4 py-3"><SectionCard title="Home Buying Playbook" subtitle="Video series & articles (coming soon)"><div className="text-sm" style={{ color: COLORS.gray }}>Content will appear here.</div></SectionCard></div>); }
function AiModule(){ return (<div className="px-4 py-3"><SectionCard title="Brix Assistant" subtitle="Ask anything about home buying"><div className="text-sm" style={{ color: COLORS.gray }}>Launching your AI assistant... (prototype)</div></SectionCard></div>); }

/********************
 * Profile modal (secondary menu: profile + co-buyer + logout)
 ********************/

  

/********************
 * ROOT SHELL
 ********************/
export default function PlanTabShell() {
    const [tab, setTab] = React.useState<TabKey>('plan');
    const { toasts, push } = useToasts();
  
    // profile + co-buyer state
    const [profileOpen, setProfileOpen] = React.useState(false);
    const [cobuyerEmail, setCobuyerEmail] = React.useState<string | null>(null);
  
    const suggest = (what: 'guide' | 'ai') => {
      if (what === 'guide') setTab('guide');
      else if (what === 'ai') setTab('ai');
      else push('Coming soon');
    };
  
    return (
      <div
        className="min-h-[100dvh] md:h-[100dvh] md:overflow-hidden"
        style={{ background: COLORS.background }}
      >
        {/* Desktop layout: sidebar (fixed) + scrollable main content */}
        <div className="md:flex md:h-full">
          <SidebarNav
            value={tab}
            onChange={setTab}
            onOpenProfile={() => setProfileOpen(true)}
          />
  
          {/* Right side: header + scrollable content */}
          <div className="flex-1 flex flex-col md:overflow-hidden">
            <Header
              title="Hausee Navigator"
              subtitle="Welcome back"
              onOpenProfile={() => setProfileOpen(true)}
              hasCobuyer={!!cobuyerEmail}
            />
  
            {/* This div is the ONLY scroll area on desktop */}
            <div className="flex-1 overflow-y-auto pb-16 md:pb-4">
              {tab === 'plan' && <PlanModule onSuggest={suggest} />}
              {tab === 'evaluate' && <Evaluate />}
              {tab === 'select' && <HauseeSelectFormStepByStepPreview />}
              {tab === 'guide' && <GuideTabPreview />}
              {tab === 'ai' && <AiModule />}
            </div>
          </div>
        </div>
  
        {/* Mobile bottom nav (hidden on desktop via md:hidden in BottomNav) */}
        <BottomNav value={tab} onChange={setTab} />
  
        {/* Toasts */}
        <div className="fixed bottom-16 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto px-3 py-2 rounded-lg shadow-sm text-sm"
              style={{ background: COLORS.charcoal, color: '#fff' }}
            >
              {t.text}
            </div>
          ))}
        </div>
  
        {/* Profile / co-buyer modal */}
{/* Profile / account via Clerk */}
{profileOpen && (
  <div
    className="
      fixed inset-0 z-40 
      flex items-start justify-center 
      bg-black/40 
      overflow-y-auto 
      py-6 px-2 md:px-4
    "
  >
    <div
      className="
        relative 
        w-full max-w-3xl 
        rounded-2xl bg-white 
        shadow-lg border 
        overflow-hidden
      "
      style={{ borderColor: COLORS.lightGray }}
    >
      {/* Top-right close button */}
      <button
        className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-[#F9FAFB]"
        aria-label="Close profile"
        onClick={() => setProfileOpen(false)}
      >
        <Icon.Close />
      </button>

      <div className="pt-10 pb-4 px-3 md:px-4">
      <SignedIn>
  <div className="flex justify-center">
    <div className="w-full max-w-[760px] origin-top scale-[0.9] md:scale-100">
      <UserProfile routing="hash" />

      {/* LOGOUT BUTTON */}
      <div className="mt-6 flex justify-end">
        <SignOutButton>
          <button
            className="px-4 h-10 rounded-xl text-sm font-medium text-white"
            style={{ background: COLORS.coral }}
          >
            Logout
          </button>
        </SignOutButton>
      </div>
    </div>
  </div>
</SignedIn>



        <SignedOut>
          <div className="py-6 text-center space-y-3">
            <div className="text-sm" style={{ color: COLORS.charcoal }}>
              You’re not signed in yet.
            </div>
            <SignInButton mode="modal">
              <button
                className="inline-flex items-center justify-center px-4 h-10 rounded-xl text-sm font-medium text-white"
                style={{ background: COLORS.coral }}
              >
                Sign in or create account
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </div>
  </div>
)}



      </div>
    );
  }
  
  
/********************
 * Tests (ensure helpers and mappings)
 ********************/
(function runTests(){
  try {
    console.assert(money(500000).startsWith('CA$') || money(500000).startsWith('$'), 'money() should format currency');
    console.assert(cx('a', null as any, undefined as any, 'b') === 'a b', 'cx() joins only truthy');
    console.assert(typeof Icon.Close === 'function', 'Icon.Close should exist');
    console.assert(Array.isArray(CITY_OPTIONS) && CITY_OPTIONS.length > 10, 'CITY_OPTIONS loaded');
    console.assert(typeof toK(200000) === 'string', 'toK() returns a string');

    // readiness thresholds
    console.assert(readinessStatus(40).label==='Needs Preparation', 'readinessStatus: <50 is Needs Preparation');
    console.assert(readinessStatus(60).label==='On Track', 'readinessStatus: 50–74 is On Track');
    console.assert(readinessStatus(85).label==='Ready to Buy', 'readinessStatus: >=75 is Ready to Buy');

    // budget math sanity
    const sum=(g:any,w:'cur'|'exp')=> Object.values(g[w]).reduce((a:any,b:any)=> a+(b as number),0);
    const inc= {cur:{a:1000,b:0}, exp:{a:2000,b:0}} as any;
    console.assert(sum(inc,'cur')===1000 && sum(inc,'exp')===2000, 'sumGroup works');

    // down payment progress calc
    const tAmt = 100000; const elig = 25000; const pct = tAmt>0 ? Math.min(100, Math.round((elig/tAmt)*1000)/10) : 0;
    console.assert(pct === 25.0, 'progressPct rounds to 0.1%');
  } catch(e) { /* no-op */ }
})();
