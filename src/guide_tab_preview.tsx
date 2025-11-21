import * as React from 'react';

const COLORS = {
  coral: '#EF4D68',
  coralSoft: '#FFF1F3',
  charcoal: '#293847',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
};

function SectionCard({ title, subtitle, children }) {
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

export default function GuidePreview(){
  const modules = [
    {
      key: "m1",
      title: "Module 1: Knowing if You Are Ready",
      lessons: [
        "Overview of Home Buying and Ownership",
        "Buy a Home or Continue Renting",
        "Sizing Up Homeownership",
      ],
    },
    {
      key: "m2",
      title: "Module 2: Preparing for Homeownership",
      lessons: [
        "Getting Your Financial House in Order",
        "Growing Your Savings",
        "Understanding and Improving Your Credit Score",
        "Estimating What You Can Afford",
        "Understanding What Drives Home Prices",
      ],
    },
    {
      key: "m3",
      title: "Module 3: Understanding the Mortgage Process",
      lessons: [
        "Determining What Size Mortgage You Can Carry",
        "Understanding and Selecting a Mortgage",
        "Discovering a Lender",
        "Choosing a Lender",
        "Mortgage Challenges and Required Documents",
      ],
    },
    {
      key: "m4",
      title: "Module 4: Shopping for a Home",
      lessons: [
        "Understanding Types of Homes",
        "What Home You Buy",
        "Selecting Your Home",
        "Where to Buy",
        "Selecting Real Estate Professionals",
        "What’s It Worth?",
      ],
    },
    {
      key: "m5",
      title: "Module 5: Making the Deal",
      lessons: [
        "Making an Offer",
        "Inspecting your home",
        "Protecting Your Home",
        "Closing the Deal",
      ],
    },
  ];

  const [progress, setProgress] = React.useState(()=>{
    try{return JSON.parse(localStorage.getItem('guide_progress')||'{}');}catch{return {};} 
  });
  React.useEffect(()=>{ try{ localStorage.setItem('guide_progress', JSON.stringify(progress)); }catch{} },[progress]);

  // Notes per lesson (persisted)
  const [notes, setNotes] = React.useState(()=>{
    try { return JSON.parse(localStorage.getItem('guide_notes')||'{}'); } catch { return {}; }
  });
  React.useEffect(()=>{ try{ localStorage.setItem('guide_notes', JSON.stringify(notes)); }catch{} }, [notes]);
  const getNote = (m,l)=> (notes[keyFor(m,l)] || '');
  const setNote = (m,l,val)=> setNotes(n=> ({...n, [keyFor(m,l)]: val}));

  const keyFor=(m,l)=>`${m}::${l}`;
  const toggleDone=(m,l)=>{const k=keyFor(m,l); setProgress(p=>({...p,[k]:!p[k]}));};
  const isDone=(m,l)=>!!progress[keyFor(m,l)];
  const countDone=(m,ls)=>ls.reduce((a,l)=>a+(isDone(m,l)?1:0),0);

  const DoneToggle=({checked,onClick})=>(
    <button className="px-2 py-1 rounded-lg text-xs" style={{background:checked?COLORS.coral:'#F3F4F6',color:checked?'#fff':COLORS.charcoal,border:`1px solid ${checked?COLORS.coral:COLORS.lightGray}`}} onClick={onClick}>{checked?'✓ Done':'Mark Done'}</button>
  );

  return (
    <div className="px-4 py-3 space-y-4 bg-[#F9FAFB] min-h-screen">
      <SectionCard title="Renter to Owner: Home Buying Playbook" subtitle="Video lesson series">
        <div className="space-y-3">
          {modules.map(mod=>(
            <details key={mod.key} open className="rounded-xl border p-3" style={{borderColor:COLORS.lightGray}}>
              <summary className="cursor-pointer flex items-center justify-between font-medium" style={{color:COLORS.charcoal}}>
                <span>{mod.title}</span>
                <span className="ml-2 text-xs rounded-full px-2 py-0.5" style={{background:COLORS.coralSoft,color:COLORS.coral}}>{countDone(mod.key,mod.lessons)}/{mod.lessons.length}</span>
              </summary>
              <ul className="mt-2 space-y-1 text-sm">
                {mod.lessons.map(lesson => (
                  <details key={lesson} className="border-b py-2" style={{borderColor:COLORS.lightGray}}>
                    <summary className="flex items-center justify-between cursor-pointer">
                      <span style={{color:COLORS.gray}}>{lesson}</span>
                      <DoneToggle checked={isDone(mod.key,lesson)} onClick={()=>toggleDone(mod.key,lesson)}/>
                    </summary>
                    <div className="mt-2 rounded-xl border p-3 bg-white" style={{borderColor:COLORS.lightGray}}>
                      <div className="aspect-video rounded-lg bg-[#F5F5F5] grid place-items-center text-xs" style={{color:COLORS.gray}}>
                        Video Placeholder — {mod.title} — {lesson}
                      </div>
                      <div className="mt-2 text-xs" style={{color:COLORS.gray}}>
                        Prototype inline player. In production, this area embeds the private video and optional notes/resources.
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-medium" style={{color: COLORS.charcoal}}>Your notes</label>
                        <textarea
                          className="w-full min-h-[96px] p-3 mt-1 rounded-xl bg-[#F5F5F5] border outline-none focus:ring-2"
                          style={{ borderColor: COLORS.lightGray }}
                          value={getNote(mod.key, lesson)}
                          onChange={e=> setNote(mod.key, lesson, e.target.value)}
                          placeholder="Jot down key takeaways, action items, or questions..."
                        />
                        <div className="text-[11px] mt-1" style={{color: COLORS.gray}}>Autosaved locally</div>
                      </div>
                    </div>
                  </details>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </SectionCard>

      <div className="text-xs text-gray-500">Autosaved locally • Prototype</div>
    </div>
  );
}
