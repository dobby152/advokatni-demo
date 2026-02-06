"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TerminyPage.module.css";
import {
  computeDeadlineState,
  type Deadline,
  formatDateCZ,
  stateLabel,
} from "../../../lib/demoPortalData";
import { usePortalStore } from "../../../lib/demoPortalStore";

function Dot({ tone }: { tone: "brass" | "red" | "ok" }) {
  const c = tone === "brass" ? "rgba(240,195,106,.95)" : tone === "ok" ? "rgba(110,231,183,.95)" : "rgba(255,107,107,.95)";
  return <span className={styles.dot} style={{ background: c }} aria-hidden />;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className={styles.toggle}>
      <button
        type="button"
        className={`${styles.switch} ${checked ? styles.switchOn : ""}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} aria-hidden />
      </button>
      <span style={{ fontSize: 13, fontWeight: 750 }}>{label}</span>
    </div>
  );
}

const weekdays = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function buildReminderEmail(args: {
  clientName: string;
  contactName?: string;
  deadlineTitle: string;
  deadlineDate: string;
  missingDocs: Array<{ title: string; dueDate: string; status: string }>;
}) {
  const greeting = args.contactName ? `Dobrý den, ${args.contactName},` : "Dobrý den,";
  const list = args.missingDocs.length
    ? args.missingDocs.map((d) => `- ${d.title} (termín: ${formatDateCZ(d.dueDate)}, stav: ${d.status})`).join("\n")
    : "- (žádné)";

  return [
    `Předmět: Připomínka – ${args.clientName} – ${args.deadlineTitle}`,
    "",
    greeting,
    "",
    `blíží se termín: ${args.deadlineTitle} (${formatDateCZ(args.deadlineDate)}).`,
    "",
    "Prosíme o doplnění následujících podkladů:",
    list,
    "",
    "Děkujeme.",
    "MAR‑EKON / Askela",
  ].join("\n");
}

export default function TerminyPage() {
  const { clients, documentRequests, deadlines, reminderRules, updateReminderRule, sendReminderForDeadline } = usePortalStore();

  const [selectedDeadlineId, setSelectedDeadlineId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  const computedDeadlines = useMemo(() => {
    return deadlines
      .map((d) => ({ ...d, state: computeDeadlineState(d, documentRequests) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [deadlines, documentRequests]);

  const calCells = useMemo(() => {
    const daysInMonth = 28;
    // 2026-02-01 is Sunday; we want Monday-first; so offset = 6
    const offset = 6;
    const cells: Array<{ day: number | null; iso?: string }> = [];
    for (let i = 0; i < offset; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `2026-02-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, iso });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null });
    return cells;
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const d of computedDeadlines) {
      if (!map.has(d.date)) map.set(d.date, []);
      map.get(d.date)!.push(d);
    }
    return map;
  }, [computedDeadlines]);

  const selectedDeadline = useMemo(
    () => (selectedDeadlineId ? computedDeadlines.find((d) => d.id === selectedDeadlineId) ?? null : null),
    [selectedDeadlineId, computedDeadlines]
  );

  const selectedRule = useMemo(() => {
    if (!selectedDeadline) return null;
    return reminderRules.find((r) => r.clientId === selectedDeadline.clientId) ?? null;
  }, [selectedDeadline, reminderRules]);

  const missingForSelected = useMemo(() => {
    if (!selectedDeadline?.dependsOn?.length) return [];
    return documentRequests
      .filter((r) => selectedDeadline.dependsOn!.includes(r.id))
      .filter((r) => r.status !== "received")
      .map((r) => ({ title: r.title, dueDate: r.dueDate, status: r.status }));
  }, [selectedDeadline, documentRequests]);

  const openDeadline = (d: Deadline) => {
    setSelectedDeadlineId(d.id);
    const cl = clients.find((c) => c.id === d.clientId);
    const missingDocs = (d.dependsOn ?? [])
      .map((id) => documentRequests.find((r) => r.id === id))
      .filter(Boolean)
      .filter((r) => r!.status !== "received")
      .map((r) => ({ title: r!.title, dueDate: r!.dueDate, status: r!.status }));

    setPreviewText(
      buildReminderEmail({
        clientName: cl?.name ?? "Klient",
        contactName: cl?.contacts?.[0]?.name,
        deadlineTitle: d.title,
        deadlineDate: d.date,
        missingDocs,
      })
    );
  };

  useEffect(() => {
    if (!selectedDeadline) return;
    // focus modal
    setTimeout(() => modalRef.current?.focus(), 0);
  }, [selectedDeadline]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedDeadlineId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Termíny</h1>
          <p className={styles.subtitle}>
            Termíny navázané na podklady. Stav termínu (OK / Riziko / Blokováno) se v demo odvozuje z chybějících podkladů.
            Tlačítko „Poslat připomínku“ otevře náhled e‑mailu a zaloguje aktivitu.
          </p>
        </div>
      </header>

      <section className={styles.grid} aria-label="Kalendář a pravidla">
        <div className={styles.card}>
          <div className={styles.calendar}>
            <div className={styles.calHeader}>
              <div>
                <div className={styles.month}>Únor 2026</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
                  Klikněte na termín pro náhled připomínky.
                </div>
              </div>
              <div className={styles.legend} aria-label="Legenda">
                <span className={styles.legendItem}>
                  <Dot tone="ok" /> OK
                </span>
                <span className={styles.legendItem}>
                  <Dot tone="brass" /> Riziko
                </span>
                <span className={styles.legendItem}>
                  <Dot tone="red" /> Blokováno
                </span>
              </div>
            </div>

            <div className={styles.grid7}>
              {weekdays.map((w) => (
                <div key={w} className={styles.weekday}>
                  {w}
                </div>
              ))}
            </div>

            <div className={styles.grid7}>
              {calCells.map((c, idx) => {
                const events = c.iso ? eventsByDay.get(c.iso) ?? [] : [];
                return (
                  <div key={idx} className={styles.day}>
                    <div className={`${styles.dayNum} ${c.day ? "" : styles.dayMuted}`}>{c.day ?? ""}</div>
                    {events.slice(0, 2).map((e) => {
                      const tone: "ok" | "brass" | "red" = e.state === "ok" ? "ok" : e.state === "risk" ? "brass" : "red";
                      const cl = clients.find((x) => x.id === e.clientId);
                      return (
                        <div
                          key={e.id}
                          className={styles.event}
                          role="button"
                          tabIndex={0}
                          aria-label={`Otevřít termín: ${e.title}`}
                          onClick={() => openDeadline(e)}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              openDeadline(e);
                            }
                          }}
                        >
                          <div className={styles.eventTitle}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                              <Dot tone={tone} /> {e.title}
                            </span>
                          </div>
                          <div className={styles.eventMeta}>{cl?.name ?? "—"}</div>
                        </div>
                      );
                    })}
                    {events.length > 2 ? (
                      <div style={{ marginTop: 8, color: "var(--muted2)", fontSize: 12 }}>+ {events.length - 2} další</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12 }} className={styles.timeline} aria-label="Timeline">
            {computedDeadlines.map((d) => {
              const cl = clients.find((c) => c.id === d.clientId);
              const tone: "ok" | "brass" | "red" = d.state === "ok" ? "ok" : d.state === "risk" ? "brass" : "red";
              const depends = (d.dependsOn ?? []).length;
              const missingCount = depends
                ? documentRequests.filter((r) => d.dependsOn!.includes(r.id) && r.status !== "received").length
                : 0;
              return (
                <div key={d.id} className={styles.tItem}>
                  <div>
                    <div className={styles.tTitle}>{d.title}</div>
                    <div className={styles.tHint}>
                      {cl?.name ?? "—"}
                      {d.hint ? ` • ${d.hint}` : ""}
                      {depends ? ` • závislosti: ${missingCount}/${depends}` : ""}
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => openDeadline(d)}>
                        Poslat připomínku
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                    <span className={styles.pill}>
                      <Dot tone={tone} /> {stateLabel(d.state)}
                    </span>
                    <span className={styles.pill}>{formatDateCZ(d.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className={styles.card} aria-label="Pravidla připomínek podle klienta">
          <div style={{ fontSize: 12, color: "var(--muted2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Pravidla připomínek
          </div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 950 }}>Per klient</div>
          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
            Každý klient může mít jinou frekvenci a kanál připomínek. Demo ukládá pravidla pouze do lokálního stavu.
          </div>

          <div className={styles.rules} style={{ marginTop: 12 }}>
            {clients.map((c) => {
              const rule = reminderRules.find((r) => r.clientId === c.id) ?? {
                clientId: c.id,
                enabled: true,
                daysBefore: 7,
                channel: "email" as const,
              };
              return (
                <div key={c.id} className={styles.rule}>
                  <div className={styles.ruleTop}>
                    <div>
                      <div className={styles.ruleTitle}>{c.name}</div>
                      <div style={{ marginTop: 6, color: "var(--muted2)", fontSize: 12 }}>Správce: {c.accountManager}</div>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onChange={(v) => updateReminderRule(c.id, { enabled: v })}
                      label={rule.enabled ? "Aktivní" : "Vypnuto"}
                    />
                  </div>

                  <div className={styles.fieldRow}>
                    <div style={{ display: "grid", gap: 6, minWidth: 150, flex: "1 1 150px" }}>
                      <span className={styles.label}>Dní před</span>
                      <input
                        className={styles.input}
                        type="number"
                        min={1}
                        max={30}
                        value={rule.daysBefore}
                        onChange={(e) => updateReminderRule(c.id, { daysBefore: Number(e.target.value || 7) })}
                        aria-label={`Počet dní před termínem pro ${c.name}`}
                      />
                    </div>
                    <div style={{ display: "grid", gap: 6, minWidth: 170, flex: "1 1 170px" }}>
                      <span className={styles.label}>Kanál</span>
                      <select
                        className={styles.select}
                        value={rule.channel}
                        onChange={(e) => updateReminderRule(c.id, { channel: e.target.value as "email" | "portal" })}
                      >
                        <option value="email">E‑mail klientovi</option>
                        <option value="portal">Notifikace v portálu</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, color: "var(--muted2)", fontSize: 12, lineHeight: 1.4 }}>
                    Náhled: {rule.enabled ? "aktivní" : "vypnuto"} • {rule.daysBefore} dní • kanál: {rule.channel}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      {selectedDeadline ? (
        <>
          <button className={styles.backdrop} type="button" aria-label="Zavřít náhled" onClick={() => setSelectedDeadlineId(null)} />
          <aside
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Náhled připomínky"
            tabIndex={-1}
            ref={modalRef}
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Poslat připomínku</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
                  {clients.find((c) => c.id === selectedDeadline.clientId)?.name ?? "—"} • {selectedDeadline.title}
                </div>
              </div>
              <button className={styles.close} type="button" onClick={() => setSelectedDeadlineId(null)} aria-label="Zavřít">✕</button>
            </div>

            <div style={{ marginTop: 10, color: "var(--muted2)", fontSize: 12 }}>
              Závislosti: {missingForSelected.length ? `${missingForSelected.length} chybí / čekáme` : "vše přijaté"}
            </div>

            <label className={styles.label} htmlFor="preview" style={{ marginTop: 12, display: "block" }}>
              Náhled textu
            </label>
            <textarea id="preview" className={styles.textarea} value={previewText} onChange={(e) => setPreviewText(e.target.value)} />

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className={`${styles.btn} ${styles.primary}`}
                onClick={() => {
                  if (!selectedRule?.enabled) {
                    alert("Připomínky jsou pro tohoto klienta vypnuté.");
                    return;
                  }
                  sendReminderForDeadline(selectedDeadline.id, selectedRule?.channel ?? "email", previewText);
                  setSelectedDeadlineId(null);
                }}
              >
                Odeslat (demo)
              </button>
              <button type="button" className={styles.btn} onClick={() => setSelectedDeadlineId(null)}>
                Zavřít
              </button>
            </div>

            <div style={{ marginTop: 10, color: "var(--muted2)", fontSize: 12, lineHeight: 1.4 }}>
              Demo pozn.: Odeslání pouze vytvoří aktivitu a nastaví „poslední připomínka“ u chybějících podkladů.
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
