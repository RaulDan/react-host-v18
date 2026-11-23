import './App.css'
import RemotePanel from './RemotePanel'
import { Link, Route, Routes } from 'react-router-dom'
import type { RemoteId } from './federation/contract'

interface RemoteInfo {
    remoteId: RemoteId
    title: string
    framework: string
    path: string
}

const remotes: RemoteInfo[] = [
    { remoteId: 'book_library', title: 'Book library', framework: 'Angular 22', path: '/angular-app' },
    { remoteId: 'goals_tracker', title: 'Goals tracker', framework: 'Svelte 5', path: '/svelte-app' },
    { remoteId: 'todo_list', title: 'To-do list', framework: 'React 19', path: '/react-app' },
]

function RemotePage({ panels }: { panels: RemoteInfo[] }) {
    return (
        <div className={`dashboard${panels.length === 1 ? ' single' : ''}`}>
            {panels.map((panel) => <RemotePanel key={panel.remoteId} {...panel} />)}
        </div>
    )
}

function App() {
    return (
        <main className="component-host">
            <h1>React 18 Module Federation Host</h1>
            <p>Three independently deployed apps, each running its own framework.</p>
            <nav aria-label="Main navigation"><Link to="/">All apps</Link></nav>
            <Routes>
                <Route path="/" element={<RemotePage panels={remotes} />} />
                {remotes.map((remote) => (
                    <Route key={remote.remoteId} path={remote.path} element={<RemotePage panels={[remote]} />} />
                ))}
                <Route path="*" element={<p role="alert">Page not found.</p>} />
            </Routes>
        </main>
    )
}

export default App
