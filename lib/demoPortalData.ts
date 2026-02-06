export type PeriodKey = "2026-01" | "2026-02";

export type LawAreaType = "obchodni" | "pracovni" | "rodinne" | "trestni" | "spravni" | "ostatni";

export type ClientRisk = {
  id: string;
  severity: "low" | "medium" | "high";
  title: string;
  note?: string;
};

export type Client = {
  id: string;
  name: string;
  ico?: string;
  lawArea: LawAreaType;
  caseNumber?: string;
  contacts: Array<{ name: string; email: string; phone?: string; role?: string }>;
  leadLawyer: string;
  risks: ClientRisk[];
};

export type DocumentRequestStatus = "missing" | "waiting" | "received";
export type DocumentRequestType = "Smlouva" | "Plná moc" | "Podklady" | "Důkazy" | "Soudní" | "Ostatní";

export type DocumentRequest = {
  id: string;
  clientId: string;
  period: PeriodKey;
  type: DocumentRequestType;
  title: string;
  dueDate: string;
  status: DocumentRequestStatus;
  note?: string;
  assignee?: string | null;
  templateKey?: string;
  lastReminderAt?: string;
  updatedAt: string;
  files: Array<{ name: string; size: string; uploadedAt: string; by: "Klient" | "Advokátní kancelář" }>;
};

export type Deadline = {
  id: string;
  clientId: string;
  title: string;
  date: string;
  category: "Jednání" | "Lhůta" | "Revize" | "Podání";
  state: "ok" | "risk" | "blocked";
  hint?: string;
  dependsOn?: string[];
};

export type ReminderRule = {
  clientId: string;
  enabled: boolean;
  daysBefore: number;
  channel: "email" | "portal";
  ccLawyer?: boolean;
};

export type Activity = {
  id: string;
  at: string;
  clientId: string;
  who: "Klient" | "Advokátní kancelář";
  kind: "upload" | "comment" | "reminder" | "status";
  title: string;
  detail?: string;
};

export type DocumentTemplate = {
  key: string;
  type: DocumentRequestType;
  title: (period: PeriodKey) => string;
  defaultDueDate: (period: PeriodKey) => string;
  defaultNote?: string;
  onlyIf?: (client: Client) => boolean;
};

export type ReportType = "CASE_SUMMARY" | "BILLINGS" | "TIMELINE";

export type ReportItem = {
  id: string;
  clientId: string;
  period: PeriodKey;
  type: ReportType;
  title: string;
  description: string;
  updatedAt: string;
  publishedAt?: string;
};

export const lawyers = ["JUDr. Novák", "Mgr. Svobodová", "JUDr. Dvořák"] as const;

export const demoClients: Client[] = [
  {
    id: "cl-001",
    name: "TECHSTART s.r.o.",
    ico: "09234567",
    lawArea: "obchodni",
    caseNumber: "2024/OBČ/142",
    leadLawyer: "JUDr. Novák",
    contacts: [
      { name: "Petr Malý", email: "maly@techstart.cz", phone: "+420 777 123 456", role: "Jednatel" },
      { name: "Jana Zelená", email: "zelena@techstart.cz", role: "Právní zástupce" },
    ],
    risks: [
      { id: "rs-1", severity: "medium", title: "Prodlení s dodáním smlouvy", note: "Opakovaně posunuto o 3–5 dní." },
    ],
  },
  {
    id: "cl-002",
    name: "Martin Horák",
    lawArea: "rodinne",
    caseNumber: "2025/ROD/089",
    leadLawyer: "Mgr. Svobodová",
    contacts: [{ name: "Martin Horák", email: "horak.m@email.cz", phone: "+420 603 456 789", role: "Klient" }],
    risks: [
      { id: "rs-2", severity: "high", title: "Blížící se soudní jednání", note: "Chybí podklady k výživnému." },
    ],
  },
  {
    id: "cl-003",
    name: "Lenka Nováková",
    lawArea: "pracovni",
    caseNumber: "2026/PRAC/012",
    leadLawyer: "JUDr. Dvořák",
    contacts: [{ name: "Lenka Nováková", email: "novakova.l@seznam.cz", role: "Klientka" }],
    risks: [],
  },
];

export const demoTemplates: DocumentTemplate[] = [
  {
    key: "plna-moc",
    type: "Plná moc",
    title: (p) => `Plná moc k zastupování`,
    defaultDueDate: (p) => (p === "2026-01" ? "2026-02-10" : "2026-03-10"),
    defaultNote: "Podepsaná plná moc s ověřeným podpisem.",
  },
  {
    key: "smlouva-revize",
    type: "Smlouva",
    title: (p) => `Smlouva k revizi`,
    defaultDueDate: (p) => (p === "2026-01" ? "2026-02-15" : "2026-03-15"),
    defaultNote: "Aktuální verze smlouvy ve DOCX nebo PDF.",
  },
  {
    key: "podklady-spor",
    type: "Podklady",
    title: (p) => `Podklady ke sporu`,
    defaultDueDate: (p) => (p === "2026-01" ? "2026-02-08" : "2026-03-08"),
    defaultNote: "Veškerá korespondence, smlouvy, faktury.",
  },
  {
    key: "dukazy",
    type: "Důkazy",
    title: (p) => `Důkazní materiál`,
    defaultDueDate: (p) => (p === "2026-01" ? "2026-02-12" : "2026-03-12"),
    defaultNote: "Fotografie, videa, výpovědi svědků, expertízy.",
  },
];

