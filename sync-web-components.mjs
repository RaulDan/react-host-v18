import { cpSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const components = [
  {
    source: '../book-library-angular/dist/webComponent-book-library-angular/browser/',
    output: 'book-library',
    files: ['main.js', 'styles.css'],
    build: 'book-library-angular: npm run build-web-elem-angular',
  },
  {
    source: '../to-do-list-react/build/to-do-list-web-component/',
    output: 'to-do-list-react',
    files: ['static/js/main.js', 'static/css/main.css'],
    build: 'to-do-list-react: npm run build-web-component-react',
  },
  {
    source: '../goals-tracker/.svelte-kit/web-component/',
    output: 'goals-tracker',
    files: ['goals-tracker.js.iife.js', 'goals-tracker.css'],
    build: 'goals-tracker: npm run build-web-component-svelte',
  },
]

for (const component of components) {
  const source = new URL(component.source, import.meta.url)
  for (const file of component.files) {
    if (!existsSync(new URL(file, source))) {
      throw new Error(`Missing ${fileURLToPath(new URL(file, source))}. Build it first in ${component.build}`)
    }
  }
}

for (const component of components) {
  cpSync(
    new URL(component.source, import.meta.url),
    new URL(`public/${component.output}/`, import.meta.url),
    { recursive: true },
  )
}
