export type RemoteId = 'book_library' | 'goals_tracker' | 'todo_list'
export type Dispose = () => void | Promise<void>

export interface RemoteApp {
  mount(container: HTMLElement): Promise<Dispose>
}

export interface RemoteDefinition {
  name: RemoteId
  entry: string
  type: 'var' | 'module'
}
