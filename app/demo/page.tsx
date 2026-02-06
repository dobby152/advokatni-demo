"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { demoClient, demoRequests, demoTasks } from "../../lib/demoData";

type Tab = "přehled" | "podklady" | "termíny" | "komunikace" | "reporty";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card" style={{ padding: 16, background: "rgba(0,0,0,0.18)", boxShadow: "none" }}>
      <div className="kicker">{label}</div>
      <div className="display" style={{ fontSize: 28, marginTop: 6 }}>{value}</div>
      {hint ? <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>{hint}</div> : null}
    </div>
  );
}

function Dot({ tone }: { tone: "mint" | "brass" | "red" | "ok" }) {
  const c =
    tone === "mint" ? "rgba(159,231,209,.95)" :
    tone === "brass" ? "rgba(240,195,106,.95)" :
    tone === "ok" ? "rgba(110,231,183,.95)" :
    "rgba(255,107,107,.95)";
  return <span aria-hidden style={{ width: 9, height: 9, borderRadius: 999, background: c, boxShadow: `0 0 0 4px rgba(255,255,255,0.05)` }} />;
}

export default function Portal() {
  const [tab, setTab] = useState<Tab>("přehled");
  const [query, setQuery] = useState("");

  const requests = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return demoRequests;
    return demoRequests.filter((r) => r.title.toLowerCase().includes(q));
  }, [query]);

  const kpi = useMemo(() => {
    const waiting = demoRequests.filter((r) => r.status === "waiting").length;
    const missing = demoRequests.filter((r) => r.status === "missing").length;
    const received = demoRequests.filter((r) => r.status === "received").length;
    return { waiting, missing, received };
  }, []);

  return (
    <main>
      <div className="container" style={{ padding: "28px 0 34px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="kicker">klientský portál — demo</div>
            <div className="display" style={{ fontSize: 44, marginTop: 10, lineHeight: 0.96 }}>
              Přehled pro {demoClient.company}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 10, maxWidth: 720 }}>
              Ukázka: sběr podkladů (DPH/mzdy), termíny a komunikace. Vše je jen demo data – žádný backend.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn" href="/">← Landing</Link>
            <a className="btn btnPrimary" href={`mailto:${demoClient.contactEmail}?subject=Demo%20port%C3%A1lu%20%E2%80%93%20${encodeURIComponent(demoClient.company)}`}>Sdílet e‑mailem</a>
          </div>
        </div>

        <div style={{ marginTop: 18 }} className="hr" />

        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(["přehled", "podklady", "termíny", "komunikace", "reporty"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`btn ${tab === t ? "btnPrimary" : ""}`}
              onClick={() => setTab(t)}
              style={{ padding: "10px 14px" }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "přehled" ? (
          <section style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
            <Stat label="Přijaté" value={`${kpi.received}`} hint="Doklady spárované s obdobím" />
            <Stat label="Čekáme" value={`${kpi.waiting}`} hint="Klient ještě nedodal" />
            <Stat label="Chybí" value={`${kpi.missing}`} hint="Automaticky připomenout" />

            <div className="card" style={{ gridColumn: "1 / -1", padding: 18, background: "rgba(0,0,0,0.18)", boxShadow: "none" }}>
              <div className="kicker">rychlé akce</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <button className="btn btnPrimary" onClick={() => setTab("podklady")}>Zobrazit požadavky</button>
                <button className="btn" onClick={() => setTab("termíny")}>Otevřít termíny</button>
                <button className="btn" onClick={() => setTab("komunikace")}>Napsat zprávu</button>
              </div>
              <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 13 }}>
                V ostrém provozu by tyhle akce generovaly ticket, připomínku nebo notifikaci.
              </div>
            </div>

            <div className="card" style={{ gridColumn: "1 / -1", padding: 18, background: "rgba(0,0,0,0.18)", boxShadow: "none" }}>
              <div className="kicker">mini roadmap (demo)</div>
              <div className="display" style={{ fontSize: 22, marginTop: 8 }}>Co by klient viděl v praxi</div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {demoTasks.map((t) => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Dot tone={t.status === "done" ? "ok" : t.status === "doing" ? "mint" : "brass"} />
                      <div>
                        <div style={{ fontWeight: 650, fontSize: 13 }}>{t.title}</div>
                        <div style={{ color: "var(--muted2)", fontSize: 12 }}>{t.owner}</div>
                      </div>
                    </div>
                    <div style={{ color: "var(--muted2)", fontSize: 12, whiteSpace: "nowrap" }}>{t.due}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === "podklady" ? (
          <section style={{ marginTop: 18 }}>
            <div className="card" style={{ padding: 18, background: "rgba(0,0,0,0.18)", boxShadow: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div className="kicker">požadavky na doklady</div>
                  <div className="display" style={{ fontSize: 26, marginTop: 8 }}>Checklist pro tento měsíc</div>
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Hledat…"
                  style={{
                    width: 260,
                    maxWidth: "100%",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.06)",
                    padding: "12px 14px",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginTop: 14 }} className="hr" />

              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {requests.map((r) => (
                  <div key={r.id} className="card" style={{ padding: 14, background: "rgba(255,255,255,0.04)", boxShadow: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6, lineHeight: 1.45 }}>{r.note}</div>
                      </div>
                      <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                        <span className="badge" style={{ padding: "6px 10px" }}>
                          <Dot tone={r.status === "received" ? "ok" : r.status === "missing" ? "red" : "brass"} />
                          {r.status === "received" ? "přijato" : r.status === "missing" ? "chybí" : "čekáme"}
                        </span>
                        <div className="badge" style={{ padding: "6px 10px", borderColor: "rgba(255,255,255,0.10)" }}>
                          termín <b style={{ marginLeft: 8, color: "var(--text)" }}>{r.due}</b>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button className="btn btnPrimary" onClick={() => alert("Demo: otevřel by se upload modal a spárování s obdobím.")}>Nahrát doklady</button>
                      <button className="btn" onClick={() => alert("Demo: vytvořit automatickou upomínku + e-mail klientovi.")}>Poslat připomínku</button>
                      <button className="btn" onClick={() => alert("Demo: přidat poznámku k požadavku.")}>Poznámka</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === "termíny" ? (
          <section style={{ marginTop: 18 }}>
            <div className="card" style={{ padding: 18, background: "rgba(0,0,0,0.18)", boxShadow: "none" }}>
              <div className="kicker">termíny</div>
              <div className="display" style={{ fontSize: 26, marginTop: 8 }}>Časová osa povinností</div>
              <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 13 }}>
                Demo ukázka: v ostrém provozu by se termíny generovaly podle typu klienta (plátce DPH, mzdy, četnost) a hlídaly by se kompletace podkladů.
              </div>

              <div style={{ marginTop: 14 }} className="hr" />

              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {[{
                  t: "DPH přiznání", d: "25. 2.", s: "brass" as const, b: "Čekáme na doplnění přijatých faktur" },
                { t: "Mzdy — odeslání podkladů", d: "18. 2.", s: "red" as const, b: "Chybí docházka / změny" },
                { t: "Kontrola banky", d: "5. 2.", s: "ok" as const, b: "Výpisy importované" },
                { t: "Měsíční report", d: "poslední den v měsíci", s: "mint" as const, b: "Připravit a sdílet PDF" },].map((x) => (
                  <div key={x.t} className="card" style={{ padding: 14, background: "rgba(255,255,255,0.04)", boxShadow: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <Dot tone={x.s} />
                        <div>
                          <div style={{ fontWeight: 750, fontSize: 14 }}>{x.t}</div>
                          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 5 }}>{x.b}</div>
                        </div>
                      </div>
                      <div className="badge" style={{ padding: "6px 10px" }}>
                        {x.d}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === "komunikace" ? (
          <section style={{ marginTop: 18 }}>
            <div className="card" style={{ padding: 18, background: "rgba(0,0,0,0.18)", boxShadow: "none" }}>
              <div className="kicker">komunikace</div>
              <div className="display" style={{ fontSize: 26, marginTop: 8 }}>Zprávy k projektu</div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {[
                  { a: "MAR‑EKON", m: "Prosím doplnit docházku k únoru (mzdy).", t: "před 2 h" },
                  { a: "Klient", m: "Doplním dnes odpoledne, díky.", t: "před 1 h" },
                  { a: "MAR‑EKON", m: "Super — pak to zpracujeme a pošleme náhled výplat.", t: "před 45 min" },
                ].map((x, i) => (
                  <div key={i} className="card" style={{ padding: 14, background: "rgba(255,255,255,0.04)", boxShadow: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 750, fontSize: 13 }}>{x.a}</div>
                      <div style={{ color: "var(--muted2)", fontSize: 12 }}>{x.t}</div>
                    </div>
                    <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>{x.m}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                <input
                  placeholder="Napište zprávu…"
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.06)",
                    padding: "12px 14px",
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
                <button className="btn btnPrimary" onClick={() => alert("Demo: odeslání zprávy do kanálu projektu.")}>Odeslat</button>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "reporty" ? (
          <section style={{ marginTop: 18 }}>
            <div className="card" style={{ padding: 18, background: "rgba(0,0,0,0.18)", boxShadow: "none" }}>
              <div className="kicker">reporty</div>
              <div className="display" style={{ fontSize: 26, marginTop: 8 }}>Přehledy pro majitele</div>
              <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
                Demo ukazuje, jak by klient dostal jednoduché „manažerské“ metriky. V reálu by to bralo data z účetnictví (bez ručního přepisování).
              </div>

              <div style={{ marginTop: 14 }} className="hr" />

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                <Stat label="Cashflow (odhad)" value="+ 82 000 Kč" hint="Příjmy − výdaje za 30 dní" />
                <Stat label="Náklady" value="214 500 Kč" hint="Top 5 kategorií" />
                <Stat label="Výnosy" value="296 700 Kč" hint="Fakturace + tržby" />
              </div>

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 12 }}>
                <div className="card" style={{ padding: 16, background: "rgba(255,255,255,0.04)", boxShadow: "none" }}>
                  <div className="kicker">komentář účetní</div>
                  <div className="display" style={{ fontSize: 20, marginTop: 8 }}>Co bych řešil tento měsíc</div>
                  <ul style={{ marginTop: 12, marginBottom: 0, paddingLeft: 18, color: "var(--muted)", lineHeight: 1.65, fontSize: 13 }}>
                    <li>zrychlit sběr dokladů (DPH) → méně nahánění</li>
                    <li>nastavit schvalování jen pro výjimky (nad limit)</li>
                    <li>pravidelný report: náklady na zaměstnance vs. výkon</li>
                  </ul>
                </div>
                <div className="card" style={{ padding: 16, background: "rgba(255,255,255,0.04)", boxShadow: "none" }}>
                  <div className="kicker">exporty</div>
                  <div className="display" style={{ fontSize: 20, marginTop: 8 }}>Jedním klikem</div>
                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    <button className="btn" onClick={() => alert("Demo: export do Pohoda/ABRA/…")}>Export do účetního SW</button>
                    <button className="btn" onClick={() => alert("Demo: PDF report pro majitele")}>PDF report</button>
                    <button className="btn btnPrimary" onClick={() => alert("Demo: poslat report e‑mailem")}>Odeslat report</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <div style={{ marginTop: 24, color: "var(--muted2)", fontSize: 12 }}>
          Pozn.: Demo je statické a slouží jen pro vizualizaci — skutečná integrace (doklady/DPH/mzdy) se doplní až po odsouhlasení procesu.
        </div>
      </div>
    </main>
  );
}
