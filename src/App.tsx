import './App.css'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { remoteApps } from './federation'
import RemotePanel from './RemotePanel'

function App() {
    return (
        <BrowserRouter>
            <header>
                <h1>React Host</h1>
                <nav aria-label="Applications">
                    <NavLink to="/" end>Dashboard</NavLink>
                    {remoteApps.map(app => <NavLink key={app.id} to={app.path}>{app.title}</NavLink>)}
                </nav>
            </header>
            <main className="component-host">
                <Routes>
                    <Route path="/" element={<>
                        <h2>Dashboard</h2>
                        <div className="dashboard">
                            {remoteApps.map(app => <section key={app.id}>
                                <h3><Link to={app.path}>{app.title}</Link></h3>
                                <RemotePanel remote={app.id} />
                            </section>)}
                        </div>
                    </>} />
                    {remoteApps.map(app => <Route key={app.id} path={app.path} element={<>
                        <h2>{app.title}</h2>
                        <RemotePanel key={app.id} remote={app.id} />
                    </>} />)}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}

export default App
