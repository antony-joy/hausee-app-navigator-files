// Evaluate Tab With Inspection — stable full Inspection view with inline Expand/Collapse + Back-to-top
// Fixes: blank screen (was defaulting to non-rendered tab), restores full accordion, badges, progress, filters.
import * as React from 'react';
import { useSwipeable } from 'react-swipeable';

export default function EvaluateTabWithInspectionPreview() {
  const COLORS = { coral: '#EF4D68', lightGray: '#E5E7EB', gray: '#6B7280', charcoal: '#111827' } as const;
  const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

  // Make sure something renders: default to Inspection
  const [activeTab, setActiveTab] = React.useState<'browse' | 'compare' | 'inspection'>('inspection');
  const [homes, setHomes] = React.useState([{ id: '1', address: '100 Street Avenue', eval: {} as Record<string, any> }]);
  const [inspectionTargetId, _setInspectionTargetId] = React.useState<string | null>(() => {
    try { return JSON.parse(localStorage.getItem('inspectionTargetId') || '"1"'); } catch { return '1'; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('inspectionTargetId', JSON.stringify(inspectionTargetId)); } catch {}
  }, [inspectionTargetId]);

  const clearInspectionForHome = (home: {id:string; address:string; eval: Record<string, any>}) => {
    const evalObj = { ...(home.eval || {}) };
    Object.keys(evalObj).forEach(k => { if (k.startsWith('Inspection:')) delete evalObj[k]; });
    return { ...home, eval: evalObj };
  };

  const setInspectionTarget = (newId: string) => {
    setHomes(list => {
      const prevId = inspectionTargetId;
      return list.map(h => {
        if (prevId && h.id === prevId) {
          const cleared = clearInspectionForHome(h);
          return { ...cleared, eval: { ...(cleared.eval || {}), 'Inspection:flagged': false } };
        }
        if (h.id === newId) {
          const clearedNew = clearInspectionForHome(h);
          return { ...clearedNew, eval: { ...(clearedNew.eval || {}), 'Inspection:flagged': true } };
        }
        return h;
      });
    });
    _setInspectionTargetId(newId);
    setActiveTab('inspection');
  };

  const InspectionView: React.FC = () => {
    const targetHome = homes.find(h => h.id === inspectionTargetId);
    if (!targetHome) {
      return (
        <div className="p-4 rounded-2xl border bg-white text-sm" style={{ borderColor: COLORS.lightGray }}>
          No inspection home selected. From Browse, click <b>Mark for Inspection</b> on a home.
        </div>
      );
    }

    // accessors for values, notes, photos
    const getVal = (section: string, itemKey: string) => (targetHome.eval || {})[`Inspection:${section}:${itemKey}`] || '';
    const setVal = (section: string, itemKey: string, v: 'Good' | 'Fix' | 'Replace') => setHomes(list => list.map(h => h.id === targetHome.id ? { ...h, eval: { ...(h.eval || {}), [`Inspection:${section}:${itemKey}`]: v } } : h));
    const getItemNote = (section: string, itemKey: string) => (targetHome.eval || {})[`Inspection:${section}:${itemKey}:note`] || '';
    const setItemNote = (section: string, itemKey: string, v: string) => setHomes(list => list.map(h => h.id === targetHome.id ? { ...h, eval: { ...(h.eval || {}), [`Inspection:${section}:${itemKey}:note`]: v } } : h));
    const getPhotos = (section: string) => (targetHome.eval || {})[`Inspection:${section}:photos`] || [] as {id:number;dataURL:string}[];
    const setPhotos = (section: string, arr: {id:number;dataURL:string}[]) => setHomes(list => list.map(h => h.id === targetHome.id ? { ...h, eval: { ...(h.eval || {}), [`Inspection:${section}:photos`]: arr } } : h));

    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const photos = getPhotos(section);
      const updated = [...photos];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          updated.push({ id: Date.now() + Math.floor(Math.random() * 1e6), dataURL: String(reader.result) });
          setPhotos(section, updated);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    };

    const PhotoUploader: React.FC<{ section: string }> = ({ section }) => {
      const photos = getPhotos(section);
      return (
        <div className="mt-4 border rounded-lg p-4 text-center" style={{ borderColor: COLORS.lightGray }}>
          <div className="text-sm text-gray-500 mb-2">Drag images here or</div>
          <label className="cursor-pointer text-[#EF4D68] text-sm font-medium flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-6L12 3m0 0l4.5 7.5M12 3v13.5" />
            </svg>
            Upload Images
            <input
              type="file"
              accept="image/*"
              capture={isMobile ? ('environment' as any) : undefined}
              multiple
              className="hidden"
              onChange={(e) => handleFileInput(e, section)}
            />
          </label>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map(p => (
                <div key={p.id} className="relative">
                  <img src={p.dataURL} alt="Upload" className="w-full h-20 object-cover rounded-lg border" style={{ borderColor: COLORS.lightGray }} />
                  <button className="absolute top-1 right-1 bg-white border rounded text-[11px] px-1" onClick={() => setPhotos(section, photos.filter(ph => ph.id !== p.id))}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    // --- Full DIY checklist sections
    const SECTIONS = [
      { key: 'Bathroom', title: 'BATHROOM', hint: 'Check for water issues, cleanliness, and function of fixtures.', items: [
        'Floors, walls, and ceiling look straight and clean — no cracks, stains, or mold.',
        'Toilet flushes properly and refills quickly.',
        'Toilet feels stable and doesn’t rock when you sit on it.',
        'No water stains or leaks around the toilet base.',
        'Caulking around the tub, shower, and sink looks complete — not cracked or peeling.',
        'Water from faucets and shower has steady pressure.',
        'Sink, shower, and tub drain quickly without backing up.',
        'No loose or missing tiles.',
        'Cabinets under the sink are clean and dry — no leaks or damage.',
        'Bathroom fan turns on and pulls air (you can hold a tissue near the vent to test).',
        'Outlets near sinks have test/reset buttons (GFCI).',
        'No signs of water leaking around the base of the tub or shower.'
      ]},
      { key: 'Kitchen', title: 'KITCHEN', hint: 'Look for working appliances, plumbing leaks, and surface damage.', items: [
        'Countertops and cabinets are clean and in good shape — no water damage or peeling.',
        'Sink water pressure feels normal and drains quickly.',
        'No leaks or stains under the sink.',
        'Range hood or exhaust fan turns on and blows air outside.',
        'Dishwasher runs without leaks or odd sounds.',
        'Cabinets and drawers open and close smoothly.',
        'Built-in appliances power on and respond properly.',
        'Electrical outlets near the sink have test/reset buttons (GFCI).'
      ]},
      { key: 'Interior', title: 'INTERIOR ROOMS', hint: 'Walk through each room and check visible surfaces, doors, and floors.', items: [
        'Floors, walls, and ceilings are even and free from cracks, stains, or mold.',
        'Paint and wall coverings look clean and not chipped.',
        'Floors don’t squeak or feel soft when you walk.',
        'Doors open, close, and latch properly.',
        'Windows open and close easily; no broken glass.',
        'Light switches and ceiling fixtures work.',
        'Vents are present and not blocked.',
        'No musty smells or visible signs of moisture.',
        'Caulking around windows and doors looks solid — not peeling.',
        'Smoke detectors have a visible light or beep when tested.'
      ]},
      { key: 'WindowsDoors', title: 'WINDOWS & DOORS', hint: 'Check condition, operation, and signs of drafts or damage.', items: [
        'Doors have weather-stripping and latch properly.',
        'Windows open, close, and lock smoothly.',
        'No broken glass or damaged screens.',
        'No condensation or moisture trapped between window panes.',
        'Frames and trim are solid — no cracks, rot, or soft spots.',
        'Caulking around window edges is sealed and not crumbling.'
      ]},
      { key: 'ExteriorGrounds', title: 'EXTERIOR / GROUNDS', hint: 'Walk around the home and look for water issues, cracks, and safety hazards.', items: [
        'Ground slopes away from the house — no standing water near walls.',
        'Gutters and downspouts are clear and direct water away from the foundation.',
        'No large cracks or uneven spots in driveway or walkways.',
        'Exterior paint or siding is not peeling or damaged.',
        'Deck, porch, and fences look solid — no loose boards or rot.',
        'Outdoor steps and railings feel sturdy.',
        'No tree branches touching the roof or siding.',
        'Garage door opens and closes smoothly.',
        'Outdoor electrical outlets have protective covers.',
        'Exterior vents (dryer, furnace, etc.) are not blocked.'
      ]},
      { key: 'FoundationBasement', title: 'FOUNDATION & BASEMENT', hint: 'Check for visible cracks, moisture, and general condition.', items: [
        'Basement or crawl space smells fresh — not musty or damp.',
        'No visible water stains or puddles on the floor or walls.',
        'Walls and floor show no major cracks or bowing.',
        'Sump pump (if present) turns on when water added or makes a soft humming sound.',
        'Stairs and handrails feel sturdy.',
        'Ceiling and floors above basement look straight and clean.',
        'Laundry area plumbing not dripping or leaking.'
      ]},
      { key: 'HVAC', title: 'HVAC (HEATING, VENTILATION & AIR CONDITIONING)', hint: 'Simple comfort and airflow checks.', items: [
        'Thermostat turns heat or A/C on and off.',
        'Airflow feels even from vents in all rooms.',
        'Furnace and A/C make normal sounds — no loud rattles or smells.',
        'Air filters are clean and easy to reach.'
      ]},
      { key: 'Plumbing', title: 'PLUMBING', hint: 'Look for leaks, rust, or poor water flow.', items: [
        'All faucets run clear water with good pressure.',
        'Hot water works at taps.',
        'No visible leaks under sinks or around toilets.',
        'Water heater looks clean — no rust or dripping water on top or bottom.',
        'Shut-off valves (under sinks or by toilets) are easy to turn.'
      ]},
      { key: 'Electrical', title: 'ELECTRICAL', hint: 'Stick to things you can safely test.', items: [
        'Light switches turn on/off properly.',
        'Outlets near sinks have test/reset buttons (GFCI).',
        'No exposed or hanging wires.',
        'Outdoor lights and outlets work.',
        'Main electrical panel is easy to find and clearly labeled (don’t open it).'
      ]},
      { key: 'SafetyGeneral', title: 'SAFETY & GENERAL', hint: 'Make sure safety systems and everyday features are in place.', items: [
        'Smoke and carbon monoxide detectors are present and working.',
        'Handrails on stairs are secure.',
        'Fireplace area looks clean and free of debris (don’t test gas or flue yourself).',
        'Automatic garage door reverses when you block the sensor.',
        'All exterior doors lock properly.'
      ]}
    ];

    // summaries
    const computeSectionSummary = (section: string, totalItems: number) => {
      let fix = 0, replace = 0, marked = 0;
      for (let i = 1; i <= totalItems; i++) {
        const val = getVal(section, String(i));
        if (val) marked++;
        if (val === 'Fix') fix++;
        if (val === 'Replace') replace++;
      }
      const photos = (getPhotos(section) || []).length;
      return { fix, replace, marked, total: totalItems, photos };
    };
    const computeOverallProgress = () => {
      let total = 0, marked = 0, fix = 0, replace = 0;
      SECTIONS.forEach(sec => {
        total += sec.items.length;
        for (let i = 1; i <= sec.items.length; i++) {
          const val = getVal(sec.key, String(i));
          if (val) marked++;
          if (val === 'Fix') fix++;
          if (val === 'Replace') replace++;
        }
      });
      const pct = total > 0 ? Math.round((marked / total) * 100) : 0;
      return { total, marked, fix, replace, pct };
    };

    // Accordion + UI state
    const [open, setOpen] = React.useState<Set<string>>(() => new Set(SECTIONS.map(s => s.key)));
    const toggle = (k: string) => setOpen(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
    const expandAll = () => setOpen(new Set(SECTIONS.map(s => s.key)));
    const collapseAll = () => setOpen(new Set());

    const [showBackToTop, setShowBackToTop] = React.useState(false);
    React.useEffect(() => {
      const onScroll = () => {
        const y = typeof window !== 'undefined'
          ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
          : 0;
        setShowBackToTop(y > 300);
      };
      window.addEventListener('scroll', onScroll);
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }, []);

    type IssueFilter = 'All' | 'Good' | 'Fix' | 'Replace';
    const [issueFilter, setIssueFilter] = React.useState<IssueFilter>('All');

    const RatedRow: React.FC<{ section:string; label:string; idx:number; }> = ({ section, label, idx }) => {
      const key = String(idx + 1);
      const val = getVal(section, key) as 'Good'|'Fix'|'Replace'|'';
      const Btn: React.FC<{opt:'Good'|'Fix'|'Replace'}> = ({ opt }) => (
        <button
          type="button"
          className={cx('px-2.5 h-8 rounded-lg border text-xs', val === opt ? 'border-[#EF4D68] bg-[#FFF1F3]' : 'border-gray-300 bg-white')}
          onClick={() => setVal(section, key, opt)}
        >{opt}</button>
      );
      return (
        <div className="border-b py-2" style={{ borderColor: COLORS.lightGray }}>
          <div className="flex justify-between items-start gap-3">
            <div className="text-sm" style={{ color: COLORS.charcoal }}>{idx + 1}. {label}</div>
            <div className="flex gap-1 shrink-0"><Btn opt="Good" /><Btn opt="Fix" /><Btn opt="Replace" /></div>
          </div>
          <textarea
            className="w-full mt-2 min-h-[44px] p-2 rounded-lg bg-[#F5F5F5] border outline-none text-[13px]"
            style={{ borderColor: COLORS.lightGray }}
            placeholder="Note for this item (optional)"
            value={getItemNote(section, key)}
            onChange={(e) => setItemNote(section, key, e.target.value)}
          />
        </div>
      );
    };

    const overall = computeOverallProgress();

    return (
      <div className="space-y-3">
        {/* Address header */}
        <div className="rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.lightGray }}>
          <div className="text-sm" style={{ color: COLORS.charcoal }}>Inspecting: <span className="font-medium">{targetHome.address}</span></div>
        </div>

        {/* Global progress pill */}
        <div className="rounded-2xl border bg-white p-3" style={{ borderColor: COLORS.lightGray }}>
          <div className="flex items-center gap-3">
            <div className="text-xs shrink-0" style={{ color: COLORS.charcoal }}>
              Completed: <b>{overall.marked}</b>/<b>{overall.total}</b>
              <span className="mx-2">•</span>
              Issues: <b>{overall.fix}</b> Fix, <b>{overall.replace}</b> Replace
            </div>
            <div className="flex-1 h-2 rounded bg-[#F3F4F6] overflow-hidden">
              <div className="h-2 rounded" style={{ width: `${overall.pct}%`, background: COLORS.coral }} />
            </div>
            <div className="text-xs w-10 text-right" style={{ color: COLORS.gray }}>{overall.pct}%</div>
          </div>
        </div>

        {/* Filter chips + Expand/Collapse inline */}
        <div className="rounded-2xl border bg-white p-2 flex flex-wrap items-center gap-2" style={{ borderColor: COLORS.lightGray }}>
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            {(['All','Good','Fix','Replace'] as IssueFilter[]).map(opt => (
              <button
                key={opt}
                className={cx('px-3 h-8 rounded-full border text-xs shrink-0',
                  issueFilter === opt ? 'bg-[#FFF1F3] border-[#EF4D68] text-[#EF4D68]' : 'bg-white border-gray-300 text-gray-700')}
                onClick={() => setIssueFilter(opt)}
              >{opt}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="px-3 h-8 rounded-lg border text-xs" onClick={expandAll}>Expand all</button>
            <button className="px-3 h-8 rounded-lg border text-xs" onClick={collapseAll}>Collapse all</button>
          </div>
        </div>

        {/* Accordion */}
        <div className="rounded-2xl border bg-white" style={{ borderColor: COLORS.lightGray }}>
          {SECTIONS.map(sec => {
            const summary = computeSectionSummary(sec.key, sec.items.length);
            const filtered = sec.items.map((q, idx) => ({ q, idx }))
              .filter(({ idx }) => {
                if (issueFilter === 'All') return true;
                const key = String(idx + 1);
                return getVal(sec.key, key) === issueFilter;
              });
            return (
              <div key={sec.key} className="border-b last:border-b-0" style={{ borderColor: COLORS.lightGray }}>
                <button className="w-full flex items-start justify-between p-4 text-left" onClick={() => toggle(sec.key)}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: COLORS.charcoal }}>{sec.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.gray }}>{sec.hint}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {summary.fix > 0 && (
                      <span className="px-2 py-0.5 text-[11px] rounded-full border" style={{ borderColor: COLORS.lightGray, color: COLORS.charcoal }}>{summary.fix} Fix</span>
                    )}
                    {summary.replace > 0 && (
                      <span className="px-2 py-0.5 text-[11px] rounded-full border" style={{ borderColor: COLORS.lightGray, color: COLORS.charcoal }}>{summary.replace} Replace</span>
                    )}
                    {summary.photos > 0 && (
                      <span className="px-2 py-0.5 text-[11px] rounded-full border" style={{ borderColor: COLORS.lightGray, color: COLORS.charcoal }}>{summary.photos} Photos</span>
                    )}
                    <span className="text-[11px]" style={{ color: COLORS.gray }}>{summary.marked}/{summary.total}</span>
                    <span className="text-xl" style={{ color: COLORS.gray }}>{open.has(sec.key) ? '−' : '+'}</span>
                  </div>
                </button>
                {open.has(sec.key) && (
                  <div className="px-4 pb-4 space-y-3">
                    {(issueFilter === 'All' ? sec.items.map((q, idx) => ({ q, idx })) : filtered).map(({ q, idx }) => (
                      <RatedRow key={sec.key + idx} section={sec.key} label={q} idx={idx} />
                    ))}
                    {filtered.length === 0 && issueFilter !== 'All' && (
                      <div className="text-xs text-gray-500">No items match the “{issueFilter}” filter in this section.</div>
                    )}
                    <PhotoUploader section={sec.key} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Back to top */}
        {showBackToTop && (
          <button
            className="fixed bottom-16 right-4 h-10 w-10 rounded-full shadow border bg-white"
            onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="Back to top"
          >↑</button>
        )}
      </div>
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveTab(t => (t === 'browse' ? 'compare' : 'inspection')),
    onSwipedRight: () => setActiveTab(t => (t === 'inspection' ? 'compare' : 'browse')),
  });

  return (
    <div className="p-4" {...handlers}>
      {activeTab === 'inspection' && <InspectionView />}
      {activeTab !== 'inspection' && (
        <div className="rounded-2xl border bg-white p-4 text-sm" style={{ borderColor: COLORS.lightGray }}>
          Prototype focus is the <b>Inspection</b> sub-tab. Swipe left/right or call <code>setActiveTab('inspection')</code> to view it.
        </div>
      )}
    </div>
  );
}
