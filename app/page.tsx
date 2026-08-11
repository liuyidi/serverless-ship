const capabilities = [
  "GitHub release and deploy webhooks",
  "Feishu notifications for users or groups",
  "Supabase-backed state and retries",
  "Vercel serverless API routes",
];

const stack = [
  "Vercel Hobby",
  "Supabase Free",
  "GitHub Actions",
  "Feishu OpenAPI",
];

export default function HomePage() {
  return (
    <main>
      <div className="shell">
        <section className="hero">
          <div className="eyebrow">Serverless Feishu deploy notifier for minibot</div>
          <h1>ServerlessShip</h1>
          <p>
            A lightweight deployment companion that turns minibot release events into polished Feishu
            notifications, without a long-running backend.
          </p>
          <div className="ctaRow">
            <a className="button primary" href="/api/health">
              Check health
            </a>
            <a className="button secondary" href="https://github.com/liuyidi/serverless-ship">
              Open GitHub
            </a>
          </div>
        </section>

        <section className="grid two">
          <article className="card">
            <h2 className="sectionTitle">What it does</h2>
            <ul>
              {capabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2 className="sectionTitle">Suggested stack</h2>
            <div className="tagRow" style={{ marginTop: 12 }}>
              {stack.map((item) => (
                <span className="tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <p style={{ marginTop: 16 }}>
              The first version stays simple: one deploy source, one notification path, one audit trail.
            </p>
          </article>
        </section>

        <section className="grid two">
          <article className="card">
            <h3>Core flow</h3>
            <p>GitHub Actions or a manual release event hits Vercel, then ServerlessShip formats and sends the Feishu card.</p>
          </article>
          <article className="card">
            <h3>Data model</h3>
            <p>Supabase stores projects, notification targets, releases, and delivery attempts for retry and audit.</p>
          </article>
        </section>

        <p className="foot">
          Built as a thin serverless layer for minibot release notifications.
        </p>
      </div>
    </main>
  );
}
