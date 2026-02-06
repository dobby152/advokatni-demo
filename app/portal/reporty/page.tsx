"use client";

import { useMemo, useState } from "react";
import styles from "./ReportyPage.module.css";
import { formatDateCZ, periodLabel, type PeriodKey } from "../../../lib/demoPortalData";
import { usePortalStore } from "../../../lib/demoPortalStore";

function Dot({ published }: { published: boolean }) {
  const c = published ? "rgba(110,231,183,.95)" : "rgba(240,195,106,.95)";
  return <span className={styles.dot} style={{ background: c }} aria-hidden />;
}

export default function ReportyPage() {
  const { clients, reports, publishReport } = usePortalStore();

  const [clientId, setClientId] = useState<string>(clients[0]?.id ?? "cl-001");
  const [period, setPeriod] = useState<PeriodKey>("2026-01");

  const client = clients.find((c) => c.id === clientId);

  const packageReports = useMemo(() => {
    return reports
      .filter((r) => r.clientId === clientId && r.period === period)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [reports, clientId, period]);

  const publishedHistory = useMemo(() => {
    return reports
      .filter((r) => r.clientId === clientId && r.publishedAt)
      .slice()
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
      .slice(0, 10);
  }, [reports, clientId]);

  const exportPackage = () => {
    alert("Demo: export balíčku reportů (PDF/ZIP) – bez backendu");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Reporty</h1>
          <p className={styles.subtitle}>
            Měsíční balíček reportů (DPH rekap, mzdy, cashflow) + historie publikovaných výstupů. Publikace je v demo pouze
            přepnutí stavu + záznam do historie.
          </p>
        </div>
      </header>

      <section className={styles.card} aria-label="Filtry reportů">
        <div className={styles.filters}>
          <div className={styles.filter} style={{ flex: "1 1 260px", minWidth: 220 }}>
            <label className={styles.label} htmlFor="rep-client">Klient</label>
            <select id="rep-client" className={styles.select} value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filter}>
            <label className={styles.label} htmlFor="rep-period">Období</label>
            <select id="rep-period" className={styles.select} value={period} onChange={(e) => setPeriod(e.target.value as PeriodKey)}>
              <option value="2026-01">{periodLabel("2026-01")}</option>
              <option value="2026-02">{periodLabel("2026-02")}</option>
            </select>
          </div>

          <div className={styles.filter} style={{ minWidth: 220 }}>
            <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={exportPackage}>
              Exportovat balíček (demo)
            </button>
            <div className={styles.muted} style={{ fontSize: 12, marginTop: 8 }}>
              V produkci: PDF, ZIP, sdílení do portálu a e‑mail majiteli.
            </div>
          </div>
        </div>
      </section>

      <section className={styles.grid} aria-label="Balíček a historie">
        <div className={styles.card}>
          <div style={{ fontSize: 12, color: "var(--muted2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Balíček
          </div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 950 }}>
            {client?.name ?? "—"} • {periodLabel(period)}
          </div>

          <div className={styles.pack}>
            {packageReports.length ? (
              packageReports.map((r) => {
                const published = Boolean(r.publishedAt);
                return (
                  <div key={r.id} className={styles.item}>
                    <div>
                      <div className={styles.itemTitle}>{r.title}</div>
                      <div className={styles.itemDesc}>{r.description}</div>
                      <div className={styles.muted} style={{ fontSize: 12, marginTop: 8 }}>
                        Aktualizováno: {formatDateCZ(r.updatedAt)}
                      </div>
                    </div>
                    <div className={styles.pills}>
                      <span className={styles.pill}>
                        <Dot published={published} /> {published ? "Publikováno" : "Draft"}
                      </span>
                      {published ? (
                        <span className={styles.pill}>Publ.: {formatDateCZ(r.publishedAt!)}</span>
                      ) : (
                        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => publishReport(r.id)}>
                          Označit jako publikováno
                        </button>
                      )}
                      <button type="button" className={styles.btn} onClick={() => alert("Demo: otevřít náhled reportu")}
                      >
                        Náhled
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.muted} style={{ fontSize: 13, marginTop: 12 }}>
                Pro daného klienta a období nejsou v demo datech reporty. (V produkci by se generovaly automaticky.)
              </div>
            )}
          </div>
        </div>

        <aside className={styles.card} aria-label="Historie publikovaných reportů">
          <div style={{ fontSize: 12, color: "var(--muted2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Historie
          </div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 950 }}>Publikované reporty</div>
          <div className={styles.history}>
            {publishedHistory.length ? (
              publishedHistory.map((r) => (
                <div key={r.id} className={styles.hItem}>
                  <div>
                    <div style={{ fontWeight: 950 }}>{r.title}</div>
                    <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>
                      {periodLabel(r.period)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className={styles.muted} style={{ fontSize: 12 }}>Publikováno</div>
                    <div style={{ marginTop: 6, fontSize: 12 }}>{formatDateCZ(r.publishedAt!)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.muted} style={{ fontSize: 13, marginTop: 12 }}>
                Zatím nic publikováno.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
