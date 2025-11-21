import * as React from 'react';

/********************
 * THEME + BASICS
 ********************/
const COLORS = {
  coral: '#EF4D68',
  coralSoft: '#FFF1F3',
  aqua: '#58DBC2',
  charcoal: '#293847',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  background: '#F9FAFB',
};

function cx(...xs) {
  return xs.filter(Boolean).join(' ');
}

/********************
 * SHARED UI
 ********************/
function Header({ title, subtitle }) {
  return (
    <header className="w-full px-4 pt-6 pb-4 flex flex-col items-start">
      <div
        className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: COLORS.coral }}
      >
        Hausee
      </div>
      <h1
        className="mt-1 text-xl font-semibold"
        style={{ color: COLORS.charcoal }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-xs" style={{ color: COLORS.gray }}>
          {subtitle}
        </p>
      )}
    </header>
  );
}

function FieldLabel({ children }) {
  return (
    <div className="text-xs font-medium" style={{ color: COLORS.charcoal }}>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, error }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-11 px-3 mt-2 rounded-xl border text-sm bg-white"
      style={{ borderColor: error ? '#EF4444' : COLORS.lightGray }}
    />
  );
}

function AuthShell({ children }) {
  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: COLORS.background }}
    >
      <Header
        title="Hausee Navigator"
        subtitle="Sign in to your home-buying co-pilot"
      />
      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

/********************
 * TYPES + STORAGE (PROTO ONLY)
 ********************/
function loadProfile() {
  try {
    const raw = localStorage.getItem('hn_profile');
    if (!raw) return null;
    const p = JSON.parse(raw) || {};
    if (!p.email || !p.name) return null;
    return {
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      stage: p.stage || '',
      phoneVerifyPreference: p.phoneVerifyPreference || '',
      verified: !!p.verified,
    };
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem('hn_profile', JSON.stringify(profile));
  } catch {
    // ignore
  }
}

function clearProfile() {
  try {
    localStorage.removeItem('hn_profile');
  } catch {
    // ignore
  }
}

/********************
 * SCREENS
 ********************/