export const demoDocumentRequests: DocumentRequest[] = [
  {
    id: "rq-1001",
    clientId: "cl-001",
    period: "2026-01",
    type: "Smlouva",
    title: "Smlouva k revizi — dodavatelská smlouva",
    templateKey: "smlouva-revize",
    dueDate: "2026-02-15",
    status: "waiting",
    assignee: "JUDr. Novák",
    note: "Aktuální verze smlouvy s dodavatelem IT služeb.",
    lastReminderAt: "2026-02-03",
    updatedAt: "2026-02-03",
    files: [],
  },
  {
    id: "rq-1002",
    clientId: "cl-001",
    period: "2026-01",
    type: "Podklady",
    title: "Podklady ke sporu — fakturace",
    templateKey: "podklady-spor",
    dueDate: "2026-02-08",
    status: "received",
    assignee: "JUDr. Novák",
    note: "Přijato: 8 faktur + korespondence.",
    updatedAt: "2026-02-02",
    files: [
      { name: "faktury-2024-2025.zip", size: "2.1 MB", uploadedAt: "2026-02-02", by: "Klient" },
      { name: "email-korespondence.pdf", size: "890 KB", uploadedAt: "2026-02-02", by: "Klient" },
    ],
  },
  {
    id: "rq-2001",
    clientId: "cl-002",
    period: "2026-02",
    type: "Důkazy",
    title: "Důkazní materiál — výživné",
    templateKey: "dukazy",
    dueDate: "2026-02-12",
    status: "missing",
    assignee: "Mgr. Svobodová",
    note: "Chybí: doklady o příjmech, výdajích na dítě.",
    lastReminderAt: "2026-02-04",
    updatedAt: "2026-02-04",
    files: [],
  },
  {
    id: "rq-2002",
    clientId: "cl-002",
    period: "2026-01",
    type: "Plná moc",
    title: "Plná moc k zastupování",
    templateKey: "plna-moc",
    dueDate: "2026-02-10",
    status: "received",
    assignee: "Mgr. Svobodová",
    note: "Podepsaná, ověřená.",
    updatedAt: "2026-02-01",
    files: [
      { name: "plna-moc-horak.pdf", size: "180 KB", uploadedAt: "2026-02-01", by: "Klient" },
    ],
  },
  {
    id: "rq-3001",
    clientId: "cl-003",
    period: "2026-02",
    type: "Podklady",
    title: "Podklady — pracovní smlouva, mzdy",
    dueDate: "2026-02-16",
    status: "received",
    assignee: "JUDr. Dvořák",
    updatedAt: "2026-02-02",
    files: [
      { name: "pracovni-smlouva.pdf", size: "320 KB", uploadedAt: "2026-02-02", by: "Klient" },
      { name: "vyplatni-pasky.pdf", size: "1.2 MB", uploadedAt: "2026-02-02", by: "Klient" },
    ],
  },
];

export const demoDeadlines: Deadline[] = [
  {
    id: "dl-01",
    clientId: "cl-001",
    title: "Revize smlouvy — dodavatel",
    date: "2026-02-20",
    category: "Revize",
    state: "risk",
    hint: "Čekáme na smlouvu",
    dependsOn: ["rq-1001"],
  },
  {
    id: "dl-02",
    clientId: "cl-001",
    title: "Příprava podání žaloby",
    date: "2026-02-28",
    category: "Podání",
    state: "ok",
    hint: "Podklady kompletní",
    dependsOn: ["rq-1002"],
  },
  {
    id: "dl-03",
    clientId: "cl-002",
    title: "Soudní jednání — výživné",
    date: "2026-02-18",
    category: "Jednání",
    state: "blocked",
    hint: "Chybí důkazy",
    dependsOn: ["rq-2001"],
  },
  {
    id: "dl-04",
    clientId: "cl-002",
    title: "Podání návrhu na výživné",
    date: "2026-02-25",
    category: "Podání",
    state: "risk",
    hint: "Závisí na dokumentech",
    dependsOn: ["rq-2001"],
  },
  {
    id: "dl-05",
    clientId: "cl-003",
    title: "Žaloba na neplatné rozvázání",
    date: "2026-03-05",
    category: "Podání",
    state: "ok",
    hint: "Podklady připraveny",
    dependsOn: ["rq-3001"],
  },
];

