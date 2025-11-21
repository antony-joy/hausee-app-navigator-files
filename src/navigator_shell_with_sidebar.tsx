import * as React from 'react';

// --- THEME ---
const COLORS = {
  coral: '#EF4D68',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  charcoal: '#293847',
  background: '#F9FAFB'
};

function cx(...xs){ return xs.filter(Boolean).join(' '); }

// --- ICONS (Plan shell style placeholders) ---
const Icon = {
  Calendar: (p:any) => <span {...p}>📅</span>,
  Search: (p:any) => <span {...p}>🔍</span>,
  Home: (p:any) => <span {...p}>🏠</span>,
  Book: (p:any) => <span {...p}>📘</span>,
  Chat: (p:any) => <span {...p}>💬</span>,
  Settings: (p:any) => <span {...p}>⚙️</span>,
  Close: (p:any) => <span {...p}>×</span>,
};

// --- TABS ---
const TABS = [
  { key:'plan', label:'Plan', icon: Icon.Calendar },
  { key:'evaluate', label:'Evaluate', icon: Icon.Search },
  { key:'select', label:'Select', icon: Icon.Home },
  { key:'guide', label:'Guide', icon: Icon.Book },
  { key:'ai', label:'AI', icon: Icon.Chat },
];

// --- Header ---
function Header({ title, subtitle }){
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b" style={{borderColor:COLORS.lightGray}}>
      <div className="px-4 py-3 flex items-center">
        <div className="flex-1 text-center">
          <div className="text-base font-semibold" style={{color:COLORS.charcoal}}>{title}</div>
          {subtitle && <div className="text-xs" style={{color:COLORS.gray}}>{subtitle}</div>}
        </div>
        <div className="absolute right-4 top-3 flex items-center gap-2">
          <button className="p-2 rounded-lg" aria-label="Close"><Icon.Close/></button>
          {/* Settings hidden on desktop */}
          <button className="p-2 rounded-lg md:hidden" aria-label="Settings"><Icon.Settings/></button>
        </div>
      </div>
    </div>
  );
}

// --- MOBILE BOTTOM NAV ---
function BottomNav({ value, onChange }){
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t md:hidden" style={{borderColor:COLORS.lightGray}}>
      <div className="grid grid-cols-5">
        {TABS.map(t => {
          const Active = t.icon;
          const active = value===t.key;
          return (
            <button key={t.key} className="py-2 flex flex-col items-center gap-1" onClick={()=>onChange(t.key)}>
              <Active style={{color: active? COLORS.coral: COLORS.gray}} />
              <span className="text-[11px]" style={{color: active? COLORS.coral: COLORS.gray}}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// --- DESKTOP SIDEBAR (COLLAPSIBLE) ---
function SidebarNav({ value, onChange }){
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside className={cx('hidden md:flex md:flex-col md:h-[100dvh] border-r bg-white transition-all', collapsed?'md:w-16':'md:w-60')} style={{borderColor:COLORS.lightGray}}>

      <div className="flex items-center justify-between px-3 py-3 border-b" style={{borderColor:COLORS.lightGray}}>
        {!collapsed && <div className="text-sm font-semibold" style={{color:COLORS.charcoal}}>Hausee Navigator</div>}
        <button className="h-8 w-8 flex items-center justify-center rounded-lg border" style={{borderColor:COLORS.lightGray}} onClick={()=>setCollapsed(c=>!c)}>
          {collapsed ? '›':'‹'}
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1">
        {TABS.map(t=>{
          const IconComp = t.icon;
          const active = value===t.key;
          return (
            <button key={t.key} className={cx('w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm', active?'bg-[#FFF1F3]':'hover:bg-[#F9FAFB]')} onClick={()=>onChange(t.key)} style={{color: active? COLORS.coral: COLORS.charcoal}}>
              <IconComp />
              {!collapsed && <span>{t.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t" style={{borderColor:COLORS.lightGray}}>
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm hover:bg-[#F9FAFB]" style={{color:COLORS.gray}}>
          <Icon.Settings />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

    </aside>
  );
}

// Placeholder modules
function PlanModule(){ return <div className="p-4">Plan content…</div>; }
function EvaluateModule(){ return <div className="p-4">Evaluate content…</div>; }
function SelectModule(){ return <div className="p-4">Select content…</div>; }
function GuideModule(){ return <div className="p-4">Guide content…</div>; }
function AiModule(){ return <div className="p-4">AI content…</div>; }

// --- APP ---
export default function App(){
  const [tab, setTab] = React.useState('plan');

  return (
    <div className="min-h-[100dvh]" style={{background:COLORS.background}}>
      <div className="md:flex md:h-[100dvh]">
        <SidebarNav value={tab} onChange={setTab}/>

        <div className="flex-1 pb-16 md:pb-0">
          <Header title="Hausee Navigator" subtitle="Welcome back" />

          {tab==='plan' && <PlanModule/>}
          {tab==='evaluate' && <EvaluateModule/>}
          {tab==='select' && <SelectModule/>}
          {tab==='guide' && <GuideModule/>}
          {tab==='ai' && <AiModule/>}
        </div>
      </div>

      <BottomNav value={tab} onChange={setTab}/>
    </div>
  );a
}
