"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./KlientiPage.module.css";
import { formatDateCZ, type LawAreaType } from "../../../lib/demoPortalData";
import { usePortalStore } from "../../../lib/demoPortalStore";

function riskTone(sev: "low" | "medium" | "high") {
  return sev === "high" ? "rgba(255,107,107,.95)" : sev === "medium" ? "rgba(240,195,106,.95)" : "rgba(110,231,183,.95)";
}

const lawAreaLabels: Record<LawAreaType, string> = {
  obchodni: "Obchodní",
  pracovni: "Pracovní",
  rodinne: "Rodinné",
  trestni: "Trestní",
  spravni: "Správní",
  ostatni: "Ostatní",
};

export default function KlientiPage() {
  const { clients, documentRequests, deadlines, activities } = usePortalStore();

  const [q, setQ] = useState("");
  const [lawArea, setLawArea] = useState<"all" | LawAreaType>("all");
  const [risk, setRisk] = useState<"all" | "any" | "high">("all");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();

    return clients
      .filter((c) => (lawArea === "all" ? true : c.lawArea === lawArea))
      .filter((c) => {
        if (risk === "all") return true;
        const hasAny = c.risks.length > 0;
        const hasHigh = c.risks.some((r) => r.severity === "high");
        return risk === "any" ? hasAny : hasHigh;
      })
      .filter((c) => {
        if (!query) return true;
        const contact = c.contacts[0];
        return (
          c.name.toLowerCase().includes(query) ||
          (c.ico && c.ico.includes(query)) ||
          (c.caseNumber && c.caseNumber.toLowerCase().includes(query)) ||
          contact?.email.toLowerCase().includes(query) ||
          contact?.name.toLowerCase().includes(query)
        );
      })
      .map((c) => {
        const reqs = documentRequests.filter((r) => r.clientId === c.id);
        const missing = reqs.filter((r) => r.status === "missing").length;
        const waiting = reqs.filter((r) => r.status === "waiting").length;
        const dls = deadlines.filter((d) => d.clientId === c.id);
        const blocked = dls.filter((d) => d.state === "blocked").length;
        const last = activities.find((a) => a.clientId === c.id);
        return { c, missing, waiting, blocked, last };
      })
      .sort((a, b) => a.c.name.localeCompare(b.c.name));
  }, [clients, documentRequests, deadlines, activities, q, lawArea, risk]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Klienti</h1>
          <p className={styles.subtitle}>
            Praktický přehled pro advokátní kancelář: rychlé filtrování, indikace rizik, blokací a chybějících dokumentů.
            Kliknutím otevřete detail klienta.
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => alert("Demo: přidat klienta")}
          >
            + Nový klient
          </button>
        </div>
      </header>

      <section className={styles.card} aria-label="Filtry klientů">
        <div className={styles.filters}>
          <div className={styles.filter} style={{ flex: "1 1 240px", minWidth: 220 }}>
            <label className={styles.label} htmlFor="clients-q">Hledat</label>
            <input
              id="clients-q"
              className={styles.input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="název, IČO, sp. zn., e-mail…"
            />
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="clients-law-area">Právní oblast</label>
            <select
              id="clients-law-area"
              className={styles.select}
              value={lawArea}
              onChange={(e) => setLawArea(e.target.value as "all" | LawAreaType)}
            >
              <option value="all">Všechny oblasti</option>
              <option value="obchodni">Obchodní právo</option>
              <option value="pracovni">Pracovní právo</option>
              <option value="rodinne">Rodinné právo</option>
              <option value="trestni">Trestní právo</option>
              <option value="spravni">Správní právo</option>
              <option value="ostatni">Ostatní</option>
            </select>
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="clients-risk">Rizika</label>
            <select
              id="clients-risk"
              className={styles.select}
              value={risk}
              onChange={(e) => setRisk(e.target.value as "all" | "any" | "high")}
            >
              <option value="all">Vše</option>
              <option value="any">Má riziko</option>
              <option value="high">Vysoké</option>
            </select>
          </div>
        </div>
      </section>

      <section className={styles.card} aria-label="Seznam klientů">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Klient</th>
                <th className={styles.th}>Případ</th>
                <th className={styles.th}>Dokumenty</th>
                <th className={styles.th}>Termíny</th>
                <th className={styles.th}>Poslední aktivita</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, missing, waiting, blocked, last }) => (
                <tr key={c.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div style={{ fontWeight: 950 }}>
                      <Link href={`/portal/klienti/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {c.name}
                      </Link>
                    </div>
                    {c.ico && <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>IČO {c.ico}</div>}
                    <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>{c.contacts[0]?.email}</div>
                  </td>

                  <td className={styles.td}>
                    <div className={styles.pills}>
                      <span className={styles.pill}>Oblast: {lawAreaLabels[c.lawArea]}</span>
                      {c.caseNumber && <span className={styles.pill}>Sp. zn.: {c.caseNumber}</span>}
                      <span className={styles.pill}>Právník: {c.leadLawyer}</span>
                    </div>
                    {c.risks.length ? (
                      <div className={styles.pills} style={{ marginTop: 10 }}>
                        {c.risks.slice(0, 2).map((r) => (
                          <span key={r.id} className={styles.pill}>
                            <span className={styles.dot} style={{ background: riskTone(r.severity) }} aria-hidden />
                            {r.title}
                          </span>
                        ))}
                        {c.risks.length > 2 ? <span className={styles.pill}>+ {c.risks.length - 2} další</span> : null}
                      </div>
                    ) : (
                      <div className={styles.muted} style={{ fontSize: 12, marginTop: 10 }}>Bez rizik</div>
                    )}
                  </td>

                  <td className={styles.td}>
                    <div style={{ fontWeight: 900 }}>{missing}× chybí</div>
                    <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>{waiting}× čekáme</div>
                  </td>

                  <td className={styles.td}>
                    <div style={{ fontWeight: 900 }}>{blocked}× blokováno</div>
                    <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>viz Termíny</div>
                  </td>

                  <td className={styles.td}>
                    {last ? (
                      <>
                        <div style={{ fontWeight: 900 }}>{last.title}</div>
                        <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>{formatDateCZ(last.at)}</div>
                      </>
                    ) : (
                      <div className={styles.muted} style={{ fontSize: 12 }}>—</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
