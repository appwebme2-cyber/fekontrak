import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';

interface Props {
  onVerify: (pin: string) => Promise<{ ok: boolean; message?: string }>;
}

/** Layar kunci chatbot: PIN diperiksa server (sama dengan PIN fitur AI ekstraksi). */
export const ChatPinGate = ({ onVerify }: Props) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || checking) return;
    setChecking(true);
    setError(null);
    const result = await onVerify(pin.trim());
    setChecking(false);
    if (!result.ok) {
      setError(result.message ?? 'PIN salah.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col items-center justify-center gap-4 bg-gray-50/60 px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#004FA0]">
        <Lock className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900">Masukkan PIN</div>
        <div className="mt-1 text-xs text-gray-500">Asisten MAESTRO memakai PIN yang sama dengan fitur AI lainnya.</div>
      </div>
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        maxLength={32}
        placeholder="PIN"
        aria-label="PIN chatbot"
        className="w-40 rounded-xl border border-gray-200 px-3 py-2 text-center text-base tracking-[0.4em] focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/15"
      />
      {error && <div className="text-xs text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={!pin.trim() || checking}
        className="rounded-xl px-6 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
        style={{ background: '#E31E24' }}
      >
        {checking ? 'Memeriksa...' : 'Buka'}
      </button>
    </form>
  );
};
