import * as React from 'react';

/********************
 * THEME & HELPERS
 ********************/
const COLORS = {
  coral: '#EF4D68',
  coralSoft: '#FFF1F3',
  aqua: '#58DBC2',
  charcoal: '#293847',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  surface: '#FFFFFF',
  background: '#F9FAFB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

function cx(...xs: (string | false | undefined | null)[]) {
  return xs.filter(Boolean).join(' ');
}

function money(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  });
}

function toK(n: number) {
  return money(n).replace(/\.00$/, '');
}

// Preferred city options (Ontario focus)
const CITY_OPTIONS = [
  'Ajax',
  'Arnprior',
  'Aurora',
  'Barrie',
  'Belleville',
  'Brampton',
  'Brantford',
  'Burlington',
  'Cambridge',
  'Clarington',
  'Cornwall',
  'East Gwillimbury',
  'Georgina',
  'Guelph',
  'Halton Hills',
  'Hamilton',
  'King',
  'Kingston',
  'Kitchener',
  'London',
  'Markham',
  'Milton',
  'Mississauga',
  'New Tecumseth',
  'Newmarket',
  'Niagara Falls',
  'Norfolk County',
  'Oakville',
  'Orangeville',
  'Oshawa',
  'Ottawa',
  'Peterborough',
  'Pickering',
  'Richmond Hill',
  'Sarnia',
  'Sault Ste. Marie',
  'Scugog',
  'St. Catharines',
  'Thunder Bay',
  'Toronto',
  'Vaughan',
  'Waterloo',
  'Welland',
  'Whitby',
  'Windsor',
  'Woodstock',
];

/********************
 * Inline Icons
 ********************/
const Icon = {
  Close: (p: any) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  ),
  Settings: (p: any) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
};

/********************
 * Small shared UI bits
 ********************/
function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-1.5">
      <div className="text-xs font-medium" style={{ color: COLORS.charcoal }}>
        {children}
      </div>
      {hint && (
        <div className="text-[11px]" style={{ color: COLORS.gray }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        'w-full h-10 px-3 rounded-lg border text-sm outline-none',
        'focus:ring-2 focus:ring-offset-0',
        props.className || ''
      )}
      style={{
        borderColor: COLORS.lightGray,
        ...(props.style || {}),
      }}
    />
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'px-3 py-1.5 rounded-full text-xs font-medium border',
        active ? 'shadow-sm' : ''
      )}
      style={{
        borderColor: active ? COLORS.coral : COLORS.lightGray,
        background: active ? COLORS.coralSoft : '#FFF',
        color: active ? COLORS.coral : COLORS.charcoal,
      }}
    >
      {children}
    </button>
  );
}

/********************
 * Toast system (prototype)
 ********************/

