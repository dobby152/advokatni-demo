"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PodkladyPage.module.css";
import {
  lawyers,
  type DocumentRequest,
  type DocumentRequestType,
  type PeriodKey,
  formatDateCZ,
  periodLabel,
  statusLabel,
} from "../../../lib/demoPortalData";
import { usePortalStore } from "../../../lib/demoPortalStore";

function Dot({ status }: { status: DocumentRequest["status"] }) {
  const c =
    status === "received"
      ? "rgba(110,231,183,.95)"
      : status === "missing"
        ? "rgba(255,107,107,.95)"
        : "rgba(240,195,106,.95)";
  return <span className={styles.dot} style={{ background: c }} aria-hidden />;
}

function prettySize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export default function PodkladyPage() {
  const {
    clients,
    documentRequests,
    activities,
    generateChecklist,
    setRequestAssignee,
    setRequestNote,
    setRequestStatus,
    addRequestFile,
  } = usePortalStore();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<DocumentRequest["status"] | "all">("all");
  const [type, setType] = useState<DocumentRequest["type"] | "all">("all");
  const [period, setPeriod] = useState<DocumentRequest["period"] | "all">("2026-02");
  const [clientId, setClientId] = useState<string | "all">("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Checklist generator UI
  const [genClientId, setGenClientId] = useState<string>(clients[0]?.id ?? "cl-001");
  const [genPeriod, setGenPeriod] = useState<PeriodKey>("2026-02");
  const [genTypes, setGenTypes] = useState<Record<DocumentRequestType, boolean>>({
    Smlouva: true,
    "Plná moc": true,
    Podklady: true,
    Důkazy: false,
    Soudní: false,
    Ostatní: false,
  });

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return documentRequests
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (type === "all" ? true : r.type === type))
      .filter((r) => (period === "all" ? true : r.period === period))
      .filter((r) => (clientId === "all" ? true : r.clientId === clientId))
      .filter((r) => {
        if (!query) return true;
        const cl = clients.find((c) => c.id === r.clientId);
        return (
          r.title.toLowerCase().includes(query) ||
          r.type.toLowerCase().includes(query) ||
          r.period.toLowerCase().includes(query) ||
          (cl?.name.toLowerCase().includes(query) ?? false)
        );
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [q, status, type, period, clientId, documentRequests, clients]);

  const selected = useMemo(
    () => (selectedId ? documentRequests.find((r) => r.id === selectedId) ?? null : null),
    [selectedId, documentRequests]
  );

  const selectedClient = useMemo(
    () => (selected ? clients.find((c) => c.id === selected.clientId) ?? null : null),
    [selected, clients]
  );

  const selectedLastActivity = useMemo(() => {
    if (!selected) return null;
    return activities.find((a) => a.clientId === selected.clientId && (a.detail?.includes(selected.title) || a.detail?.includes(selected.id)));
  }, [activities, selected]);

  const [noteDraft, setNoteDraft] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!selected) return;
    drawerRef.current?.focus();
  }, [selected]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedMissingHint = useMemo(() => {
    if (!selected) return null;
    if (selected.status === "received") return "Doklad je evidován jako přijatý.";
    if (selected.lastReminderAt) return `Poslední připomínka: ${formatDateCZ(selected.lastReminderAt)}`;
    return "Zatím bez připomínky.";
  }, [selected]);

  const onUploadFiles = (files: FileList | File[]) => {
    if (!selected) return;
    Array.from(files).forEach((f) => {
      addRequestFile(selected.id, {
        name: f.name,
        size: prettySize(f.size),
        uploadedAt: new Date().toISOString().slice(0, 10),
        by: "Klient",
      });
    });
  };

  const openRequest = (r: DocumentRequest) => {
    setSelectedId(r.id);
    setNoteDraft(r.note ?? "");
    setDragActive(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Podklady</h1>
          <p className={styles.subtitle}>
            Šablony požadavků + generování checklistu pro období. Řádky mají jednoduchý workflow (chybí/čekáme/přijato),
            poznámku, přiřazení a demo upload.
          </p>
        </div>
      </header>

      <section className={styles.card} aria-label="Vygenerovat checklist podkladů">
        <div className={styles.filters}>
          <div className={styles.filter} style={{ minWidth: 220, flex: "1 1 220px" }}>
            <label className={styles.label} htmlFor="gen-client">Klient</label>
            <select id="gen-client" className={styles.select} value={genClientId} onChange={(e) => setGenClientId(e.target.value)}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filter}>
            <label className={styles.label} htmlFor="gen-period">Období</label>
            <select id="gen-period" className={styles.select} value={genPeriod} onChange={(e) => setGenPeriod(e.target.value as PeriodKey)}>
              <option value="2026-02">{periodLabel("2026-02")}</option>
              <option value="2026-01">{periodLabel("2026-01")}</option>
            </select>
          </div>
          <div className={styles.filter} style={{ minWidth: 260, flex: "2 1 260px" }}>
            <div className={styles.label}>Šablony</div>
            <div className={styles.badgeRow} role="group" aria-label="Vybrané typy podkladů">
              {(Object.keys(genTypes) as DocumentRequestType[]).map((t) => (
                <label key={t} className={styles.badge}>
                  <input
                    type="checkbox"
                    checked={genTypes[t]}
                    onChange={(e) => setGenTypes((p) => ({ ...p, [t]: e.target.checked }))}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filter} style={{ minWidth: 220 }}>
            <button
              type="button"
              className={`${styles.btn} ${styles.primary}`}
              onClick={() =>
                generateChecklist({
                  clientId: genClientId,
                  period: genPeriod,
                  types: (Object.keys(genTypes) as DocumentRequestType[]).filter((t) => genTypes[t]),
                })
              }
            >
              Vygenerovat checklist
            </button>
            <div className={styles.muted} style={{ fontSize: 12, marginTop: 8 }}>
              Přidá nové řádky jen pokud ještě neexistují (dle šablony).
            </div>
          </div>
        </div>
      </section>

      <section className={styles.card} aria-label="Filtry tabulky">
        <div className={styles.filters}>
          <div className={styles.filter} style={{ flex: "1 1 260px" }}>
            <label className={styles.label} htmlFor="docs-search">
              Hledat
            </label>
            <input
              id="docs-search"
              className={styles.input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="např. smlouva, plná moc, důkazy, klient…"
            />
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="docs-status">
              Stav
            </label>
            <select
              id="docs-status"
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value as DocumentRequest["status"] | "all")}
            >
              <option value="all">Vše</option>
              <option value="missing">Chybí</option>
              <option value="waiting">Čekáme</option>
              <option value="received">Přijato</option>
            </select>
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="docs-type">
              Typ
            </label>
            <select
              id="docs-type"
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value as DocumentRequest["type"] | "all")}
            >
              <option value="all">Vše</option>
              <option value="Smlouva">Smlouva</option>
              <option value="Plná moc">Plná moc</option>
              <option value="Podklady">Podklady</option>
              <option value="Důkazy">Důkazy</option>
              <option value="Soudní">Soudní</option>
              <option value="Ostatní">Ostatní</option>
            </select>
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="docs-period">
              Období
            </label>
            <select
              id="docs-period"
              className={styles.select}
              value={period}
              onChange={(e) => setPeriod(e.target.value as DocumentRequest["period"] | "all")}
            >
              <option value="all">Vše</option>
              <option value="2026-02">{periodLabel("2026-02")}</option>
              <option value="2026-01">{periodLabel("2026-01")}</option>
            </select>
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="docs-client">
              Klient
            </label>
            <select id="docs-client" className={styles.select} value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="all">Všichni</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={styles.card} aria-label="Seznam podkladů">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Klient</th>
                <th className={styles.th}>Požadavek</th>
                <th className={styles.th}>Typ</th>
                <th className={styles.th}>Období</th>
                <th className={styles.th}>Stav</th>
                <th className={styles.th}>Termín</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const cl = clients.find((c) => c.id === r.clientId);
                return (
                  <tr
                    key={r.id}
                    className={styles.tr}
                    tabIndex={0}
                    role="button"
                    aria-label={`Otevřít detail: ${r.title}`}
                    onClick={() => openRequest(r)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openRequest(r);
                      }
                    }}
                  >
                    <td className={styles.td}>
                      <div style={{ fontWeight: 750 }}>{cl?.name ?? "—"}</div>
                      <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
                        IČO {cl?.ico}
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div style={{ fontWeight: 750 }}>{r.title}</div>
                      {r.assignee ? (
                        <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>Přiřazeno: {r.assignee}</div>
                      ) : null}
                      {r.note ? <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>{r.note}</div> : null}
                    </td>
                    <td className={styles.td}>{r.type}</td>
                    <td className={styles.td}>{periodLabel(r.period)}</td>
                    <td className={styles.td}>
                      <span className={styles.status}>
                        <Dot status={r.status} /> {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className={styles.td}>{formatDateCZ(r.dueDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.muted} style={{ fontSize: 12, marginTop: 10 }}>
          Tip: Escape zavře detail. Upload je jen demo – přidá soubory do lokálního stavu.
        </div>
      </section>

      {selected ? (
        <>
          <button className={styles.drawerBackdrop} type="button" aria-label="Zavřít detail" onClick={() => setSelectedId(null)} />
          <aside
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Detail požadavku"
            tabIndex={-1}
            ref={drawerRef}
          >
            <div className={styles.drawerHeader}>
              <div>
                <div className={styles.drawerTitle}>{selected.title}</div>
                <div className={styles.muted} style={{ marginTop: 6, fontSize: 13 }}>
                  {selectedClient?.name ?? "—"} • {selected.type} • {periodLabel(selected.period)}
                </div>
              </div>
              <button className={styles.closeBtn} type="button" onClick={() => setSelectedId(null)} aria-label="Zavřít">
                ✕
              </button>
            </div>

            <div className={styles.meta}>
              <div className={styles.metaBox}>
                <div className={styles.metaKey}>Stav</div>
                <div className={styles.metaVal}>
                  <span className={styles.status}>
                    <Dot status={selected.status} /> {statusLabel(selected.status)}
                  </span>
                </div>
              </div>
              <div className={styles.metaBox}>
                <div className={styles.metaKey}>Termín</div>
                <div className={styles.metaVal}>{formatDateCZ(selected.dueDate)}</div>
              </div>
              <div className={styles.metaBox}>
                <div className={styles.metaKey}>Aktualizováno</div>
                <div className={styles.metaVal}>{formatDateCZ(selected.updatedAt)}</div>
              </div>
              <div className={styles.metaBox}>
                <div className={styles.metaKey}>Přiřazení</div>
                <div className={styles.metaVal}>
                  <select
                    className={styles.select}
                    value={selected.assignee ?? ""}
                    aria-label="Přiřadit účetního"
                    onChange={(e) => setRequestAssignee(selected.id, e.target.value || null)}
                  >
                    <option value="">—</option>
                    {lawyers.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <section className={styles.section} aria-label="Workflow">
              <div className={styles.sectionTitle}>Workflow</div>
              <div className={styles.sectionBody} style={{ display: "grid", gap: 10 }}>
                <div className={styles.muted} style={{ fontSize: 13 }}>{selectedMissingHint}</div>
                <div className={styles.badgeRow}>
                  <button type="button" className={styles.btn} onClick={() => setRequestStatus(selected.id, "missing")}>Chybí</button>
                  <button type="button" className={styles.btn} onClick={() => setRequestStatus(selected.id, "waiting")}>Čekáme</button>
                  <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => setRequestStatus(selected.id, "received")}>Přijato</button>
                </div>
              </div>
            </section>

            <section className={styles.section} aria-label="Poznámka">
              <div className={styles.sectionTitle}>Poznámka</div>
              <div style={{ marginTop: 10 }}>
                <label className={styles.label} htmlFor="note" style={{ marginBottom: 6 }}>Interní poznámka / instrukce pro klienta</label>
                <textarea
                  id="note"
                  className={styles.textarea}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="např. chybí docházka za víkendy…"
                />
                <div className={styles.badgeRow} style={{ marginTop: 10 }}>
                  <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => setRequestNote(selected.id, noteDraft)}>
                    Uložit poznámku
                  </button>
                  <button type="button" className={styles.btn} onClick={() => setNoteDraft(selected.note ?? "")}>Zahodit změny</button>
                </div>
              </div>
            </section>

            <section className={styles.section} aria-label="Soubory">
              <div className={styles.sectionTitle}>Soubory</div>
              {selected.files.length ? (
                <ul className={styles.fileList}>
                  {selected.files.map((f) => (
                    <li key={`${f.name}-${f.uploadedAt}`} className={styles.fileItem}>
                      <div>
                        <div className={styles.fileName}>{f.name}</div>
                        <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
                          Nahrál: {f.by} • {formatDateCZ(f.uploadedAt)}
                        </div>
                      </div>
                      <div className={styles.fileMeta}>{f.size}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.sectionBody}>Zatím žádné nahrané soubory.</div>
              )}

              <div
                className={`${styles.dropzone} ${dragActive ? styles.dropzoneDrag : ""}`}
                role="button"
                tabIndex={0}
                aria-label="Nahrát soubor (drag and drop)"
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files?.length) onUploadFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div style={{ fontWeight: 900 }}>Přetáhněte soubor sem</div>
                <div className={styles.dropHint}>…nebo klikněte pro výběr. Demo: soubor se pouze přidá do lokálního stavu.</div>
                <input
                  ref={fileInputRef}
                  className={styles.fileInput}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.length) onUploadFiles(e.target.files);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            </section>

            <div className={styles.drawerActions}>
              <button
                className={`${styles.btn} ${styles.primary}`}
                type="button"
                onClick={() => alert("Demo: odeslat připomínku (doporučeno z Termínů)")}
              >
                Poslat připomínku
              </button>
              <button className={styles.btn} type="button" onClick={() => setSelectedId(null)}>
                Zavřít
              </button>
              {selectedLastActivity ? (
                <div className={styles.muted} style={{ fontSize: 12, alignSelf: "center" }}>
                  Posl. aktivita: {formatDateCZ(selectedLastActivity.at)}
                </div>
              ) : null}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
