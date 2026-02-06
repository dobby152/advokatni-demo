"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  type Activity,
  type Client,
  type Deadline,
  type DocumentRequest,
  type DocumentRequestStatus,
  type PeriodKey,
  type ReportItem,
  type ReminderRule,
  computeDeadlineState,
  demoActivities,
  demoClients,
  demoDeadlines,
  demoDocumentRequests,
  demoReports,
  generateChecklistRequests,
} from "./demoPortalData";

export type PortalStore = {
  clients: Client[];
  documentRequests: DocumentRequest[];
  deadlines: Deadline[];
  activities: Activity[];
  reports: ReportItem[];
  reminderRules: ReminderRule[];

  updateClient: (clientId: string, patch: Partial<Client>) => void;

  setRequestStatus: (requestId: string, status: DocumentRequestStatus) => void;
  setRequestNote: (requestId: string, note: string) => void;
  setRequestAssignee: (requestId: string, assignee: string | null) => void;
  addRequestFile: (
    requestId: string,
    file: { name: string; size: string; uploadedAt: string; by: "Klient" | "MAR‑EKON" }
  ) => void;
  generateChecklist: (args: { clientId: string; period: PeriodKey; types: DocumentRequest["type"][] }) => void;

  updateReminderRule: (clientId: string, patch: Partial<ReminderRule>) => void;
  sendReminderForDeadline: (deadlineId: string, channel: ReminderRule["channel"], messageOverride?: string) => void;

  publishReport: (reportId: string) => void;
};

const PortalStoreContext = createContext<PortalStore | null>(null);

const isoNow = () => new Date().toISOString();

function uniqId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 9)}-${Date.now().toString(16)}`;
}

export function PortalDataProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>(demoDocumentRequests);
  const [deadlines, setDeadlines] = useState<Deadline[]>(demoDeadlines);
  const [activities, setActivities] = useState<Activity[]>(demoActivities);
  const [reports, setReports] = useState<ReportItem[]>(demoReports);
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>(
    demoClients.map((c) => ({ clientId: c.id, enabled: true, daysBefore: 7, channel: "email" }))
  );

  const store: PortalStore = useMemo(
    () => ({
      clients,
      documentRequests,
      deadlines,
      activities,
      reports,
      reminderRules,

      updateClient(clientId, patch) {
        setClients((prev) => prev.map((c) => (c.id === clientId ? ({ ...c, ...patch } as Client) : c)));
      },

      setRequestStatus(requestId, status) {
        setDocumentRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status, updatedAt: isoNow().slice(0, 10) } : r))
        );
        setActivities((prev) => [
          {
            id: uniqId("ac"),
            at: isoNow(),
            clientId: documentRequests.find((r) => r.id === requestId)?.clientId ?? "cl-001",
            who: "MAR‑EKON",
            kind: "status",
            title: `Změna stavu podkladu: ${status}`,
            detail: `Požadavek ${requestId}`,
          },
          ...prev,
        ]);
        setDeadlines((prev) =>
          prev.map((d) => {
            if (!d.dependsOn?.includes(requestId)) return d;
            const nextState = computeDeadlineState(d, documentRequests.map((r) => (r.id === requestId ? { ...r, status } : r)));
            return { ...d, state: nextState };
          })
        );
      },

      setRequestNote(requestId, note) {
        setDocumentRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, note, updatedAt: isoNow().slice(0, 10) } : r))
        );
        setActivities((prev) => [
          {
            id: uniqId("ac"),
            at: isoNow(),
            clientId: documentRequests.find((r) => r.id === requestId)?.clientId ?? "cl-001",
            who: "MAR‑EKON",
            kind: "comment",
            title: "Upravena poznámka k podkladu",
            detail: `Požadavek ${requestId}`,
          },
          ...prev,
        ]);
      },

      setRequestAssignee(requestId, assignee) {
        setDocumentRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, assignee, updatedAt: isoNow().slice(0, 10) } : r))
        );
      },

      addRequestFile(requestId, file) {
        setDocumentRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  files: [{ ...file }, ...r.files],
                  status: "received",
                  updatedAt: isoNow().slice(0, 10),
                }
              : r
          )
        );
        const req = documentRequests.find((r) => r.id === requestId);
        if (req) {
          setActivities((prev) => [
            {
              id: uniqId("ac"),
              at: isoNow(),
              clientId: req.clientId,
              who: file.by,
              kind: "upload",
              title: `Nahrán soubor: ${file.name}`,
              detail: `${req.title} (${req.period})`,
            },
            ...prev,
          ]);
        }
      },

      generateChecklist({ clientId, period, types }) {
        const generated = generateChecklistRequests({ clientId, period, types });
        setDocumentRequests((prev) => {
          const existingKeys = new Set(prev.map((r) => `${r.clientId}|${r.period}|${r.templateKey ?? r.title}`));
          const toAdd = generated.filter((r) => !existingKeys.has(`${r.clientId}|${r.period}|${r.templateKey ?? r.title}`));
          return [...toAdd, ...prev];
        });
        setActivities((prev) => [
          {
            id: uniqId("ac"),
            at: isoNow(),
            clientId,
            who: "MAR‑EKON",
            kind: "status",
            title: `Vygenerován checklist podkladů (${period})`,
            detail: types.length ? `Typy: ${types.join(", ")}` : "—",
          },
          ...prev,
        ]);
      },

      updateReminderRule(clientId, patch) {
        setReminderRules((prev) =>
          prev.map((r) => (r.clientId === clientId ? { ...r, ...patch } : r))
        );
      },

      sendReminderForDeadline(deadlineId, channel, messageOverride) {
        const dl = deadlines.find((d) => d.id === deadlineId);
        if (!dl) return;

        const deps = dl.dependsOn ?? [];
        const related = documentRequests.filter((r) => deps.includes(r.id));
        const missing = related.filter((r) => r.status !== "received");

        // mark last reminder
        const today = isoNow().slice(0, 10);
        if (missing.length) {
          setDocumentRequests((prev) =>
            prev.map((r) =>
              deps.includes(r.id) && r.status !== "received" ? { ...r, lastReminderAt: today, updatedAt: today } : r
            )
          );
        }

        const clientId = dl.clientId;
        setActivities((prev) => [
          {
            id: uniqId("ac"),
            at: isoNow(),
            clientId,
            who: "MAR‑EKON",
            kind: "reminder",
            title: `Odeslána připomínka: ${dl.title}`,
            detail:
              (messageOverride ? messageOverride.slice(0, 160) + (messageOverride.length > 160 ? "…" : "") : null) ??
              `Kanál: ${channel}. Chybí: ${missing.map((m) => m.type).join(", ") || "—"}`,
          },
          ...prev,
        ]);
      },

      publishReport(reportId) {
        setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, publishedAt: isoNow() } : r)));
        const r = reports.find((x) => x.id === reportId);
        if (r) {
          setActivities((prev) => [
            {
              id: uniqId("ac"),
              at: isoNow(),
              clientId: r.clientId,
              who: "MAR‑EKON",
              kind: "status",
              title: `Report publikován: ${r.title}`,
              detail: `Období ${r.period}`,
            },
            ...prev,
          ]);
        }
      },
    }),
    [clients, documentRequests, deadlines, activities, reports, reminderRules]
  );

  return <PortalStoreContext.Provider value={store}>{children}</PortalStoreContext.Provider>;
}

export function usePortalStore() {
  const v = useContext(PortalStoreContext);
  if (!v) throw new Error("usePortalStore must be used within PortalDataProvider");
  return v;
}