function SignUpScreen({ onComplete, switchToLogin }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [stage, setStage] = React.useState('');
  const [agree, setAgree] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!name || !email || !password || !agree || !stage) return;

    const profile = {
      name,
      email,
      phone,
      stage,
      phoneVerifyPreference: '',
      verified: false,
    };
    saveProfile(profile);
    onComplete(profile);
  };

  const showError = submitted;

  const stageOptions = [
    { value: 'dreaming', label: 'Dreaming about home buying' },
    { value: 'getting_ready', label: 'Getting ready to buy' },
    { value: 'actively_looking', label: 'Actively looking to buy' },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-sm border p-4"
      style={{ borderColor: COLORS.lightGray }}
    >
      <div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>
        Create your Hausee account
      </div>
      <div className="text-xs mt-1" style={{ color: COLORS.gray }}>
        Sign up to start planning, rating homes, and saving your progress.
      </div>

      <div className="mt-4">
        <FieldLabel>Full name *</FieldLabel>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          error={showError && !name}
        />
      </div>

      <div className="mt-4">
        <FieldLabel>Email address *</FieldLabel>
        <TextInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={showError && !email}
        />
      </div>

      <div className="mt-4">
        <FieldLabel>Mobile number (optional)</FieldLabel>
        <TextInput
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="647-555-1234"
        />
      </div>

      <div className="mt-4">
        <FieldLabel>Where are you in your home-buying journey? *</FieldLabel>
        <div className="mt-2 flex flex-col gap-2">
          {stageOptions.map((opt) => {
            const active = stage === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={cx(
                  'w-full text-left text-xs px-3 py-2 rounded-xl border',
                  active ? 'font-semibold' : ''
                )}
                style={{
                  borderColor:
                    showError && !stage
                      ? '#EF4444'
                      : active
                      ? COLORS.coral
                      : COLORS.lightGray,
                  background: active ? COLORS.coralSoft : '#FFFFFF',
                  color: active ? COLORS.charcoal : COLORS.gray,
                }}
                onClick={() => setStage(opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {showError && !stage && (
          <div className="text-xs mt-1" style={{ color: '#EF4444' }}>
            Please choose the option that best describes you.
          </div>
        )}
      </div>

      <div className="mt-4">
        <FieldLabel>Password *</FieldLabel>
        <input
          type="password"
          className="w-full h-11 px-3 mt-2 rounded-xl border text-sm bg-white"
          style={{ borderColor: showError && !password ? '#EF4444' : COLORS.lightGray }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
        />
      </div>

      <label
        className="mt-4 flex items-start gap-2 text-xs"
        style={{ color: COLORS.gray }}
      >
        <input
          type="checkbox"
          className="mt-1"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span>
          I agree to the <span className="underline">Terms</span> and{' '}
          <span className="underline">Privacy Policy</span>.
        </span>
      </label>
      {showError && !agree && (
        <div className="text-xs mt-1" style={{ color: '#EF4444' }}>
          You need to accept the terms to continue.
        </div>
      )}

      <button
        type="submit"
        className="mt-5 w-full h-11 rounded-xl text-sm font-semibold"
        style={{ background: COLORS.coral, color: '#fff' }}
      >
        Create account
      </button>

      <div className="mt-3 text-xs text-center" style={{ color: COLORS.gray }}>
        Already have an account?{' '}
        <button type="button" className="underline" onClick={switchToLogin}>
          Log in
        </button>
      </div>
    </form>
  );
}

function LoginScreen({ onLogin, switchToSignup }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!email || !password) return;

    const existing = loadProfile();
    const profile =
      existing && existing.email === email
        ? existing
        : {
            name: (existing && existing.name) || '',
            email,
            phone: (existing && existing.phone) || '',
            stage: (existing && existing.stage) || '',
            phoneVerifyPreference:
              (existing && existing.phoneVerifyPreference) || '',
            verified: (existing && existing.verified) || false,
          };

    saveProfile(profile);
    onLogin(profile);
  };

  const showError = submitted;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-sm border p-4"
      style={{ borderColor: COLORS.lightGray }}
    >
      <div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>
        Log in to Hausee Navigator
      </div>
      <div className="text-xs mt-1" style={{ color: COLORS.gray }}>
        Pick up where you left off with your home-buying plan.
      </div>

      <div className="mt-4">
        <FieldLabel>Email address *</FieldLabel>
        <TextInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={showError && !email}
        />
      </div>

      <div className="mt-4">
        <FieldLabel>Password *</FieldLabel>
        <input
          type="password"
          className="w-full h-11 px-3 mt-2 rounded-xl border text-sm bg-white"
          style={{ borderColor: showError && !password ? '#EF4444' : COLORS.lightGray }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
      </div>

      <div className="mt-2 text-xs text-right">
        <button
          type="button"
          className="underline"
          style={{ color: COLORS.gray }}
        >
          Forgot your password?
        </button>
      </div>

      <button
        type="submit"
        className="mt-4 w-full h-11 rounded-xl text-sm font-semibold"
        style={{ background: COLORS.coral, color: '#fff' }}
      >
        Log in
      </button>

      <div className="mt-3 text-xs text-center" style={{ color: COLORS.gray }}>
        Don&apos;t have an account?{' '}
        <button type="button" className="underline" onClick={switchToSignup}>
          Sign up
        </button>
      </div>
    </form>
  );
}

function VerifyEmailScreen({ profile, onVerified, onBackToLogin }) {
  const handleVerified = () => {
    const updated = { ...profile, verified: true };
    saveProfile(updated);
    onVerified(updated);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border p-4"
      style={{ borderColor: COLORS.lightGray }}
    >
      <div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>
        Verify your email
      </div>
      <div className="text-xs mt-1" style={{ color: COLORS.gray }}>
        We&apos;ve sent a verification link to{' '}
        <span className="font-medium">{profile.email}</span>. <br />
        Click the link in your inbox to activate your account.
      </div>

      <ul className="mt-4 text-xs space-y-1" style={{ color: COLORS.gray }}>
        <li>• Check your inbox and spam folder.</li>
        <li>• If you don&apos;t see it, try resending from your email client later.</li>
      </ul>

      <button
        type="button"
        className="mt-5 w-full h-11 rounded-xl text-sm font-semibold"
        style={{ background: COLORS.coral, color: '#fff' }}
        onClick={handleVerified}
      >
        I&apos;ve verified my email
      </button>

      <div className="mt-3 text-xs text-center" style={{ color: COLORS.gray }}>
        Wrong email?{' '}
        <button type="button" className="underline" onClick={onBackToLogin}>
          Use a different email
        </button>
      </div>
    </div>
  );
}

function PhoneVerifyPrompt({ profile, onChooseNow, onSkip }) {
  const handleNow = () => {
    const updated = { ...profile, phoneVerifyPreference: 'now' };
    saveProfile(updated);
    onChooseNow(updated);
  };

  const handleSkip = () => {
    const updated = { ...profile, phoneVerifyPreference: 'later' };
    saveProfile(updated);
    onSkip(updated);
  };

  const hasPhone = !!profile.phone;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border p-4"
      style={{ borderColor: COLORS.lightGray }}
    >
      <div className="text-base font-semibold" style={{ color: COLORS.charcoal }}>
        Verify your mobile number?
      </div>
      <div className="text-xs mt-1" style={{ color: COLORS.gray }}>
        We only use your mobile number to help matched agents contact you about
        your request. You can choose to confirm it now, or skip and do it later
        when you&apos;re ready.
      </div>

      <div className="mt-4 text-xs" style={{ color: COLORS.gray }}>
        Current number:{' '}
        <span className="font-medium">
          {hasPhone ? profile.phone : 'Not provided'}
        </span>
      </div>

      {hasPhone && (
        <button
          type="button"
          className="mt-4 w-full h-11 rounded-xl text-sm font-semibold"
          style={{ background: COLORS.coral, color: '#fff' }}
          onClick={handleNow}
        >
          Yes, verify this number now
        </button>
      )}

      <button
        type="button"
        className="mt-4 w-full h-11 rounded-xl text-xs font-medium border"
        style={{
          borderColor: COLORS.lightGray,
          color: COLORS.gray,
          background: '#FFFFFF',
        }}
        onClick={handleSkip}
      >
        Skip for now
      </button>
    </div>
  );
}

/********************
 * ROOT APP (FLOW PREVIEW)
 ********************/
export default function App() {
  const [profile, setProfile] = React.useState(() => loadProfile());
  const [view, setView] = React.useState(() => {
    const p = loadProfile();
    if (!p) return 'signup';
    return p.verified ? 'app' : 'verify';
  });

  if (view === 'signup') {
    return (
      <AuthShell>
        <SignUpScreen
          onComplete={(p) => {
            setProfile(p);
            setView('verify');
          }}
          switchToLogin={() => setView('login')}
        />
      </AuthShell>
    );
  }

  if (view === 'login') {
    return (
      <AuthShell>
        <LoginScreen
          onLogin={(p) => {
            setProfile(p);
            setView(p.verified ? 'app' : 'verify');
          }}
          switchToSignup={() => setView('signup')}
        />
      </AuthShell>
    );
  }

  if (view === 'phonePrompt' && profile) {
    return (
      <AuthShell>
        <PhoneVerifyPrompt
          profile={profile}
          onChooseNow={(updated) => {
            setProfile(updated);
            setView('verify');
          }}
          onSkip={(updated) => {
            setProfile(updated);
            setView('verify');
          }}
        />
      </AuthShell>
    );
  }

  if (view === 'verify' && profile) {
    return (
      <AuthShell>
        <VerifyEmailScreen
          profile={profile}
          onVerified={(p) => {
            setProfile(p);
            if (p.phone && !p.phoneVerifyPreference) {
              setView('phonePrompt');
            } else {
              setView('app');
            }
          }}
          onBackToLogin={() => {
            clearProfile();
            setProfile(null);
            setView('login');
          }}
        />
      </AuthShell>
    );
  }

  // Placeholder main app view once verified
  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: COLORS.background }}
    >
      <Header
        title="Hausee Navigator"
        subtitle="You are signed in and verified"
      />
      <div className="flex-1 px-4 pb-10">
        <div
          className="bg-white rounded-2xl shadow-sm border p-4 mt-4"
          style={{ borderColor: COLORS.lightGray }}
        >
          <div
            className="text-sm font-semibold"
            style={{ color: COLORS.charcoal }}
          >
            Navigator shell placeholder
          <div className="mt-4">
            <button
              type="button"
              className="w-full h-11 rounded-xl text-sm font-semibold border"
              style={{ borderColor: COLORS.lightGray, color: COLORS.gray, background: '#FFFFFF' }}
              onClick={() => {
                clearProfile();
                setProfile(null);
                setView('login');
              }}
            >
              Log out
            </button>
          </div>
          
          </div>
          <div className="text-xs mt-2" style={{ color: COLORS.gray }}>
            In the real build, this is where your Plan / Evaluate / Select /
            Guide / AI tabs will appear.
          </div>
        </div>
      </div>
    </div>
  );
}
