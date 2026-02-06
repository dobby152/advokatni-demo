"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./PortalShell.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function Icon({ name }: { name: "overview" | "docs" | "dates" | "clients" | "reports" | "settings" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  switch (name) {
    case "overview":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-16v5h7V4h-7Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "docs":
      return (
        <svg {...common} aria-hidden>
          <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 13h8M8 17h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "dates":
      return (
        <svg {...common} aria-hidden>
          <path d="M8 2v3M16 2v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4.5 6.5h15v14A2.5 2.5 0 0 1 17 23H7a2.5 2.5 0 0 1-2.5-2.5v-14Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7.5 10.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7.5 14.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "clients":
      return (
        <svg {...common} aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "reports":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 20V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 8h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} aria-hidden>
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2.2 2.2 0 0 1 0 3.11 2.2 2.2 0 0 1-3.11 0l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1.09 1.64V21a2.2 2.2 0 0 1-4.4 0v-.08A1.8 1.8 0 0 0 8.4 19.4a1.8 1.8 0 0 0-1.98.36l-.06.06a2.2 2.2 0 0 1-3.11 0 2.2 2.2 0 0 1 0-3.11l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.64-1.09H2.9a2.2 2.2 0 0 1 0-4.4h.08A1.8 1.8 0 0 0 4.6 8.4a1.8 1.8 0 0 0-.36-1.98l-.06-.06a2.2 2.2 0 0 1 0-3.11 2.2 2.2 0 0 1 3.11 0l.06.06A1.8 1.8 0 0 0 8.4 4.6a1.8 1.8 0 0 0 1.09-1.64V2.9a2.2 2.2 0 0 1 4.4 0v.08A1.8 1.8 0 0 0 15.6 4.6a1.8 1.8 0 0 0 1.98-.36l.06-.06a2.2 2.2 0 0 1 3.11 0 2.2 2.2 0 0 1 0 3.11l-.06.06A1.8 1.8 0 0 0 19.4 8.4c0 .66.26 1.29.73 1.76.47.47 1.1.73 1.76.73h.08a2.2 2.2 0 0 1 0 4.4h-.08A2.49 2.49 0 0 0 19.4 15Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
  }
}

function cx(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("2026-02");

  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/portal", label: "Přehled", icon: <Icon name="overview" /> },
      { href: "/portal/podklady", label: "Podklady", icon: <Icon name="docs" /> },
      { href: "/portal/terminy", label: "Termíny", icon: <Icon name="dates" /> },
      { href: "/portal/klienti", label: "Klienti", icon: <Icon name="clients" /> },
      { href: "/portal/reporty", label: "Reporty", icon: <Icon name="reports" /> },
      { href: "/portal/nastaveni", label: "Nastavení", icon: <Icon name="settings" /> },
    ],
    []
  );

  const currentLabel = navItems.find((i) => (i.href === "/portal" ? pathname === "/portal" : pathname?.startsWith(i.href)))?.label;

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main">
        Přeskočit na obsah
      </a>

      <header className={styles.topbar}>
        <button
          className={styles.burger}
          type="button"
          aria-label={mobileNavOpen ? "Zavřít navigaci" : "Otevřít navigaci"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          <span aria-hidden className={styles.burgerLines} />
        </button>

        <div className={styles.topbarTitle} aria-label="Aktuální sekce">
          <span className={styles.topbarTitleText}>{currentLabel ?? "Portál"}</span>
        </div>

        <div className={styles.searchWrap}>
          <label className={styles.srOnly} htmlFor="portal-search">
            Vyhledávání
          </label>
          <input
            id="portal-search"
            className={styles.search}
            placeholder="Hledat klienta, podklad, termín…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.periodWrap}>
          <label className={styles.srOnly} htmlFor="portal-period">
            Období
          </label>
          <select
            id="portal-period"
            className={styles.period}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="2026-02">Únor 2026</option>
            <option value="2026-01">Leden 2026</option>
          </select>
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden>
            ME
          </div>
          <div className={styles.profileMeta}>
            <div className={styles.profileName}>Renata (MAR‑EKON)</div>
            <div className={styles.profileHint}>Správce portálu</div>
          </div>
          <button className={styles.profileBtn} type="button" aria-label="Otevřít menu profilu" onClick={() => alert("Demo: profilové menu")}
          >
            ▾
          </button>
        </div>
      </header>

      <aside className={cx(styles.sidebar, mobileNavOpen && styles.sidebarOpen)} aria-label="Hlavní navigace">
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden>
            A
          </div>
          <div className={styles.brandText}>
            <div className={styles.brandName}>Askela</div>
            <div className={styles.brandSub}>MAR‑EKON • dashboard (demo)</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((i) => {
            const active = i.href === "/portal" ? pathname === "/portal" : pathname?.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={cx(styles.navItem, active && styles.navItemActive)}
                onClick={() => setMobileNavOpen(false)}
              >
                <span className={styles.navIcon} aria-hidden>
                  {i.icon}
                </span>
                <span className={styles.navLabel}>{i.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>Tip</div>
            <div className={styles.sidebarCardBody}>
              V demo verzi vše běží bez backendu. V produkci se sem napojí doklady, notifikace a automatické termíny.
            </div>
          </div>
          <Link className={styles.sidebarLink} href="/" aria-label="Zpět na landing">
            ← Zpět na landing
          </Link>
        </div>
      </aside>

      {mobileNavOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Zavřít navigaci"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <main id="main" className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerMuted}>© Askela • MAR‑EKON demo</span>
          <span className={styles.footerMuted}>Bez backendu • UI pouze pro vizualizaci</span>
        </div>
      </footer>
    </div>
  );
}
