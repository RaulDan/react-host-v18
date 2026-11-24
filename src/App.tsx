function App() {
  return (
    <main className="mfe-shell">
      <h1>React 18 single-spa host</h1>
      <nav className="mfe-nav" aria-label="Applications">
        <a data-mfe-link href="/">Dashboard</a>
        <a data-mfe-link href="/angular">Angular books</a>
        <a data-mfe-link href="/react">React to-do list</a>
        <a data-mfe-link href="/svelte">Svelte goals</a>
      </nav>
      <p id="mfe-not-found" hidden>Page not found. Use the navigation above.</p>
      <div className="mfe-apps">
        {['books', 'todos', 'goals'].map((name) => (
          <section className="mfe-app" data-mfe={name} key={name}>
            <div className="mfe-error" id={`mfe-error-${name}`} role="alert" hidden>
              <span /> <button type="button" data-mfe-reload>Reload</button>
            </div>
            <div id={`mfe-${name}`} />
          </section>
        ))}
      </div>
    </main>
  )
}

export default App
