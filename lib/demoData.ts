export type DemoClient = {
  company: string;
  tagline: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
};

export type DemoRequest = {
  id: string;
  title: string;
  due: string;
  status: "waiting" | "received" | "missing";
  note?: string;
};

export type DemoTask = {
  id: string;
  title: string;
  owner: "Klient" | "MAR‑EKON";
  due: string;
  status: "todo" | "doing" | "done";
};

export const demoClient: DemoClient = {
  company: "MAR‑EKON s.r.o.",
  tagline: "Rodinná účetní firma • digitální zpracování dokladů • reporty pro růst",
  contactName: "Renata Hromková",
  contactRole: "Jednatelka / hlavní účetní",
  contactEmail: "agentura@mar-ekon.cz",
};

export const demoRequests: DemoRequest[] = [
  {
    id: "rq-01",
    title: "DPH — přijaté faktury (leden)",
    due: "do 10. 2.",
    status: "waiting",
    note: "Nahrajte PDF + případně e-mailové potvrzení o přijetí",
  },
  {
    id: "rq-02",
    title: "DPH — vydané faktury (leden)",
    due: "do 10. 2.",
    status: "received",
    note: "Přijato: 12 dokladů",
  },
  {
    id: "rq-03",
    title: "Mzdy — podklady pro výplaty (únor)",
    due: "do 18. 2.",
    status: "missing",
    note: "Chybí: docházka / změny úvazků",
  },
  {
    id: "rq-04",
    title: "Banka — výpisy (leden)",
    due: "do 5. 2.",
    status: "received",
    note: "Importované 3 soubory",
  },
];

export const demoTasks: DemoTask[] = [
  {
    id: "ts-01",
    title: "Zavést jednotný sběr dokladů pro všechny provozovny",
    owner: "MAR‑EKON",
    due: "tento týden",
    status: "doing",
  },
  {
    id: "ts-02",
    title: "Nastavit šablony požadavků na podklady (DPH/Mzdy) + připomínky",
    owner: "MAR‑EKON",
    due: "zítra",
    status: "todo",
  },
  {
    id: "ts-03",
    title: "Klient: potvrdit osoby pro schvalování dokladů",
    owner: "Klient",
    due: "dnes",
    status: "todo",
  },
  {
    id: "ts-04",
    title: "Vygenerovat měsíční report hospodaření",
    owner: "MAR‑EKON",
    due: "do konce měsíce",
    status: "done",
  },
];

export const demoInsights = [
  {
    title: "Termíny pod kontrolou",
    body: "Všechny povinnosti (DPH, mzdy, přiznání) jsou v jednom kalendáři. Portál automaticky připomíná chybějící podklady.",
  },
  {
    title: "Sběr dokladů bez nahánění",
    body: "Klient vidí jasný seznam požadavků, ví co chybí a do kdy. Vy vidíte stav po firmách i po měsících.",
  },
  {
    title: "Přehledy pro růst",
    body: "Jednoduché reporty (cashflow, náklady, marže) z účetních dat — pro rychlá rozhodnutí majitele.",
  },
];
