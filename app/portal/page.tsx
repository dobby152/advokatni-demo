"use client";

import styles from "./DashboardPage.module.css";
import {
  clientById,
  daysUntil,
  demoActivities,
  demoDeadlines,
  demoDocumentRequests,
  formatDateCZ,
  stateLabel,
  statusLabel,
} from "../../lib/demoPortalData";

function Dot({ tone }: { tone: "mint" | "brass" | "red" | "ok" }) {
  const c =
    tone === "mint"
      ? "rgba(159,231,209,.95)"
      : tone === "brass"
        ? "rgba(240,195,106,.95)"
        : tone === "ok"
          ? "rgba(110,231,183,.95)"
          : "rgba(255,107,107,.95)";
  return <span className={styles.dot} style={{ background: c }} aria-hidden />;
}

export default function PortalOverview() {
  const missing = demoDocumentRequests.filter((r) => r.status === "missing");
  const waiting = demoDocumentRequests.filter((r) => r.status === "waiting");
  const received = demoDocumentRequests.filter((r) => r.status === "received");

  const blockedDeadlines = demoDeadlines.filter((d) => d.state === "blocked");
  const riskDeadlines = demoDeadlines.filter((d) => d.state === "risk");

  const missingTop = [...missing, ...waiting]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  const timeline = [...demoDeadlines]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const feed = [...demoActivities].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Přehled portálu</h1>
          <p className={styles.subtitle}>
            Produkční dashboard pro účetní kancelář MAR‑EKON: KPI, chybějící podklady, termíny a aktivita. Všechna data jsou
            realistická demo data (bez backendu).
          </p>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${styles.primary}`} type="button" onClick={() => alert("Demo: vytvořit nový požadavek na podklady")}
          >
            + Nový požadavek
          </button>
          <button className={styles.actionBtn} type="button" onClick={() => alert("Demo: odeslat hromadnou připomínku")}
          >
            Odeslat připomínky
          </button>
        </div>
      </header>

      <section className={styles.kpiGrid} aria-label="KPI přehled">
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardLabel}>Chybí</div>
            <span className={styles.badge}>
              <Dot tone="red" /> kritické
            </span>
          </div>
          <div className={styles.cardValue}>{missing.length}</div>
          <div className={styles.cardHint}>Podklady blokují uzávěrku (mzdy/DPH) – poslat připomínku.</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardLabel}>Čekáme</div>
            <span className={styles.badge}>
              <Dot tone="brass" /> otevřené
            </span>
          </div>
          <div className={styles.cardValue}>{waiting.length}</div>
          <div className={styles.cardHint}>Klient ještě nedodal vše k aktuálnímu období.</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardLabel}>Přijato</div>
            <span className={styles.badge}>
              <Dot tone="ok" /> hotovo
            </span>
          </div>
          <div className={styles.cardValue}>{received.length}</div>
          <div className={styles.cardHint}>Doklady nahrané a spárované s obdobím.</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardLabel}>Termíny v riziku</div>
            <span className={styles.badge}>
              <Dot tone="mint" /> hlídáme
            </span>
          </div>
          <div className={styles.cardValue}>{blockedDeadlines.length + riskDeadlines.length}</div>
          <div className={styles.cardHint}>Blokované nebo těsně před termínem – podle pravidel připomínek.</div>
        </div>
      </section>

      <section className={styles.grid} aria-label="Dashboard obsah">
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardLabel}>Chybějící podklady</div>
              <div className={styles.cardHint}>Prioritní seznam pro zpracování. Kliknutí by v produkci otevřelo detail.</div>
            </div>
            <div className={styles.badge}>{missingTop.length} položek</div>
          </div>

          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Klient</th>
                  <th className={styles.th}>Požadavek</th>
                  <th className={styles.th}>Stav</th>
                  <th className={`${styles.th} ${styles.right}`}>Termín</th>
                </tr>
              </thead>
              <tbody>
                {missingTop.map((r) => {
                  const cl = clientById(r.clientId);
                  const dueIn = daysUntil(r.dueDate);
                  const tone = r.status === "missing" ? "red" : "brass";
                  return (
                    <tr key={r.id} className={styles.tr}>
                      <td className={styles.td}>
                        <div style={{ fontWeight: 750 }}>{cl?.name ?? "—"}</div>
                        <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
                          IČO {cl?.ico}
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div style={{ fontWeight: 700 }}>{r.title}</div>
                        {r.note ? <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>{r.note}</div> : null}
                      </td>
                      <td className={styles.td}>
                        <span className={styles.status}>
                          <Dot tone={tone} />
                          <span>{statusLabel(r.status)}</span>
                        </span>
                      </td>
                      <td className={`${styles.td} ${styles.right}`}>
                        <div style={{ fontWeight: 750 }}>{formatDateCZ(r.dueDate)}</div>
                        <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
                          {dueIn <= 0 ? "dnes" : `za ${dueIn} dní`}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardLabel}>Timeline termínů</div>
              <div className={styles.cardHint}>Co vás čeká nejdřív.</div>
            </div>
            <div className={styles.badge}>{timeline.length}</div>
          </div>

          <div className={styles.timeline} style={{ marginTop: 10 }}>
            {timeline.map((d) => {
              const cl = clientById(d.clientId);
              const dueIn = daysUntil(d.date);
              const tone = d.state === "ok" ? "ok" : d.state === "risk" ? "brass" : "red";
              return (
                <div key={d.id} className={styles.timelineItem}>
                  <div>
                    <div className={styles.timelineTitle}>{d.title}</div>
                    <div className={styles.timelineHint}>
                      {cl?.name ?? "—"}
                      {d.hint ? ` • ${d.hint}` : ""}
                    </div>
                  </div>
                  <div className={styles.timelineMeta}>
                    <span className={styles.pill}>
                      <Dot tone={tone} /> {stateLabel(d.state)}
                    </span>
                    <span className={styles.pill}>{dueIn <= 0 ? "dnes" : `za ${dueIn} dní`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.card} aria-label="Aktivita">
        <div className={styles.cardHeader}>
          <div>
            <div className={styles.cardLabel}>Aktivita</div>
            <div className={styles.cardHint}>Poslední změny a události v portálu.</div>
          </div>
          <button className={styles.actionBtn} type="button" onClick={() => alert("Demo: zobrazit všechnu aktivitu")}
          >
            Zobrazit vše
          </button>
        </div>

        <div className={styles.feed} style={{ marginTop: 10 }}>
          {feed.map((a) => {
            const cl = clientById(a.clientId);
            const when = new Date(a.at).toLocaleString("cs-CZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
            const tone = a.kind === "upload" ? "ok" : a.kind === "reminder" ? "brass" : "mint";
            return (
              <div key={a.id} className={styles.feedItem}>
                <div className={styles.feedTop}>
                  <div className={styles.feedTitle}>
                    <span className={styles.status}>
                      <Dot tone={tone} />
                      <span>{a.title}</span>
                    </span>
                  </div>
                  <div className={styles.feedWhen}>{when}</div>
                </div>
                <div className={styles.feedDetail}>
                  <b>{cl?.name ?? "—"}</b> • {a.who}
                  {a.detail ? ` — ${a.detail}` : ""}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