export const demoReports: ReportItem[] = [
  {
    id: "rp-001",
    clientId: "cl-001",
    period: "2026-01",
    type: "CASE_SUMMARY",
    title: "Přehled případu",
    description: "Shrnutí stavu sporu s dodavatelem IT služeb, klíčové dokumenty a časová osa.",
    updatedAt: "2026-02-03",
  },
  {
    id: "rp-002",
    clientId: "cl-002",
    period: "2026-01",
    type: "TIMELINE",
    title: "Časová osa řízení",
    description: "Přehled všech kroků a termínů v řízení o výživném.",
    updatedAt: "2026-02-03",
    publishedAt: "2026-02-03T15:10:00+01:00",
  },
  {
    id: "rp-003",
    clientId: "cl-003",
    period: "2026-02",
    type: "CASE_SUMMARY",
    title: "Přehled případu — pracovní právo",
    description: "Analýza právních aspektů rozvázání pracovního poměru.",
    updatedAt: "2026-02-02",
  },
];

export const demoActivities: Activity[] = [
  {
    id: "ac-01",
    at: "2026-02-04T09:12:00+01:00",
    clientId: "cl-002",
    who: "Advokátní kancelář",
    kind: "reminder",
    title: "Odeslána připomínka k důkazům",
    detail: "Automatická upomínka: 14 dní před jednáním.",
  },
  {
    id: "ac-02",
    at: "2026-02-03T16:48:00+01:00",
    clientId: "cl-001",
    who: "Klient",
    kind: "comment",
    title: "Poznámka ke smlouvě",
    detail: "Smlouvu dodáme zítra ráno.",
  },
  {
    id: "ac-03",
    at: "2026-02-02T12:05:00+01:00",
    clientId: "cl-001",
    who: "Klient",
    kind: "upload",
    title: "Nahrány podklady ke sporu",
    detail: "Soubory: faktury-2024-2025.zip, email-korespondence.pdf",
  },
  {
    id: "ac-04",
    at: "2026-02-01T08:31:00+01:00",
    clientId: "cl-002",
    who: "Klient",
    kind: "upload",
    title: "Nahrána plná moc",
    detail: "Soubor: plna-moc-horak.pdf",
  },
  {
    id: "ac-05",
    at: "2026-01-31T15:20:00+01:00",
    clientId: "cl-003",
    who: "Advokátní kancelář",
    kind: "status",
    title: "Dokončena analýza případu",
    detail: "Připraveno podání žaloby.",
  },
];

export const periodLabel = (p: PeriodKey) => {
  switch (p) {
    case "2026-01":
      return "Leden 2026";
    case "2026-02":
      return "Únor 2026";
    default:
      return p;
  }
};

export const statusLabel = (s: DocumentRequestStatus) =>
  s === "received" ? "přijato" : s === "missing" ? "chybí" : "čekáme";

export const categoryLabel = (c: Deadline["category"]) =>
  c === "Jednání" ? "Jednání" : c === "Lhůta" ? "Lhůta" : c === "Revize" ? "Revize" : "Podání";

export const stateLabel = (s: Deadline["state"]) => (s === "ok" ? "OK" : s === "risk" ? "Riziko" : "Blokováno");

export const clientById = (id: string) => demoClients.find((c) => c.id === id);

export const daysUntil = (isoDate: string, now = new Date("2026-02-04T10:00:00+01:00")) => {
  const d = new Date(isoDate + "T00:00:00+01:00");
  const ms = d.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

export const formatDateCZ = (iso: string) => {
  const d = new Date(iso + (iso.includes("T") ? "" : "T00:00:00+01:00"));
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" });
};

export function computeDeadlineState(deadline: Deadline, requests: DocumentRequest[]) {
  const deps = deadline.dependsOn ?? [];
  if (!deps.length) return deadline.state;
  const related = requests.filter((r) => deps.includes(r.id));
  if (!related.length) return deadline.state;
  if (related.some((r) => r.status === "missing")) return "blocked";
  if (related.some((r) => r.status === "waiting")) return "risk";
  return "ok";
}

export function generateChecklistRequests(args: {
  clientId: string;
  period: PeriodKey;
  types: DocumentRequestType[];
}): DocumentRequest[] {
  const client = demoClients.find((c) => c.id === args.clientId);
  if (!client) return [];

  const wanted = new Set(args.types);
  const templates = demoTemplates
    .filter((t) => (wanted.size ? wanted.has(t.type) : true))
    .filter((t) => (t.onlyIf ? t.onlyIf(client) : true));

  const baseUpdatedAt = "2026-02-04";

  return templates.map((t, idx) => {
    const id = `rq-gen-${args.clientId}-${args.period}-${t.key}-${idx}`;
    return {
      id,
      clientId: args.clientId,
      period: args.period,
      type: t.type,
      title: t.title(args.period),
      templateKey: t.key,
      dueDate: t.defaultDueDate(args.period),
      status: "missing",
      note: t.defaultNote,
      assignee: client.leadLawyer,
      updatedAt: baseUpdatedAt,
      files: [],
    };
  });
}