function useToasts() {
  const [toasts, setToasts] = React.useState<{ id: number; text: string }[]>(
    []
  );

  const push = (text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  return { toasts, push };
}

/********************
 * Tabs shell
 ********************/

type TabKey = 'plan' | 'evaluate' | 'select' | 'guide' | 'ai';

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
        <div className="absolute right-4 top-3 flex items-center gap-2">
          <button className="p-2 rounded-lg" aria-label="Close">
            <Icon.Close />
          </button>
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

function BottomNav({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const items: { key: TabKey; label: string }[] = [
    { key: 'plan', label: 'Plan' },
    { key: 'evaluate', label: 'Evaluate' },
    { key: 'select', label: 'Select' },
    { key: 'guide', label: 'Guide' },
    { key: 'ai', label: 'AI' },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur"
      style={{ borderColor: COLORS.lightGray }}
    >
      <div className="flex justify-around py-2">
        {items.map((item) => (
          <button
            key={item.key}
            className={cx(
              'flex-1 flex flex-col items-center gap-0.5 text-[11px] font-medium'
            )}
            onClick={() => onChange(item.key)}
          >
            <div
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background:
                  value === item.key ? COLORS.coralSoft : 'transparent',
                color: value === item.key ? COLORS.coral : COLORS.gray,
              }}
            >
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/********************
 * Stub modules
 * (In your real project these are replaced with full Plan/Evaluate/Select/Guide/AI modules.)
 ********************/

function PlanModule({
  onSuggest,
}: {
  onSuggest?: (what: 'guide' | 'ai') => void;
}) {
  return (
    <div className="p-4 space-y-3">
      <div className="text-sm font-semibold" style={{ color: COLORS.charcoal }}>
        Plan
      </div>
      <div className="text-xs" style={{ color: COLORS.gray }}>
        This is a placeholder for the full Plan module (readiness, down payment,
        city preferences, etc.).
      </div>
      <div className="flex gap-2 mt-2">
        <Chip onClick={() => onSuggest && onSuggest('guide')}>Go to Guide</Chip>
        <Chip onClick={() => onSuggest && onSuggest('ai')}>Go to AI</Chip>
      </div>
    </div>
  );
}

function EvaluateModule() {
  return (
    <div className="p-4">
      <div className="text-sm font-semibold" style={{ color: COLORS.charcoal }}>
        Evaluate
      </div>
      <div className="text-xs" style={{ color: COLORS.gray }}>
        Placeholder for the full Evaluate + Inspection experience.
      </div>
    </div>
  );
}

function SelectModule() {
  return (
    <div className="p-4">
      <div className="text-sm font-semibold" style={{ color: COLORS.charcoal }}>
        Select
      </div>
      <div className="text-xs" style={{ color: COLORS.gray }}>
        Placeholder for the full agent matching / select form.
      </div>
    </div>
  );
}

function GuideModule() {
  return (
    <div className="p-4">
      <div className="text-sm font-semibold" style={{ color: COLORS.charcoal }}>
        Guide
      </div>
      <div className="text-xs" style={{ color: COLORS.gray }}>
        Placeholder for the Renter to Owner: Home Buying Playbook video lessons.
      </div>
    </div>
  );
}

function AiModule() {
  return (
    <div className="p-4">
      <div className="text-sm font-semibold" style={{ color: COLORS.charcoal }}>
        AI
      </div>
      <div className="text-xs" style={{ color: COLORS.gray }}>
        Placeholder for your embedded custom GPT.
      </div>
    </div>
  );
}

/********************
 * Root App – Profile modal + shell
 ********************/

function ProfileModal({
  onClose,
  cobuyerEmail,
  onUpdateCobuyer,
  onToast,
}: {
  onClose: () => void;
  cobuyerEmail?: string;
  onUpdateCobuyer: (email: string | null) => void;
  onToast: (msg: string) => void;
}) {
  const [email, setEmail] = React.useState(cobuyerEmail || '');

  React.useEffect(() => {
    setEmail(cobuyerEmail || '');
  }, [cobuyerEmail]);

  const handleInvite = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      onToast('Please enter a co-buyer email');
      return;
    }
    onUpdateCobuyer(trimmed);
    onToast('Co-buyer invite sent (prototype)');
  };

  const handleRemove = () => {
    onUpdateCobuyer(null);
    onToast('Co-buyer removed');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-lg border p-4"
        style={{ borderColor: COLORS.lightGray }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-sm font-semibold"
            style={{ color: COLORS.charcoal }}
          >
            Profile & account
          </div>
          <button className="p-1.5" onClick={onClose} aria-label="Close profile">
            <Icon.Close />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <FieldLabel>Full name</FieldLabel>
            <TextInput placeholder="Your name" />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput placeholder="you@email.com" />
          </div>
          <div>
            <FieldLabel>Phone number</FieldLabel>
            <TextInput placeholder="Optional" />
          </div>

          {/* Co-buyer section */}
          <div
            className="pt-2 border-t"
            style={{ borderColor: COLORS.lightGray }}
          >
            <div className="flex items-baseline justify-between mb-1.5">
              <div
                className="text-xs font-medium"
                style={{ color: COLORS.charcoal }}
              >
                Co-buyer (optional)
              </div>
              {cobuyerEmail && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: COLORS.coralSoft, color: COLORS.coral }}
                >
                  Connected
                </span>
              )}
            </div>

            {!cobuyerEmail ? (
              <div className="space-y-2">
                <div
                  className="text-[11px]"
                  style={{ color: COLORS.gray }}
                >
                  Invite a partner, spouse, or family member to plan and rate
                  homes with you.
                </div>
                <TextInput
                  placeholder="Co-buyer’s email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  className="h-9 rounded-lg text-xs font-medium"
                  style={{ background: COLORS.coralSoft, color: COLORS.coral }}
                  onClick={handleInvite}
                >
                  Send invite (prototype)
                </button>
              </div>
            ) : (
              <div
                className="space-y-2 text-[11px]"
                style={{ color: COLORS.gray }}
              >
                <div>Co-buyer: {cobuyerEmail}</div>
                <button
                  className="h-9 rounded-lg text-xs font-medium border"
                  style={{ borderColor: COLORS.lightGray }}
                  onClick={handleRemove}
                >
                  Remove co-buyer
                </button>
              </div>
            )}
          </div>

          <button
            className="h-10 w-full rounded-xl text-sm font-medium"
            style={{ background: COLORS.coral, color: '#fff' }}
            onClick={onClose}
          >
            Save changes
          </button>
          <button
            className="h-10 w-full rounded-xl text-sm font-medium border"
            style={{ borderColor: COLORS.lightGray }}
            onClick={onClose}
          >
            Log out (prototype)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = React.useState<TabKey>('plan');
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [cobuyerEmail, setCobuyerEmail] = React.useState<string | null>(null);
  const { toasts, push } = useToasts();

  const suggest = (what: 'guide' | 'ai') => {
    if (what === 'guide') setTab('guide');
    else if (what === 'ai') setTab('ai');
    else push('Coming soon');
  };

  return (
    <div
      className="min-h-[100dvh] pb-16"
      style={{ background: COLORS.background }}
    >
      <Header
        title="Hausee Navigator"
        subtitle="Welcome back"
        onOpenProfile={() => setProfileOpen(true)}
        hasCobuyer={!!cobuyerEmail}
      />

      {tab === 'plan' && <PlanModule onSuggest={suggest} />}
      {tab === 'evaluate' && <EvaluateModule />}
      {tab === 'select' && <SelectModule />}
      {tab === 'guide' && <GuideModule />}
      {tab === 'ai' && <AiModule />}

      <BottomNav value={tab} onChange={setTab} />

      <div className="fixed bottom-16 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t: any) => (
          <div
            key={t.id}
            className="px-3 py-2 rounded-full text-xs shadow pointer-events-auto"
            style={{ background: COLORS.charcoal, color: '#fff' }}
          >
            {t.text}
          </div>
        ))}
      </div>

      {profileOpen && (
        <ProfileModal
          onClose={() => setProfileOpen(false)}
          cobuyerEmail={cobuyerEmail || undefined}
          onUpdateCobuyer={setCobuyerEmail}
          onToast={push}
        />
      )}
    </div>
  );
}
