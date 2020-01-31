import { Request } from './requests'

export interface Position {
  x: number
  y: number
}

export type Rotation = number

export interface BotAPI<S> {
  initState?: () => S

  handlers: {
    radarScanNotification?: (
      data: RadarScanNotification,
      state: S
    ) => { state: S, requests: Request[] }

    registerPlayerResponse?: (
      data: SuccessfulRegisterPlayerResponse | FailedRegisterPlayerResponse,
      state: S
    ) => { state: S, requests: Request[] }

    rotatePlayerResponse?: (
      data: SuccessfulRotatePlayerResponse | FailedRotatePlayerResponse,
      state: S
    ) => { state: S, requests: Request[] }

    movePlayerResponse?: (
      data: SuccessfulMovePlayerResponse | FailedMovePlayerResponse,
      state: S
    ) => { state: S, requests: Request[] }

    shootResponse?: (
      data: SuccessfulShootResponse | FailedShootResponse,
      state: S
    ) => { state: S, requests: Request[] }

    deployMineResponse?: (
      data: SuccessfulDeployMineResponse | FailedDeployMineResponse,
      state: S
    ) => { state: S, requests: Request[] }

    shotHitNotification?: (
      data: PlayerShotHitNotification,
      state: S
    ) => { state: S, requests: Request[] }

    // TODO include handler for destroyed player

    startGameNotification?: (state: S) => { state: S, requests: Request[] }

    joinGameNotification?: (state: S) => { state: S, requests: Request[] }
  }
}

export interface ScannedPlayer {
  id: string
  position: Position
  rotation: Rotation
}

export interface ScannedShot {
  position: Position
  rotation: Rotation
}

export interface ScannedMine {
  position: Position
}

export interface ScannedUnknown {
  position: Position
}

export interface RadarScanNotification {
  data: {
    players: ScannedPlayer[]
    shots: ScannedShot[]
    mines: ScannedMine[]
    unknown: ScannedUnknown[]
  }
}

export interface SuccessfulRegisterPlayerResponse {
  success: true
  data: {
    id: string
    position: Position
    rotation: Rotation
  }
}

export interface FailedRegisterPlayerResponse {
  success: false
  data: string
}

export interface SuccessfulMovePlayerResponse {
  success: true
  data: {
    tokens: number
    position: Position
    request: {
      withTurbo: boolean
      cost: number
    }
  }
}

export interface FailedMovePlayerResponse {
  success: false
  data: string
}

export interface SuccessfulRotatePlayerResponse {
  success: true
  data: {
    tokens: number
    rotation: number
    request: {
      cost: number
    }
  }
}

export interface FailedRotatePlayerResponse {
  success: false
  data: string
}

export interface SuccessfulShootResponse {
  success: true
  data: {
    tokens: number
    request: {
      cost: number
    }
  }
}

export interface FailedShootResponse {
  success: false
  data: string
}

export interface SuccessfulDeployMineResponse {
  success: true
  data: {
    tokens: number
    request: {
      cost: number
    }
  }
}

export interface FailedDeployMineResponse {
  success: false
  data: string
}

export interface PlayerShotHitNotification {
  damage: number
}
