"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const PIN_LENGTH = 4;

export default function PinPad() {
  const router = useRouter();
  const [pin,     setPin]     = useState<string>("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleDigit = useCallback((digit: string) => {
    if (loading || pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    setError("");
    if (next.length === PIN_LENGTH) {
      submitPin(next);
    }
  }, [pin, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = useCallback(() => {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
    setError("");
  }, [loading]);

  const submitPin = async (value: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: value }),
      });
      if (res.ok) {
        router.push("/aria");
        router.refresh();
      } else {
        setShaking(true);
        setPin("");
        setError("PIN incorrect");
        setTimeout(() => setShaking(false), 500);
      }
    } catch {
      setError("Erreur réseau");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const keys = ["1","2","3","4","5","6","7","8","9"];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-xs mx-auto">

      {/* PIN dots */}
      <div
        className={`flex gap-4 ${shaking ? "animate-shake" : ""}`}
        aria-label={`PIN: ${pin.length} sur ${PIN_LENGTH} chiffres saisis`}
        role="status"
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
              i < pin.length
                ? "bg-aria-accent border-aria-accent scale-110"
                : "border-aria-dim bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm font-sans text-center -mt-4" role="alert">
          {error}
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => handleDigit(k)}
            disabled={loading}
            className="h-16 rounded-xl bg-aria-surface border border-aria-border text-aria-text font-condensed font-900 text-2xl tracking-wide active:bg-aria-card active:scale-95 transition-all duration-100 disabled:opacity-40 select-none"
            aria-label={`Touche ${k}`}
          >
            {k}
          </button>
        ))}

        {/* Bottom row: empty | 0 | backspace */}
        <div className="h-16" aria-hidden="true" />

        <button
          onClick={() => handleDigit("0")}
          disabled={loading}
          className="h-16 rounded-xl bg-aria-surface border border-aria-border text-aria-text font-condensed font-900 text-2xl tracking-wide active:bg-aria-card active:scale-95 transition-all duration-100 disabled:opacity-40 select-none"
          aria-label="Touche 0"
        >
          0
        </button>

        <button
          onClick={handleBack}
          disabled={loading || pin.length === 0}
          className="h-16 rounded-xl bg-aria-surface border border-aria-border text-aria-muted active:bg-aria-card active:scale-95 transition-all duration-100 disabled:opacity-20 flex items-center justify-center select-none"
          aria-label="Effacer"
        >
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <path d="M8.5 1H21V15H8.5L1 8L8.5 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M13 5.5L17 10.5M17 5.5L13 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {loading && (
        <div className="flex gap-1.5" aria-label="Vérification en cours">
          {[0,1,2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-aria-accent animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
