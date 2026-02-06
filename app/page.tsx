import Link from "next/link";
import styles from "./LandingPage.module.css";

export default function Landing() {
  return (
    <main className={styles.page}>
      <div className="container">
        <header className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.mark} aria-hidden>
              A
            </div>
            <div>
              <div className={styles.brandTitle}>Askela • demo dashboard</div>
              <div className={styles.brandSub}>MAR‑EKON • klientský portál (bez backendu)</div>
            </div>
          </div>

          <div className={styles.actions}>
            <Link className="btn" href="/start?to=%2Fportal">
              Otevřít přes potvrzení
            </Link>
            <Link className="btn btnPrimary" href="/portal">
              Otevřít dashboard
            </Link>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={`card ${styles.heroCard}`}>
            <div className={styles.kicker}>rychlý přístup</div>
            <h1 className={`display ${styles.title}`}>Klientský dashboard pro účetní kancelář.</h1>
            <p className={styles.lead}>
              Pokud sem někdo omylem spadne, tady je to už čistě produktově: žádná dlouhá prezentace.
              V dashboardu ukázkově funguje workflow podkladů, termíny s připomínkami, klienti a reporty – vše bez backendu.
            </p>

            <div className={styles.pills}>
              <span className={styles.pill}>
                <span className={styles.dot} aria-hidden /> Podklady
              </span>
              <span className={styles.pill}>
                <span className={styles.dot} aria-hidden style={{ background: "rgba(240,195,106,.95)" }} /> Termíny
              </span>
              <span className={styles.pill}>
                <span className={styles.dot} aria-hidden style={{ background: "rgba(110,231,183,.95)" }} /> Reporty
              </span>
              <span className={styles.pill}>Bez backendu • demo data</span>
            </div>

            <div className={styles.quick}>
              <div className={`card ${styles.quickCard}`}>
                <div className={styles.quickHead}>
                  <h2 className={`display ${styles.quickTitle}`}>Kam kliknout</h2>
                  <span className="badge">Doporučení</span>
                </div>
                <p className={styles.quickSub}>
                  Pro první dojem otevřete <b>Přehled</b> a pak si zkuste v <b>Podkladech</b> změnit stav a nahrát soubor –
                  uvidíte, že se to propsuje do aktivit a termínů.
                </p>
                <div className={styles.links}>
                  <Link className={`${styles.linkBtn} ${styles.linkPrimary}`} href="/portal">
                    Přehled (/portal)
                  </Link>
                  <Link className={styles.linkBtn} href="/portal/podklady">
                    Podklady
                  </Link>
                  <Link className={styles.linkBtn} href="/portal/terminy">
                    Termíny
                  </Link>
                  <Link className={styles.linkBtn} href="/portal/klienti">
                    Klienti
                  </Link>
                  <Link className={styles.linkBtn} href="/portal/reporty">
                    Reporty
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <aside className={styles.preview} aria-label="Náhled dashboardu">
            <div className={styles.previewInner}>
              <div className={styles.miniRow}>
                <div className={styles.miniTitle}>Přehled</div>
                <div className={styles.miniMuted}>Únor 2026</div>
              </div>
              <div className={styles.miniGrid}>
                <div className={styles.miniKpi}>
                  <div className={styles.miniKpiLabel}>Chybí podklady</div>
                  <div className={styles.miniKpiVal}>3</div>
                </div>
                <div className={styles.miniKpi}>
                  <div className={styles.miniKpiLabel}>Blokované termíny</div>
                  <div className={styles.miniKpiVal}>1</div>
                </div>
                <div className={styles.miniKpi}>
                  <div className={styles.miniKpiLabel}>Aktivita dnes</div>
                  <div className={styles.miniKpiVal}>5</div>
                </div>
              </div>
              <div className="hr" />
              <div className={styles.miniRow}>
                <div className={styles.miniTitle}>Demo</div>
                <div className={styles.miniMuted}>UI only</div>
              </div>
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55 }}>
                V ostrém systému se sem napojí data z účetnictví/klientů a automatické notifikace.
              </div>
            </div>
          </aside>
        </section>

        <div className={styles.footer}>
          <span>© Askela • demo</span>
          <span>Tip: otevřete rovnou /portal</span>
        </div>
      </div>
    </main>
  );
}
