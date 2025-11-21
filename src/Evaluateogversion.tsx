import * as React from 'react';
import { useSwipeable } from 'react-swipeable';

/********************
 * Palette / utils
 ********************/
const COLORS = {
  coral: '#EF4D68',
  lightGray: '#E5E7EB',
  gray: '#6B7280',
  charcoal: '#111827',
  bg: '#F8FAFC',
};
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}
const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f3f4f6"/>
        <stop offset="100%" stop-color="#e5e7eb"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#g)"/>
    <g fill="#9CA3AF">
      <circle cx="96" cy="96" r="36"/>
      <path d="M64 368h384a12 12 0 0 0 12-12v-52L336 220 216 324l-64-52L52 352v4a12 12 0 0 0 12 12z"/>
    </g>
  </svg>`);

/********************
 * Safe helpers
 ********************/
const safeParseArray = (raw: unknown): string[] => {
  try {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as string[];
    if (typeof raw === 'string') return JSON.parse(raw || '[]');
    return [];
  } catch {
    return [];
  }
};
// Key helpers (compat)
const ratingKey = (section: string, item: string) => `${section}:${item}:rating`;
const notesKey = (section: string, item: string) => `${section}:${item}:notes`;
function readRating(evalMap: Record<string, any>, section: string, item: string) {
  const v = evalMap[ratingKey(section, item)] ?? evalMap[item];
  return typeof v === 'string' ? v : undefined;
}
function readNotes(evalMap: Record<string, any>, section: string, item: string) {
  const v = evalMap[notesKey(section, item)] ?? evalMap[`${item}:notes`] ?? '';
  return typeof v === 'string' ? v : '';
}
function getFirstExteriorPhoto(evalMap: Record<string, any>): string | undefined {
  const ids = safeParseArray(evalMap['Exteriors:photos']);
  return ids[0];
}

/********************
 * Shared lists (used in Read + Rate)
 ********************/
const EXTERIORS = ['Curb Appeal','Entryway/Driveway','Backyard','Balcony/Deck/Patio/Porch','Windows/Doors','Fencing','Roofing'];
const INTERIORS = ['Walls/Ceiling','Flooring','Stairs','Living Area / Room','Dine-in Area','Primary Bedroom','Other Bedrooms','Primary Bathroom','Other Bathrooms','Den/Home Office','Laundry Area & Appliances','Walk-in Closet / Storage','Light Fixtures','Garage','Basement','Home Layout'];
const KITCHEN = ['Overall Kitchen','Countertop','Counter space','Cabinets','Flooring','Backsplash','Pantry','Microwave','Dishwasher','Stove/Oven','Island'];
const ADDL_FEATURES = ['Fireplace','Pool','Family Room','Pot lights','Extra Parking','Walk-in Closet','Other'];
const SMART_FEATURES = ['Smart Thermostat','Smart Smoke Detector','Smart Door Bell','Smart Door Lock','Smart Garage Opener','Smart Security Camera','Other'];
const HOME_SYSTEMS = ['Heating, Ventilation and Air Conditioning (HVAC)','Electrical and Plumbing'];
const LOCATION_ITEMS = [
  'Your work',"Your spouse's work",'Public transport','Highway','Child Care','Schools','Grocery/Shopping Centers','Medical Care','Place of worship','Parks & Playgrounds','Mobile Network'
];

/********************
 * Small building blocks
 ********************/
function StatusChip({ value }: { value?: string }) {
  if (!value) return <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100" style={{ color: COLORS.gray }}>–</span>;
  const map: any = { Good: { bg: '#ECFDF5', fg: '#065F46' }, Fair: { bg: '#FEF9C3', fg: '#92400E' }, Poor: { bg: '#FEE2E2', fg: '#991B1B' } };
  const c = map[value] || { bg: '#F3F4F6', fg: COLORS.gray };
  return <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.fg }}>{value}</span>;
}
function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ fontSize: 16, color: n <= value ? COLORS.coral : COLORS.lightGray }}>★</span>
      ))}
    </div>
  );
}
function computeEvalStatus(home: any): { label: string; bg: string; fg: string } {
  const rating = Number(home?.rating || 0);
  if (rating >= 1) return { label: 'Completed', bg: '#ECFDF5', fg: '#065F46' };
  return { label: 'Not Started', bg: '#F3F4F6', fg: COLORS.gray };
}

/********************
 * Uploads & Voice
 ********************/
function UploadArea({ value, onChange, max = 10 }: { value: string[]; onChange: (arr: string[]) => void; max?: number }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const remain = Math.max(0, max - value.length);
    const chosen = Array.from(files).slice(0, remain);
    const reads = await Promise.all(
      chosen.map(
        (f) =>
          new Promise<string>((res, reject) => {
            const r = new FileReader();
            r.onload = () => res(String(r.result || ''));
            r.onerror = reject;
            r.readAsDataURL(f);
          })
      )
    );
    onChange([...value, ...reads]);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };
  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-xl border border-dashed bg-[#FAFAFA] p-3 text-xs text-center cursor-pointer"
        style={{ borderColor: COLORS.lightGray, color: COLORS.gray }}
      >
        Drag & drop or click to upload (max {Math.max(0, max - value.length)})
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      {value.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {value.map((src, i) => (
            <div key={src + i} className="relative">
              <img src={src} className="w-20 h-20 rounded-lg border object-cover" style={{ borderColor: COLORS.lightGray }} />
              <button
                type="button"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border"
                style={{ borderColor: COLORS.lightGray }}
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VoiceRecorder({ value, onChange }: { value?: string; onChange: (dataUrl?: string) => void }) {
  const [rec, setRec] = React.useState<MediaRecorder | null>(null);
  const [err, setErr] = React.useState<string>('');
  const [blobUrl, setBlobUrl] = React.useState<string | undefined>(typeof value === 'string' ? value : undefined);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const fr = new FileReader();
        fr.onload = () => {
          const data = String(fr.result || '');
          setBlobUrl(data);
          onChange(data);
        };
        fr.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRec(mr);
      setErr('');
    } catch (e: any) {
      setErr('Microphone permission denied');
    }
  };
  const stop = () => rec?.state === 'recording' && rec.stop();

  return (
    <div className="space-y-2">
      {!blobUrl ? (
        <div className="flex items-center gap-2">
          {!rec && (
            <button type="button" className="h-9 px-3 rounded-lg border" style={{ borderColor: COLORS.lightGray }} onClick={start}>
              Start Recording
            </button>
          )}
          {rec && (
            <button type="button" className="h-9 px-3 rounded-lg border" style={{ borderColor: COLORS.lightGray }} onClick={stop}>
              Stop
            </button>
          )}
          {err && (
            <span className="text-xs" style={{ color: '#991B1B' }}>
              {err}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <audio controls src={blobUrl} />
          <button
            type="button"
            className="h-9 px-3 rounded-lg border"
            style={{ borderColor: COLORS.lightGray }}
            onClick={() => {
              setBlobUrl(undefined);
              onChange(undefined);
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

/********************
 * Modal shell & fields
 ********************/
function Modal({ open, title, onClose, children }: { open: boolean; title?: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl p-4 border max-h-[85vh] w-full" style={{ borderColor: COLORS.lightGray }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>
            {title}
          </div>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="overflow-y-auto max-h-[72vh] pr-1">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, required, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <label className="block">
      <div className="text-xs mb-1" style={{ color: COLORS.charcoal }}>
        {label}
        {required && ' *'}
      </div>
      <input className="w-full h-10 px-3 rounded-lg border bg-white outline-none" style={{ borderColor: COLORS.lightGray }} value={value} onChange={(e) => onChange(e.target.value)} required={required} type={type} />
    </label>
  );
}

/********************
 * List + Card + Detail (read view)
 ********************/
function HomeCard({ home, onOpen, onToggleFav, isCompared, onToggleCompare }: { home: any; onOpen: () => void; onToggleFav: () => void; isCompared?: boolean; onToggleCompare?: (checked: boolean) => void }) {
  const hero = getFirstExteriorPhoto(home.eval || {}) || FALLBACK_IMG;
  const offer = home.eval?.['Offer Intent'] as 'Yes' | 'No' | 'Maybe' | undefined;
  const status = computeEvalStatus(home);
  const toggleCompare = (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onToggleCompare) onToggleCompare(!(!!isCompared));
  };
  return (
    <div className="rounded-2xl border bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative" style={{ borderColor: COLORS.lightGray }} onClick={onOpen}>
      {/* Compare checkbox overlay (non-intrusive) */}
      {typeof isCompared !== 'undefined' && (
        <label className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg border" style={{borderColor:COLORS.lightGray}} onClick={(e)=> e.stopPropagation()}>
          <input type="checkbox" checked={Boolean(isCompared)} onChange={toggleCompare as any} />
          <span className="text-[11px]">Compare</span>
        </label>
      )}
      <div className="relative aspect-square w-full bg-[#F5F5F5]">
        <img src={hero} className="absolute inset-0 w-full h-full object-cover" />
        <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center border" style={{ borderColor: COLORS.lightGray }} onClick={(e) => { e.stopPropagation(); onToggleFav(); }} aria-label={home.fav ? 'Unfavorite' : 'Favorite'}>
          {home.fav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="p-3 space-y-1">
        <div className="text-sm font-semibold truncate" style={{ color: COLORS.charcoal }}>
          {home.address || '—'}
        </div>
        <div className="text-xs" style={{ color: COLORS.gray }}>
          {home.price ? `$${home.price}` : '—'} • {home.beds || '?'} bd • {home.baths || '?'} ba
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: status.bg, color: status.fg }}>{status.label}</span>
          {offer && (
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: offer === 'Yes' ? '#ECFDF5' : offer === 'Maybe' ? '#FEF9C3' : '#FEE2E2', color: offer === 'Yes' ? '#065F46' : offer === 'Maybe' ? '#92400E' : '#991B1B' }}>{offer}</span>
          )}
        </div>
      </div>
    </div>
  );
}
function DetailViewRead({ home, onBack, onRate, onEdit }: { home: any; onBack: () => void; onRate: () => void; onEdit: () => void }) {
  const evalMap = (home && typeof home === 'object' && home.eval && typeof home.eval === 'object') ? home.eval : {};
  const hero = getFirstExteriorPhoto(evalMap) || FALLBACK_IMG;
  const offer = evalMap?.['Offer Intent'] as 'Yes' | 'No' | 'Maybe' | undefined;

  const SectionMediaRead = ({section, evalMap}:{section:string; evalMap:any})=>{
    const photos = safeParseArray(evalMap[`${section}:photos`]);
    const voice = typeof evalMap[`${section}:voice`] === 'string' ? evalMap[`${section}:voice`] : '';
    if (photos.length===0 && !voice) return null;
    return (
      <div className="mt-3 space-y-2">
        {photos.length>0 && (
          <div className="flex gap-2 overflow-x-auto">
            {photos.map((src,idx)=> (
              <img key={src+idx} src={src} className="h-24 w-32 md:h-28 md:w-40 rounded-lg border object-cover flex-shrink-0" style={{borderColor:COLORS.lightGray}}/>
            ))}
          </div>
        )}
        {voice && (
          <div className="pt-1"><audio controls src={voice} /></div>
        )}
      </div>
    );
  };

  const TruncNote = ({text}:{text:string})=>{
    const [open,setOpen]=React.useState(false);
    const short = text.length>160 && !open ? text.slice(0,160)+'…' : text;
    return (
      <div className="text-xs mt-1" style={{color:COLORS.gray}}>
        {short}
        {text.length>160 && (
          <button className="ml-1 underline" onClick={()=> setOpen(v=>!v)}>{open? 'Show less' : 'Show more'}</button>
        )}
      </div>
    );
  };

  const SectionRead = ({title, items, section}:{title:string; items:string[]; section:string})=>{
    return (
      <div className="mt-6">
        <div className="text-sm font-semibold mb-2" style={{color:COLORS.charcoal}}>{title}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {items.map((it)=>{
            const rate = readRating(evalMap, section, it);
            const notes = readNotes(evalMap, section, it);
            return (
              <div key={`${section}:${it}`} className="flex items-start justify-between border-b pb-2" style={{borderColor:COLORS.lightGray}}>
                <div className="min-w-0 pr-3">
                  <div className="text-sm" style={{color:COLORS.charcoal}}>{it}</div>
                  {(['Exteriors','Interiors','Kitchen'].includes(section) && notes) && <TruncNote text={notes} />}
                </div>
                <StatusChip value={rate} />
              </div>
            );
          })}
        </div>
        <SectionMediaRead section={section} evalMap={evalMap} />
      </div>
    );
  };

  return (
    <div className="px-2 md:px-0">
      {/* Banner */}
      <div className="mb-4">
        <div className="relative w-full rounded-2xl overflow-hidden">
          <div className="w-full aspect-[16/9] bg-[#F5F5F5]">
            <img src={hero} className="w-full h-full object-cover" />
          </div>
          {/* Overlays */}
          <button onClick={onBack} className="absolute top-2 left-2 h-9 w-9 rounded-full bg-white/90 border flex items-center justify-center" style={{borderColor:COLORS.lightGray}} aria-label="Back">←</button>
          <div className="absolute top-2 right-2 h-9 w-9 rounded-full bg-white/90 border flex items-center justify-center" style={{borderColor:COLORS.lightGray}} aria-label="Favorite">{home.fav ? '❤️' : '🤍'}</div>
        </div>
        {/* Header under banner */}
        <div className="mt-3">
          <div className="text-xl font-semibold" style={{color:COLORS.charcoal}}>{home.address}</div>
          <div className="text-sm mt-0.5" style={{color:COLORS.gray}}>{home.city || '—'}</div>
          {/* Actions */}
          <div className="mt-3 flex items-center gap-3">
            <button className="h-11 px-4 rounded-xl text-white" style={{background:COLORS.coral}} onClick={onRate}>Rate this Home</button>
            <StarDisplay value={Number(home.rating || 0)} />
            {offer && (
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: offer === 'Yes' ? '#ECFDF5' : offer === 'Maybe' ? '#FEF9C3' : '#FEE2E2', color: offer === 'Yes' ? '#065F46' : offer === 'Maybe' ? '#92400E' : '#991B1B' }}>Offer: {offer}</span>
            )}
          </div>
        </div>
      </div>

      {/* Home Details table */}
      <div className="rounded-2xl border bg-white p-4" style={{borderColor:COLORS.lightGray}}>
        <div className="flex items-center justify-between mb-2"><div className="text-sm font-semibold" style={{color:COLORS.charcoal}}>Home Details</div><button onClick={onEdit} className="h-8 px-3 rounded-lg border text-xs" style={{borderColor:COLORS.lightGray}}>Edit</button></div>
        <div className="divide-y" style={{borderColor:COLORS.lightGray}}>
          {[['House address', home.address], ['Neighborhood', home.city], ['Asking price', home.price ? `$${home.price}` : '—'], ['Bedrooms', home.beds], ['Bathrooms', home.baths], ['Year Built', home.year], ['Property taxes', home.tax? `$${home.tax}`:'—'], ['Sq. Ft', home.sqft]].map(([label, val]: any)=> (
            <div key={String(label)} className="flex items-center justify-between py-3">
              <div className="text-sm" style={{color:COLORS.charcoal}}>{label}</div>
              <div className="text-sm" style={{color:COLORS.charcoal}}>{val || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation details, responsive */}
      <div className="rounded-2xl border bg-white p-4 mt-4" style={{borderColor:COLORS.lightGray}}>
        <div className="text-sm font-semibold mb-1" style={{color:COLORS.charcoal}}>Evaluation Details</div>
        <div className="text-xs mb-3" style={{color:COLORS.gray}}>Selections, notes, and attachments</div>
        <SectionRead title="Exteriors" section="Exteriors" items={EXTERIORS} />
        <SectionRead title="Interiors" section="Interiors" items={INTERIORS} />
        <SectionRead title="Kitchen" section="Kitchen" items={KITCHEN} />

        {/* Home Systems */}
        <SectionRead title="Home Systems" section="Home Systems" items={HOME_SYSTEMS} />
        {/* Hot Water Heater summary */}
        {(() => { const own = evalMap['Home Systems:Hot Water Heater:Ownership']; const type = evalMap['Home Systems:Hot Water Heater:Type']; if (!own && !type) return null; return (
          <div className="mt-2 border-b pb-2" style={{borderColor:COLORS.lightGray}}>
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{color:COLORS.charcoal}}>Hot Water Heater</div>
              <div className="text-xs" style={{color:COLORS.gray}}>{[own,type].filter(Boolean).join(' • ')}</div>
            </div>
          </div>
        ); })()}

        {/* Location */}
        <SectionRead title="Location" section="Location" items={LOCATION_ITEMS} />
        {/* Location extras */}
        {evalMap['Location:Mobile Network:notes'] && (
          <div className="mt-2 border-b pb-2" style={{borderColor:COLORS.lightGray}}>
            <div className="text-xs" style={{color:COLORS.gray}}><strong>Mobile Network notes:</strong> <span className="font-normal"><TruncNote text={String(evalMap['Location:Mobile Network:notes'])} /></span></div>
          </div>
        )}
        {evalMap['Location:ISP'] && (
          <div className="mt-2 border-b pb-2" style={{borderColor:COLORS.lightGray}}>
            <div className="text-xs" style={{color:COLORS.gray}}><strong>Internet Service Providers:</strong> <span className="font-normal">{String(evalMap['Location:ISP'])}</span></div>
          </div>
        )}
        {evalMap['Location:Future'] && (
          <div className="mt-2 border-b pb-2" style={{borderColor:COLORS.lightGray}}>
            <div className="text-xs" style={{color:COLORS.gray}}><strong>Future Developments:</strong> <span className="font-normal"><TruncNote text={String(evalMap['Location:Future'])} /></span></div>
          </div>
        )}

        {/* Additional Features (checkbox, notes only for Other) */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-2" style={{color:COLORS.charcoal}}>Additional Features</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {ADDL_FEATURES.map((it)=>{
              const checked = Boolean(evalMap[`Additional Features:${it}`]);
              const notes = String(evalMap[`Additional Features:${it}:notes`]||'');
              return (
                <div key={it} className="flex items-start justify-between border-b pb-2" style={{borderColor:COLORS.lightGray}}>
                  <div className="min-w-0 pr-3">
                    <div className="text-sm" style={{color:COLORS.charcoal}}>{it}</div>
                    {it==='Other' && notes && <TruncNote text={notes}/>} 
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{background: checked? '#ECFDF5':'#F3F4F6', color: checked? '#065F46': COLORS.gray}}>{checked? 'Yes':'No'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Home Features */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-2" style={{color:COLORS.charcoal}}>Smart Home Features</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {SMART_FEATURES.map((it)=>{
              const checked = Boolean(evalMap[`Smart Home Features:${it}`]);
              const notes = String(evalMap[`Smart Home Features:${it}:notes`]||'');
              return (
                <div key={it} className="flex items-start justify-between border-b pb-2" style={{borderColor:COLORS.lightGray}}>
                  <div className="min-w-0 pr-3">
                    <div className="text-sm" style={{color:COLORS.charcoal}}>{it}</div>
                    {it==='Other' && notes && <TruncNote text={notes}/>} 
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{background: checked? '#ECFDF5':'#F3F4F6', color: checked? '#065F46': COLORS.gray}}>{checked? 'Yes':'No'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Costs */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-2" style={{color:COLORS.charcoal}}>Monthly Costs</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {['Utilities','Insurance','Condo/POTL Fees','Other Fees'].map((label)=>{
              const val = evalMap[`Monthly:${label}`];
              return (
                <div key={label} className="flex items-center justify-between border-b pb-2" style={{borderColor:COLORS.lightGray}}>
                  <div className="text-sm" style={{color:COLORS.charcoal}}>{label}</div>
                  <div className="text-sm" style={{color:COLORS.charcoal}}>{val? `$${val}`:'—'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Other Observations */}
        <div className="mt-6">
          <div className="text-sm font-semibold mb-2" style={{color:COLORS.charcoal}}>Other Observations</div>
          <div className="border-b pb-2" style={{borderColor:COLORS.lightGray}}>
            {evalMap['Other:notes'] ? (<TruncNote text={String(evalMap['Other:notes'])} />) : (<div className="text-xs" style={{color:COLORS.gray}}>No notes</div>)}
          </div>
          <SectionMediaRead section="Other" evalMap={evalMap}/>
        </div>
      </div>
    </div>
  );
}

/********************
 * Rate Home Modal (full)
 ********************/
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-1" aria-label={`rate ${n}`}>
          <span style={{ fontSize: 18, color: n <= value ? COLORS.coral : COLORS.lightGray }}>★</span>
        </button>
      ))}
    </div>
  );
}

function RateHomeModal({ home, onSave, onCancel }: { home: any; onSave: (h: any) => void; onCancel: () => void }) {
  const initialEval = (home && typeof home === 'object' && home.eval && typeof home.eval === 'object') ? home.eval : {};
  const [rating, setRating] = React.useState<number>(Number(home?.rating || 0));
  const [offer, setOffer] = React.useState<string>(typeof initialEval['Offer Intent'] === 'string' ? initialEval['Offer Intent'] : '');
  const [evalMap, setEvalMap] = React.useState<Record<string, any>>({ ...initialEval });
  const setField = (k: string, v: any) => setEvalMap((m) => ({ ...(m || {}), [k]: v }));

  const exteriors = EXTERIORS;
  const interiors = INTERIORS;
  const kitchen = KITCHEN;
  const addlFeatures = ADDL_FEATURES;
  const smartFeatures = SMART_FEATURES;

  const RatedRow = ({ section, item }: { section: string; item: string }) => {
    const keyRating = ratingKey(section, item);
    const keyNotes = notesKey(section, item);
    const current = readRating(evalMap, section, item);
    const n = String(evalMap[keyNotes] ?? '');
    return (
      <div className="grid grid-cols-1 gap-2 border-b pb-2" style={{ borderColor: '#F3F4F6' }}>
        <div className="flex items-center justify-between">
          <div className="text-sm" style={{ color: COLORS.charcoal }}>{item}</div>
          <div className="flex gap-1">
            {['Good', 'Fair', 'Poor'].map((opt) => (
              <button key={opt} type="button" onClick={() => setField(keyRating, opt)} className={cx('px-2.5 h-8 rounded-lg border text-xs', current === opt ? 'border-[#EF4D68] bg-[#FFF1F3]' : 'border-gray-300 bg-white')}>{opt}</button>
            ))}
          </div>
        </div>
        {(['Exteriors','Interiors','Kitchen'].includes(section)) && (
          <textarea
            name={keyNotes}
            className="w-full min-h-[64px] p-2 rounded-lg bg-[#F5F5F5] border outline-none"
            style={{ borderColor: COLORS.lightGray }}
            value={n}
            onChange={(e) => setField(keyNotes, e.target.value)}
            placeholder="Notes (optional)"
          />
        )}
      </div>
    );
  };

  const SectionMedia = ({ section }: { section: string }) => {
    const photos = safeParseArray(evalMap[`${section}:photos`]);
    const voice = typeof evalMap[`${section}:voice`] === 'string' ? evalMap[`${section}:voice`] : '';
    const setPhotos = (arr: string[]) => setField(`${section}:photos`, JSON.stringify(arr.slice(0, 10)));
    const setVoice = (v?: string) => setField(`${section}:voice`, v || '');
    return (
      <div className="mt-2 space-y-2">
        <div className="text-xs" style={{ color: COLORS.gray }}>Photos</div>
        <UploadArea value={photos} onChange={setPhotos} max={10} />
        <div className="text-xs mt-2" style={{ color: COLORS.gray }}>Voice note</div>
        <VoiceRecorder value={voice} onChange={setVoice} />
      </div>
    );
  };

  const saveAll = () => {
    const nextEval: Record<string, any> = { ...(initialEval || {}), ...(evalMap || {}), ['Offer Intent']: offer };
    onSave({ ...(home || {}), rating, eval: nextEval });
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium" style={{ color: COLORS.charcoal }}>Exteriors</div>
      <div className="space-y-2">
        {exteriors.map((it) => (<RatedRow key={`Exteriors:${it}`} section="Exteriors" item={it} />))}
        <SectionMedia section="Exteriors" />
      </div>

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Interiors</div>
      <div className="space-y-2">
        {interiors.map((it) => (<RatedRow key={`Interiors:${it}`} section="Interiors" item={it} />))}
        <SectionMedia section="Interiors" />
      </div>

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Kitchen</div>
      <div className="space-y-2">
        {kitchen.map((it) => (<RatedRow key={`Kitchen:${it}`} section="Kitchen" item={it} />))}
        <SectionMedia section="Kitchen" />
      </div>

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Additional Features</div>
      <div className="space-y-2">
        {addlFeatures.map((it)=> (
          <div key={it} className="grid grid-cols-1 gap-2 border-b pb-2" style={{ borderColor: '#F3F4F6' }}>
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{ color: COLORS.charcoal }}>{it}</div>
              <input type="checkbox" checked={Boolean(evalMap[`Additional Features:${it}`])} onChange={(e)=> setField(`Additional Features:${it}`, e.target.checked)} />
            </div>
            {it === 'Other' && (
              <textarea className="w-full min-h-[48px] p-2 rounded-lg bg-[#F5F5F5] border outline-none" style={{ borderColor: COLORS.lightGray }} value={String(evalMap[`Additional Features:${it}:notes`]||'')} onChange={(e)=> setField(`Additional Features:${it}:notes`, e.target.value)} placeholder="Notes (optional)" />
            )}
          </div>
        ))}
      </div>

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Smart Home Features</div>
      <div className="space-y-2">
        {smartFeatures.map((it)=> (
          <div key={it} className="grid grid-cols-1 gap-2 border-b pb-2" style={{ borderColor: '#F3F4F6' }}>
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{ color: COLORS.charcoal }}>{it}</div>
              <input type="checkbox" checked={Boolean(evalMap[`Smart Home Features:${it}`])} onChange={(e)=> setField(`Smart Home Features:${it}`, e.target.checked)} />
            </div>
            {it === 'Other' && (
              <textarea className="w-full min-h-[48px] p-2 rounded-lg bg-[#F5F5F5] border outline-none" style={{ borderColor: COLORS.lightGray }} value={String(evalMap[`Smart Home Features:${it}:notes`]||'')} onChange={(e)=> setField(`Smart Home Features:${it}:notes`, e.target.value)} placeholder="Notes (optional)" />
            )}
          </div>
        ))}
      </div>

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Home Systems</div>
      <div className="space-y-2">
        {HOME_SYSTEMS.map((it) => (<RatedRow key={it} section="Home Systems" item={it} />))}
        <div className="grid grid-cols-1 gap-2 border-b pb-2" style={{ borderColor: '#F3F4F6' }}>
          <div className="text-sm" style={{ color: COLORS.charcoal }}>Hot Water Heater</div>
          <div className="flex flex-wrap gap-2">
            {['Leased','Owned'].map(opt => (
              <button key={opt} type="button" onClick={() => setField('Home Systems:Hot Water Heater:Ownership', opt)} className={cx('px-2.5 h-8 rounded-lg border text-xs', evalMap['Home Systems:Hot Water Heater:Ownership']===opt ? 'border-[#EF4D68] bg-[#FFF1F3]' : 'border-gray-300 bg-white')}>{opt}</button>
            ))}
            {['Tank','Tankless'].map(opt => (
              <button key={opt} type="button" onClick={() => setField('Home Systems:Hot Water Heater:Type', opt)} className={cx('px-2.5 h-8 rounded-lg border text-xs', evalMap['Home Systems:Hot Water Heater:Type']===opt ? 'border-[#EF4D68] bg-[#FFF1F3]' : 'border-gray-300 bg-white')}>{opt}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Location</div>
      <div className="space-y-2">
        {LOCATION_ITEMS.map((it) => (
          <div key={it}>
            <RatedRow section="Location" item={it} />
            {it==='Mobile Network' && (
              <textarea className="w-full min-h-[48px] p-2 rounded-lg bg-[#F5F5F5] border outline-none" style={{ borderColor: COLORS.lightGray }} value={String(evalMap['Location:Mobile Network:notes']||'')} onChange={(e)=> setField('Location:Mobile Network:notes', e.target.value)} placeholder="Notes (optional)" />
            )}
          </div>
        ))}
      </div>

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Internet Service Providers</div>
      <textarea className="w-full min-h-[48px] p-2 rounded-lg bg-[#F5F5F5] border outline-none" style={{ borderColor: COLORS.lightGray }} value={String(evalMap['Location:ISP']||'')} onChange={(e)=> setField('Location:ISP', e.target.value)} placeholder="e.g., Bell, Rogers, etc." />

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Future Developments</div>
      <textarea className="w-full min-h-[48px] p-2 rounded-lg bg-[#F5F5F5] border outline-none" style={{ borderColor: COLORS.lightGray }} value={String(evalMap['Location:Future']||'')} onChange={(e)=> setField('Location:Future', e.target.value)} placeholder="Notes / observations" />

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Monthly Costs</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {['Utilities','Insurance','Condo/POTL Fees','Other Fees'].map((label)=> (
          <label key={label} className="block">
            <div className="text-xs mb-1" style={{ color: COLORS.charcoal }}>{label}</div>
            <input className="w-full h-10 px-3 rounded-lg border bg-white outline-none" style={{ borderColor: COLORS.lightGray }} type="number" value={String(evalMap[`Monthly:${label}`]||'')} onChange={(e)=> setField(`Monthly:${label}`, e.target.value)} placeholder="$" />
          </label>
        ))}
      </div>

      <div className="text-sm font-medium pt-3" style={{ color: COLORS.charcoal }}>Other Observations</div>
      <textarea className="w-full min-h-[64px] p-2 rounded-lg bg-[#F5F5F5] border outline-none mb-2" style={{ borderColor: COLORS.lightGray }} value={String(evalMap['Other:notes']||'')} onChange={(e)=> setField('Other:notes', e.target.value)} placeholder="Notes" />
      <SectionMedia section="Other" />

      {/* Bottom: Overall + Offer */}
      <div className="border-t mt-4 pt-3" style={{ borderColor: COLORS.lightGray }}>
        <div className="text-sm font-medium" style={{ color: COLORS.charcoal }}>Overall Rating</div>
        <StarInput value={rating} onChange={setRating} />
        <div className="pt-2 text-sm font-medium" style={{ color: COLORS.charcoal }}>Make an Offer</div>
        <div className="flex gap-2">{['Yes','No','Maybe'].map((o)=> (
          <button key={o} type="button" onClick={() => setOffer(o)} className={cx('px-3 h-10 rounded-lg border text-sm', offer === o ? 'border-[#EF4D68] bg-[#FFF1F3]' : 'border-gray-300 bg-white')}>{o}</button>
        ))}</div>
      </div>

      <div className="sticky bottom-0 bg-white pt-3 pb-2 mt-2 border-t" style={{ borderColor: COLORS.lightGray }}>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="h-10 rounded-xl border" style={{ borderColor: COLORS.lightGray }} onClick={onCancel}>Cancel</button>
          <button type="button" className="h-10 rounded-xl text-white" style={{ background: COLORS.coral }} onClick={saveAll}>Save</button>
        </div>
      </div>
    </div>
  );
}

/********************
 * Main module
 ********************/
function AddHomeModal({ onSave, onCancel }: { onSave: (h: any) => void; onCancel: () => void }) {
  const [address, setAddress] = React.useState('');
  const [neighborhood, setNeighborhood] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [beds, setBeds] = React.useState('');
  const [baths, setBaths] = React.useState('');
  const [year, setYear] = React.useState('');
  const [tax, setTax] = React.useState('');
  const [sqft, setSqft] = React.useState('');
  const valid = address.trim() && price.trim() && beds.trim() && baths.trim();
  const save = () => {
    if (!valid) return;
    onSave({ id: String(Date.now()), address, city: neighborhood, price, beds, baths, year, tax, sqft, fav: false, rating: 0, eval: {} });
  };
  return (
    <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <Field label="House address" required value={address} onChange={setAddress} />
      <Field label="Neighborhood" value={neighborhood} onChange={setNeighborhood} />
      <Field label="Asking price ($)" required value={price} onChange={setPrice} type="number" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Bedrooms" required value={beds} onChange={setBeds} type="number" />
        <Field label="Bathrooms" required value={baths} onChange={setBaths} type="number" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Year Built" value={year} onChange={setYear} type="number" />
        <Field label="Property taxes ($)" value={tax} onChange={setTax} type="number" />
      </div>
      <Field label="Sq. Ft" value={sqft} onChange={setSqft} type="number" />
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button type="button" className="h-10 rounded-xl border" style={{ borderColor: COLORS.lightGray }} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="h-10 rounded-xl text-white" style={{ background: valid ? COLORS.coral : COLORS.lightGray }} disabled={!valid}>
          Save
        </button>
      </div>
    </form>
  );
}

function EditHomeModal({ home, onSave, onCancel }: { home: any; onSave: (patch: any) => void; onCancel: () => void }) {
  const [address, setAddress] = React.useState(String(home.address||''));
  const [neighborhood, setNeighborhood] = React.useState(String(home.city||''));
  const [price, setPrice] = React.useState(String(home.price||''));
  const [beds, setBeds] = React.useState(String(home.beds||''));
  const [baths, setBaths] = React.useState(String(home.baths||''));
  const [year, setYear] = React.useState(String(home.year||''));
  const [tax, setTax] = React.useState(String(home.tax||''));
  const [sqft, setSqft] = React.useState(String(home.sqft||''));
  const valid = address.trim() && price.trim() && beds.trim() && baths.trim();
  const save = () => { if (!valid) return; onSave({ address, city: neighborhood, price, beds, baths, year, tax, sqft }); };
  return (
    <form className="space-y-2" onSubmit={(e)=>{e.preventDefault(); save();}}>
      <Field label="House address" required value={address} onChange={setAddress} />
      <Field label="Neighborhood" value={neighborhood} onChange={setNeighborhood} />
      <Field label="Asking price ($)" required value={price} onChange={setPrice} type="number" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Bedrooms" required value={beds} onChange={setBeds} type="number" />
        <Field label="Bathrooms" required value={baths} onChange={setBaths} type="number" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Year Built" value={year} onChange={setYear} type="number" />
        <Field label="Property taxes ($)" value={tax} onChange={setTax} type="number" />
      </div>
      <Field label="Sq. Ft" value={sqft} onChange={setSqft} type="number" />
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button type="button" className="h-10 rounded-xl border" style={{ borderColor: COLORS.lightGray }} onClick={onCancel}>Cancel</button>
        <button type="submit" className="h-10 rounded-xl text-white" style={{ background: valid ? COLORS.coral : COLORS.lightGray }} disabled={!valid}>Save</button>
      </div>
    </form>
  );
}

/********************
 * Evaluate Module with Compare sub-tab (swipe + CTA + arrows)
 ********************/
function EvaluateModule() {
  const [homes, setHomes] = React.useState<any[]>([
    { id: '1', address: '100 Street Avenue', city: 'Toronto', price: '900000', beds: '3', baths: '2', year: '2000', fav: false, rating: 0, eval: {} },
    { id: '2', address: '120 John Street', city: 'Hamilton', price: '750000', beds: '4', baths: '3', year: '2010', fav: false, rating: 0, eval: {} },
    { id: '3', address: '150 Alfred Av', city: 'Mississauga', price: '820000', beds: '4', baths: '3', year: '2008', fav: false, rating: 0, eval: {} }
  ]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [showRate, setShowRate] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);

  // New: sub-tabs + compare state
  const [activeTab, setActiveTab] = React.useState<'browse' | 'compare'>('browse');
  const [compareIds, setCompareIds] = React.useState<string[]>([]);
  const [hint, setHint] = React.useState<string>('');

  const active = homes.find((h) => h.id === activeId) || null;

  // Prune compareIds when a home disappears (deleted)
  React.useEffect(() => {
    const ids = new Set(homes.map(h => h.id));
    setCompareIds(prev => prev.filter(id => ids.has(id)));
  }, [homes]);

  const toggleCompare = (id: string, checked: boolean) => {
    setCompareIds(prev => {
      if (checked) {
        if (prev.includes(id)) return prev;
        if (prev.length >= 3) {
          setHint('You can compare up to 3 homes. Swipe left to open Compare.');
          setTimeout(() => setHint(''), 2000);
          return prev;
        }
        return [...prev, id];
      } else {
        return prev.filter(x => x !== id);
      }
    });
  };

  // Swipe handlers (Browse ⇄ Compare)
  const handlers = useSwipeable({
    onSwipedLeft: () => { if (!active && activeTab === 'browse') setActiveTab('compare'); },
    onSwipedRight: () => { if (!active && activeTab === 'compare') setActiveTab('browse'); },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // Compare view as a TABLE (no photos/notes/voice)
  const CompareView = ({ ids }: { ids: string[] }) => {
    const selected = ids.map(id => homes.find(h => h.id === id)).filter(Boolean) as any[];
    return (
      <div className="mt-2">
        {selected.length < 2 && (
          <div className="text-xs mb-2" style={{color:COLORS.gray}}>Pick at least 2 homes to compare. Swipe right to go back to Browse.</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border rounded-2xl bg-white" style={{borderColor:COLORS.lightGray}}>
            <thead>
              <tr className="border-b" style={{borderColor:COLORS.lightGray}}>
                <th className="text-left text-xs font-medium px-3 py-2" style={{color:COLORS.gray}}>Attribute</th>
                {selected.map(h => (
                  <th key={h.id} className="text-left px-3 py-2 align-bottom">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold" style={{color:COLORS.charcoal}}>{h.address}</div>
                      <div className="flex gap-1">
                        <button className="h-8 px-2 rounded-lg border text-xs" style={{borderColor:COLORS.lightGray}} onClick={()=> setActiveId(h.id)}>Open</button>
                        <button className="h-8 px-2 rounded-lg border text-xs" style={{borderColor:COLORS.lightGray}} onClick={()=> toggleCompare(h.id, false)}>Remove</button>
                      </div>
                    </div>
                    <div className="text-xs mt-0.5" style={{color:COLORS.gray}}>{h.city || '—'}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  { label: 'Price', render: (h:any) => h.price ? `$${h.price}` : '—' },
                  { label: 'Beds', render: (h:any) => h.beds || '—' },
                  { label: 'Baths', render: (h:any) => h.baths || '—' },
                  { label: 'Year', render: (h:any) => h.year || '—' },
                  { label: 'Sq. Ft', render: (h:any) => h.sqft || '—' },
                  { label: 'Overall Rating', render: (h:any) => <StarDisplay value={Number(h.rating||0)} /> },
                  { label: 'Offer Intent', render: (h:any) => h.eval?.['Offer Intent'] ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: h.eval['Offer Intent'] === 'Yes' ? '#ECFDF5' : h.eval['Offer Intent'] === 'Maybe' ? '#FEF9C3' : '#FEE2E2', color: h.eval['Offer Intent'] === 'Yes' ? '#065F46' : h.eval['Offer Intent'] === 'Maybe' ? '#92400E' : '#991B1B' }}>{h.eval['Offer Intent']}</span>
                    ) : '—' },
                ] as Array<{label:string; render:(h:any)=>React.ReactNode}>
              ).map(row => (
                <tr key={row.label} className="border-t" style={{borderColor:COLORS.lightGray}}>
                  <td className="text-xs px-3 py-2 whitespace-nowrap" style={{color:COLORS.charcoal}}>{row.label}</td>
                  {selected.map(h => (
                    <td key={h.id+row.label} className="text-xs px-3 py-2 align-middle" style={{color:COLORS.charcoal}}>
                      {row.render(h)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto" {...handlers}>
      {!active ? (
        <div>
          {/* Non-clickable orientation labels + desktop arrows */}
          <div className="flex items-center justify-center gap-3 mb-2 select-none">
            {/* Left arrow (desktop only) */}
            <button
              type="button"
              className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-lg border"
              style={{borderColor:COLORS.lightGray, opacity: activeTab==='browse' ? 0.4 : 1}}
              aria-label="Previous tab"
              onClick={()=> activeTab==='compare' && setActiveTab('browse')}
            >
              ←
            </button>

            <div className="flex items-center gap-6" aria-hidden="true">
              <div className={cx('text-xs', activeTab==='browse' ? 'font-semibold' : '')} style={{color:COLORS.charcoal}}>Browse</div>
              <div className="text-xs" style={{color:COLORS.gray}}>•</div>
              <div className={cx('text-xs', activeTab==='compare' ? 'font-semibold' : '')} style={{color:COLORS.charcoal}}>Compare</div>
            </div>

            {/* Right arrow (desktop only) */}
            <button
              type="button"
              className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-lg border"
              style={{borderColor:COLORS.lightGray, opacity: activeTab==='compare' ? 0.4 : 1}}
              aria-label="Next tab"
              onClick={()=> activeTab==='browse' && setActiveTab('compare')}
            >
              →
            </button>
            <div className="ml-3 text-[11px]" style={{color:COLORS.gray}}>{activeTab==='browse' ? 'Swipe left to Compare' : 'Swipe right to Browse'}</div>
          </div>

          {/* Browse tab */}
          {activeTab==='browse' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-semibold" style={{ color: COLORS.charcoal }}>Evaluation</div>
                <button className="h-10 px-4 rounded-xl text-white" style={{ background: COLORS.coral }} onClick={() => setShowAdd(true)}>+ Add a home</button>
              </div>

              {hint && <div className="mb-2 text-xs" style={{color:COLORS.gray}}>{hint}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {homes.map((h) => (
                  <HomeCard
                    key={h.id}
                    home={h}
                    onOpen={() => setActiveId(h.id)}
                    onToggleFav={() => setHomes((list) => list.map((x) => (x.id === h.id ? { ...x, fav: !x.fav } : x)))}
                    isCompared={compareIds.includes(h.id)}
                    onToggleCompare={(checked)=> toggleCompare(h.id, checked)}
                  />
                ))}
              </div>

              {/* Floating CTA when selections exist */}
              {compareIds.length>0 && (
                <div className="fixed bottom-3 left-0 right-0 mx-auto max-w-6xl px-4">
                  <div className="rounded-xl bg-white border p-3 flex items-center justify-between shadow-sm" style={{borderColor:COLORS.lightGray}}>
                    <div className="text-xs" style={{color:COLORS.charcoal}}>
                      Selected for compare: {compareIds.length} (max 3)
                      <span className="ml-2 hidden sm:inline" style={{color:COLORS.gray}}>Swipe left or use the arrow to open Compare</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="h-8 px-3 rounded-lg border text-xs" style={{borderColor:COLORS.lightGray}} onClick={()=> setCompareIds([])}>Clear</button>
                      {/* Primary CTA to jump to Compare */}
                      <button className="h-8 px-3 rounded-lg text-xs text-white" style={{background:COLORS.coral}} onClick={()=> setActiveTab('compare')}>
                        Compare ({compareIds.length})
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Compare tab */}
          {activeTab==='compare' && (
            <CompareView ids={compareIds} />
          )}
        </div>
      ) : (
        <DetailViewRead
          home={active}
          onBack={() => setActiveId(null)}
          onRate={() => setShowRate(true)}
          onEdit={() => setShowEdit(true)}
        />
      )}

      {/* Add Home */}
      <Modal open={showAdd} title="Add a home" onClose={() => setShowAdd(false)}>
        <AddHomeModal
          onCancel={() => setShowAdd(false)}
          onSave={(h) => {
            setHomes((list) => [h, ...list]);
            setShowAdd(false);
          }}
        />
      </Modal>

      {/* Rate */}
      <Modal open={showRate && Boolean(active)} title="Rate Home" onClose={() => setShowRate(false)}>
        {active && (
          <RateHomeModal
            home={active}
            onCancel={() => setShowRate(false)}
            onSave={(h) => {
              setHomes((list) => list.map((x) => (x.id === h.id ? h : x)));
              setShowRate(false);
            }}
          />
        )}
      </Modal>

      {/* Edit */}
      <Modal open={showEdit && Boolean(active)} title="Edit Home Details" onClose={() => setShowEdit(false)}>
        {active && (
          <EditHomeModal
            home={active}
            onCancel={() => setShowEdit(false)}
            onSave={(patch) => {
              setHomes((list) => list.map((x) => (x.id === active.id ? { ...x, ...patch } : x)));
              setShowEdit(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        <EvaluateModule />
      </div>
    </div>
  );
}
