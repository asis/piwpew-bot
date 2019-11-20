import { IPlanner } from './planner'

export enum MessageTypes {
  Request = 'Request',
  Response = 'Response',
  Notification = 'Notification'
}

export enum RequestTypes {
  RegisterPlayer = 'RegisterPlayer',
  MovePlayer = 'MovePlayer',
  RotatePlayer = 'RotatePlayer',
  Shoot = 'Shoot'
}

export enum ResponseTypes {
  RegisterPlayer = 'RegisterPlayer',
  MovePlayer = 'MovePlayer',
  RotatePlayer = 'RotatePlayer'
}

export enum NotificationTypes {
  RadarScan = 'RadarScan',
  StartGame = 'StartGame'
}

export interface Position {
  x: number
  y: number
}

export interface RegisterPlayerRequestMessage {
  sys: {
    type: MessageTypes.Request,
    id: RequestTypes.RegisterPlayer
  }
  data: {
    id: string
  }
}

export interface RegisterPlayerResponseMessage {
  sys: {
    type: MessageTypes.Response
    id: ResponseTypes.RegisterPlayer
  }
  success: boolean
  details: {
    id: string
    position: Position
    rotation: number
  }
}

export interface MovePlayerRequestMessage {
  sys: {
    type: MessageTypes.Request
    id: RequestTypes.MovePlayer
  }
  data: {
    movement: {
      direction: MovementDirection
    }
  }
}

export interface MovePlayerResponseMessage {
  sys: {
    type: MessageTypes.Response
    id: ResponseTypes.MovePlayer
  }
  success: boolean
  details: {
    position: Position
  }
}

export interface RotatePlayerRequestMessage {
  sys: {
    type: MessageTypes.Request
    id: RequestTypes.RotatePlayer
  }
  data: {
    rotation: number
  }
}

export interface RotatePlayerResponseMessage {
  sys: {
    type: MessageTypes.Response
    id: 'ComponentUpdate'
  }
  success: boolean
}

export interface RadarScanNotificationMessage {
  sys: {
    type: MessageTypes.Notification
    id: NotificationTypes.RadarScan
  }
  data: {
    players: { position: Position }[]
    unknown: { position: Position }[]
    shots: { position: Position }[]
  }
}

export interface ShootRequestMessage {
  sys: {
    type: MessageTypes.Request
    id: RequestTypes.Shoot
  }
}

export interface StartGameNofiticationMessage {
  sys: {
    type: MessageTypes.Notification
    id: NotificationTypes.StartGame
  }
}

export interface RadarScan {
  players: { position: Position }[]
}

export type Rotation = number

export enum ActionTypes {
  Rotate,
  Shoot,
  Move
}

export enum MovementDirection {
  Forward = 'forward'
}

export interface Bot {
  planner: IPlanner
  // TODO do I need this property in the planner. Isn't it
  // part already of planner.locations.current
  location: Position
  rotation: Rotation
}

export interface RotateAction {
  type: ActionTypes.Rotate
  data: {
    rotation: Rotation
  }
}

export interface MoveAction {
  type: ActionTypes.Move
  data: {
    direction: MovementDirection
  }
}

export interface ShootAction {
  type: ActionTypes.Shoot
}
