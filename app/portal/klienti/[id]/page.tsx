"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./ClientDetail.module.css";
import { accountants, formatDateCZ, type VATPeriodicity } from "../../../../lib/demoPortalData";
import { usePortalStore } from "../../../../lib/demoPortalStore";

function tone(sev: "low" | "medium" | "high") {
  return sev === "high" ? "rgba(255,107,107,.95)" : sev === "medium" ? "rgba(240,195,106,.95)" : "rgba(110,231,183,.95)";
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { clients, activities, documentRequests, deadlines, updateClient } = usePortalStore();
  const client = clients.find((c) => c.id === id);
  const [tab, setTab] = useState<"nastaveni" | "kontakty" | "aktivita" | "rizika">("nastaveni");

  const clientActivities = useMemo(
    () => activities.filter((a) => a.clientId === id).slice(0, 12),
    [activities, id]
  );

  const stats = useMemo(() => {
    if (!id) return { missing: 0, blocked: 0 };
    const missing = documentRequests.filter((r) => r.clientId === id && r.status === "missing").length;
    const blocked = deadlines.filter((d) => d.clientId === id && d.state === "blocked").length;
    return { missing, blocked };
  }, [documentRequests, deadlines, id]);

  if (!client) {
    return (
      <div className={styles.page}>
        <div className={styles.breadcrumb}>
          <Link href="/portal/klienti" className={styles.back}>
            ← Klienti
          </Link>
        </div>
        <section className={styles.card} aria-label="Klient nenalezen">
          <div className={styles.sectionTitle}>Chyba</div>
          <div className={styles.h2}>Klient nenalezen</div>
          <div className={styles.muted} style={{ marginTop: 10, fontSize: 13 }}>
            V demo datech neexistuje klient s id „{String(id)}“.
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/portal/klienti" className={styles.back}>
          ← Klienti
        </Link>
        <span className={styles.muted}>Detail</span>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{client.name}</h1>
          <div className={styles.meta}>
            IČO {client.ico} • Správce: {client.accountManager} • Primární kontakt: {client.contacts[0]?.email}
          </div>
          <div className={styles.pills}>
            <span className={styles.pill}>
              <span className={styles.dot} style={{ background: client.vatPayer ? "rgba(159,231,209,.95)" : "rgba(255,255,255,.35)" }} aria-hidden />
              DPH: {client.vatPayer ? (client.vatPeriodicity === "monthly" ? "měsíční" : "čtvrtletní") : "neplátce"}
            </span>
            <span className={styles.pill}>
              <span className={styles.dot} style={{ background: client.payroll ? "rgba(159,231,209,.95)" : "rgba(255,255,255,.35)" }} aria-hidden />
              Mzdy: {client.payroll ? "ano" : "ne"}
            </span>
            <span className={styles.pill}>Podklady chybí: {stats.missing}</span>
            <span className={styles.pill}>Termíny blokované: {stats.blocked}</span>
          </div>
        </div>

        <div className={styles.btnRow} role="tablist" aria-label="Karty detailu klienta">
          <button type="button" className={`${styles.btn} ${tab === "nastaveni" ? styles.primary : ""}`} role="tab" aria-selected={tab === "nastaveni"} onClick={() => setTab("nastaveni")}>Nastavení</button>
          <button type="button" className={`${styles.btn} ${tab === "kontakty" ? styles.primary : ""}`} role="tab" aria-selected={tab === "kontakty"} onClick={() => setTab("kontakty")}>Kontakty</button>
          <button type="button" className={`${styles.btn} ${tab === "aktivita" ? styles.primary : ""}`} role="tab" aria-selected={tab === "aktivita"} onClick={() => setTab("aktivita")}>Aktivita</button>
          <button type="button" className={`${styles.btn} ${tab === "rizika" ? styles.primary : ""}`} role="tab" aria-selected={tab === "rizika"} onClick={() => setTab("rizika")}>Rizika</button>
        </div>
      </header>

      <section className={styles.grid} aria-label="Obsah detailu">
        <div className={styles.card}>
          {tab === "nastaveni" ? (
            <>
              <div className={styles.sectionTitle}>Nastavení</div>
              <div className={styles.h2}>Typové parametry klienta</div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="vat-period">DPH periodicita</label>
                  <select
                    id="vat-period"
                    className={styles.select}
                    value={client.vatPeriodicity}
                    onChange={(e) =>
                      updateClient(client.id, {
                        vatPeriodicity: e.target.value as VATPeriodicity,
                        vatPayer: e.target.value !== "nonPayer",
                      })
                    }
                  >
                    <option value="monthly">měsíční</option>
                    <option value="quarterly">čtvrtletní</option>
                    <option value="nonPayer">neplátce</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="payroll">Mzdy</label>
                  <select
                    id="payroll"
                    className={styles.select}
                    value={client.payroll ? "yes" : "no"}
                    onChange={(e) => updateClient(client.id, { payroll: e.target.value === "yes" })}
                  >
                    <option value="yes">ano</option>
                    <option value="no">ne</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="manager">Přiřazení (správce)</label>
                  <select
                    id="manager"
                    className={styles.select}
                    value={client.accountManager}
                    onChange={(e) => updateClient(client.id, { accountManager: e.target.value })}
                  >
                    {accountants.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.muted} style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
                V produkci by tato nastavení řídila automatické generování termínů i checklistů podkladů.
              </div>
            </>
          ) : null}

          {tab === "kontakty" ? (
            <>
              <div className={styles.sectionTitle}>Kontakty</div>
              <div className={styles.h2}>Osoby u klienta</div>
              <div className={styles.list}>
                {client.contacts.map((c) => (
                  <div key={c.email} className={styles.item}>
                    <div>
                      <div style={{ fontWeight: 950 }}>{c.name}</div>
                      <div className={styles.muted} style={{ marginTop: 6, fontSize: 13 }}>
                        {c.role ? `${c.role} • ` : ""}
                        {c.email}
                        {c.phone ? ` • ${c.phone}` : ""}
                      </div>
                    </div>
                    <button type="button" className={styles.btn} onClick={() => alert("Demo: napsat e-mail")}>Napsat</button>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {tab === "aktivita" ? (
            <>
              <div className={styles.sectionTitle}>Poslední aktivita</div>
              <div className={styles.h2}>Feed událostí</div>
              <div className={styles.list}>
                {clientActivities.map((a) => (
                  <div key={a.id} className={styles.item}>
                    <div>
                      <div style={{ fontWeight: 950 }}>{a.title}</div>
                      {a.detail ? (
                        <div className={styles.muted} style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45 }}>{a.detail}</div>
                      ) : null}
                    </div>
                    <div className={styles.muted} style={{ textAlign: "right", fontSize: 12 }}>
                      <div>{a.who}</div>
                      <div style={{ marginTop: 6 }}>{formatDateCZ(a.at)}</div>
                    </div>
                  </div>
                ))}
                {!clientActivities.length ? <div className={styles.muted}>Zatím bez aktivity.</div> : null}
              </div>
            </>
          ) : null}

          {tab === "rizika" ? (
            <>
              <div className={styles.sectionTitle}>Rizika</div>
              <div className={styles.h2}>Co hlídat</div>
              <div className={styles.list}>
                {client.risks.length ? (
                  client.risks.map((r) => (
                    <div key={r.id} className={styles.item}>
                      <div className={styles.risk}>
                        <span className={styles.dot} style={{ background: tone(r.severity), marginTop: 6 }} aria-hidden />
                        <div>
                          <div className={styles.riskTitle}>{r.title}</div>
                          {r.note ? (
                            <div className={styles.muted} style={{ marginTop: 6, fontSize: 13, lineHeight: 1.45 }}>{r.note}</div>
                          ) : null}
                        </div>
                      </div>
                      <button type="button" className={styles.btn} onClick={() => alert("Demo: upravit riziko")}>Upravit</button>
                    </div>
                  ))
                ) : (
                  <div className={styles.muted} style={{ fontSize: 13 }}>Bez evidovaných rizik.</div>
                )}
              </div>
              <div className={styles.btnRow}>
                <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => alert("Demo: přidat riziko")}>+ Přidat riziko</button>
              </div>
            </>
          ) : null}
        </div>

        <aside className={styles.card} aria-label="Rychlé akce">
          <div className={styles.sectionTitle}>Rychlé akce</div>
          <div className={styles.h2}>Praktické odkazy</div>
          <div className={styles.btnRow}>
            <Link href={`/portal/podklady`} className={`${styles.btn} ${styles.primary}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              Otevřít podklady
            </Link>
            <Link href={`/portal/terminy`} className={styles.btn} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              Otevřít termíny
            </Link>
            <Link href={`/portal/reporty`} className={styles.btn} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              Otevřít reporty
            </Link>
          </div>

          <div className={styles.muted} style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
            Pozn.: Filtry podle klienta jsou v demo zjednodušené. V produkci by se akce přenášely s kontextem klienta.
          </div>
        </aside>
      </section>
    </div>
  );
}
