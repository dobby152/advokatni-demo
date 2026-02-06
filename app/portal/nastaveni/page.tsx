export default function NastaveniPage() {
  return (
    <section className="card" style={{ padding: 18, background: "rgba(0,0,0,0.14)", boxShadow: "none" }}>
      <div className="kicker">nastavení</div>
      <div className="display" style={{ fontSize: 26, marginTop: 8 }}>Nastavení (placeholder)</div>
      <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
        V produkci: pravidla připomínek, šablony požadavků, notifikace, uživatelské role a audit.
      </div>
    </section>
  );
}
