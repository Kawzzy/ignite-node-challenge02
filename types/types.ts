export interface IUser {
  id: string
  sessionId: string
  name: string
}

export interface IMeal {
  id: string
  name: string
  desc: string
  isHealthy: boolean
  userId: string
}