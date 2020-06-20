export interface User {
  login: string,
  password: string,
  name?: string,
  sirname?: string,
}

export interface Messages {
  login: string,
  text: string,
  admin: boolean,
  room?: string
}

export interface Session {
  login: string,
  name: string,
  sirname: string,
  active: boolean,
  opened?: boolean
}

export interface Chat {
  messages: Messages[],
  room: string
}

