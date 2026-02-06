"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function parseNum(x: string | null) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

export default function StartGate() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const params = useMemo(() => {
    const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const leadId = parseNum(sp.get("leadId"));
    return {
      leadId,
      slug: sp.get("slug") || "",
      event: sp.get("event") || "demo_confirmed_open",
      ts: sp.get("ts") || "",
      nonce: sp.get("nonce") || "",
      sig: sp.get("sig") || "",
      to: sp.get("to") || "/portal",
    };
  }, []);

  async function confirm() {
    setErr(null);
    setSending(true);
    try {
      const base = process.env.NEXT_PUBLIC_TRACK_BASE || "https://connect.askela.cz";
      const res = await fetch(`${base}/api/public/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: params.leadId,
          slug: params.slug,
          event: params.event,
          ts: params.ts,
          nonce: params.nonce,
          sig: params.sig,
          meta: {
            demo: "mar-ekon-demo",
            path: params.to,
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      setSent(true);
    } catch (e: any) {
      setErr(e?.message || "Nepodařilo se potvrdit otevření");
    } finally {
      setSending(false);
    }
  }

  return (
    <main>
      <div className="container" style={{ padding: "48px 0" }}>
        <div className="card" style={{ padding: 22, maxWidth: 820, margin: "0 auto" }}>
          <div className="kicker">potvrzení otevření dema</div>
          <div className="display" style={{ fontSize: 34, marginTop: 10 }}>
            Otevřít demo dashboard
          </div>
          <p style={{ color: "var(--muted)", marginTop: 10, lineHeight: 1.55 }}>
            Pro přesné měření v CRM zaznamenáme, že jste demo opravdu otevřeli. Poté Vás přesměrujeme do
            dashboardu.
          </p>

          <div style={{ marginTop: 14 }} className="hr" />

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btnPrimary" onClick={confirm} disabled={sending || sent}>
              {sent ? "Potvrzeno" : sending ? "Odesílám…" : "Potvrdit a otevřít"}
            </button>
            <Link className="btn" href={params.to}>
              Přeskočit (bez trackingu)
            </Link>
          </div>

          {err ? (
            <div className="card" style={{ marginTop: 12, padding: 12, background: "rgba(255,107,107,0.10)", boxShadow: "none" }}>
              <div style={{ color: "rgba(255,200,200,0.95)", fontSize: 13 }}>
                Chyba trackingu: {err}
              </div>
            </div>
          ) : null}

          {sent ? (
            <div style={{ marginTop: 14, color: "var(--muted)" }}>
              Přesměrování…
              <meta httpEquiv="refresh" content={`1;url=${params.to}`} />
            </div>
          ) : null}

          <div style={{ marginTop: 14, color: "var(--muted2)", fontSize: 12 }}>
            leadId: {params.leadId ?? "—"} • slug: {params.slug || "—"}
          </div>
        </div>
      </div>
    </main>
  );
}
