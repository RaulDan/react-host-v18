import './App.css'
import {createElement} from "react";

function App() {
    return (
        <main className="component-host">
            <h1>React Host</h1>
            <main className="component-host">
                <h1>React Host</h1>
                <section aria-label="Book library">
                    {createElement('web-component-book-library-app')}
                </section>
                <section aria-label="Goals tracker">
                    {createElement('web-component-goals-tracker')}
                </section>
                <section aria-label="To-do list">
                    {createElement('web-component-todo-list')}
                </section>
            </main>
        </main>
    )
}

export default App
