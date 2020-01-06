import * as fs from 'fs'
import * as path from 'path'
import * as _ from 'lodash'
import yargs from 'yargs'
import {
  BotAPI,
  BotState,
  Rotation
} from './types'
import { ActionTypes, MovementDirection } from './actions'
import { Channel, createLogChannel, WebSocketChannel } from './channel'

import {
  MessageTypes,
  RequestTypes,
  RegisterPlayerRequestMessage,
  MovePlayerRequestMessage,
  RotatePlayerRequestMessage,
  ShootRequestMessage,
  DeployMineRequestMessage,
  isRegisterPlayerResponseMessage,
  isMovePlayerResponseMessage,
  isRotatePlayerResponseMessage,
  isRadarScanNotificationMessage,
  isStartGameNotificationMessage,
  isJoinGameNotificationMessage,
  isShootResponseMessage
} from './messages'

const argv = yargs.demand(['i']).argv
let channel: Channel

if (argv.f) {
  // TODO fix the argv typing
  channel = createLogChannel({ path: argv.f as string })
} else {
  channel = new WebSocketChannel('ws://localhost:8889')
}

const playerId = argv.i as string
const messagesLogPath = path.join(__dirname, argv.i + '-messages.log')

function move (channel: Channel, direction: MovementDirection): void {
  const data: MovePlayerRequestMessage = {
    type: MessageTypes.Request,
    id: RequestTypes.MovePlayer,
    data: {
      movement: {
        direction: direction
      }
    }
  }

  writeMessagesToFile('send', data)

  channel.send(JSON.stringify(data))
}

function rotate (channel: Channel, rotation: Rotation): void {
  const data: RotatePlayerRequestMessage = {
    type: MessageTypes.Request,
    id: RequestTypes.RotatePlayer,
    data: {
      rotation
    }
  }

  writeMessagesToFile('send', data)

  channel.send(JSON.stringify(data))
}

function shoot (channel: Channel): void {
  const data: ShootRequestMessage = {
    type: MessageTypes.Request,
    id: RequestTypes.Shoot
  }

  writeMessagesToFile('send', data)

  channel.send(JSON.stringify(data))
}

function deployMine (channel: Channel): void {
  const data: DeployMineRequestMessage = {
    type: MessageTypes.Request,
    id: RequestTypes.DeployMine
  }

  writeMessagesToFile('send', data)

  channel.send(JSON.stringify(data))
}

function dispatchMessage (channel: Channel, message: any, state: BotState<any>, bot: BotAPI<any>): BotState<any> {
  if (isRegisterPlayerResponseMessage(message)) {
    if (!bot.handlers.registerPlayerResponse) {
      return state
    }

    if (!message.success) {
      const { state: newBotState } = bot.handlers.registerPlayerResponse(
        { success: message.success, data: 'Failed player register' },
        state.bot
      )

      state.bot = newBotState

      return state
    } else {
      if (typeof message.details !== 'object') {
        throw new Error('invalid response message')
      }

      const { position, rotation } = message.details
      const { state: newBotState } = bot.handlers.registerPlayerResponse(
        { success: true, data: { position, rotation } },
        state.bot
      )

      state.bot = newBotState

      return state
    }
  }

  if (isMovePlayerResponseMessage(message)) {
    if (!bot.handlers.movePlayerResponse) {
      return state
    }

    if (!message.success) {
      const { state: newBotState } = bot.handlers.movePlayerResponse(
        { success: message.success, data: 'Failed to move player' },
        state.bot
      )

      state.bot = newBotState

      return state
    } else {
      if (typeof message.details !== 'object') {
        throw new Error('invalid response message')
      }

      const { position } = message.details
      const { state: newBotState, actions: [action] } = bot.handlers.movePlayerResponse(
        { success: true, data: { position } },
        state.bot
      )

      state.bot = newBotState

      if (action && action.type === ActionTypes.Move) {
        move(channel, action.data.direction)
      }

      if (action && action.type === ActionTypes.Rotate) {
        rotate(channel, action.data.rotation)
      }

      return state
    }
  }

  if (isRotatePlayerResponseMessage(message)) {
    if (!bot.handlers.rotatePlayerResponse) {
      return state
    }

    const { state: newBotState, actions: [action] } = bot.handlers.rotatePlayerResponse(
      { success: message.success },
      state.bot
    )

    state.bot = newBotState

    if (action && action.type === ActionTypes.Move) {
      move(channel, action.data.direction)
    }

    if (action && action.type === ActionTypes.Shoot) {
      shoot(channel)
    }

    return state
  }

  if (isShootResponseMessage(message)) {
    if (!bot.handlers.shootResponse) {
      return state
    }

    const { state: newBotState, actions: [action] } = bot.handlers.shootResponse(
      { success: message.success },
      state.bot
    )

    state.bot = newBotState

    if (action && action.type === ActionTypes.Rotate) {
      rotate(channel, action.data.rotation)
    }

    if (action && action.type === ActionTypes.Shoot) {
      shoot(channel)
    }

    return state
  }

  if (isRadarScanNotificationMessage(message)) {
    if (!bot.handlers.radarScanNotification) {
      return state
    }

    if (typeof message.data !== 'object') {
      throw new Error('invalid message response')
    }

    const { data } = message
    const { state: newBotState, actions: [action] } = bot.handlers.radarScanNotification(data, state.bot)

    state.bot = newBotState

    if (!action) {
      return state
    }

    if (action.type === ActionTypes.Move) {
      move(channel, action.data.direction)
    }

    if (action.type === ActionTypes.Rotate) {
      rotate(channel, action.data.rotation)
    }

    if (action.type === ActionTypes.Shoot) {
      shoot(channel)
    }

    if (action.type === ActionTypes.DeployMine) {
      deployMine(channel)
    }

    return state
  }

  if (isStartGameNotificationMessage(message)) {
    if (!bot.handlers.startGameNotification) {
      return state
    }

    const { state: newBotState, actions: [action] } = bot.handlers.startGameNotification(state.bot)

    state.bot = newBotState

    if (action && action.type === ActionTypes.Move) {
      move(channel, action.data.direction)
    }

    if (action && action.type === ActionTypes.Rotate) {
      rotate(channel, action.data.rotation)
    }

    return state
  }

  if (isJoinGameNotificationMessage(message)) {
    if (!bot.handlers.joinGameNotification) {
      return state
    }

    const { state: newBotState, actions: [action] } = bot.handlers.joinGameNotification(state.bot)

    state.bot = newBotState

    if (action && action.type === ActionTypes.Move) {
      move(channel, action.data.direction)
    }

    if (action && action.type === ActionTypes.Rotate) {
      rotate(channel, action.data.rotation)
    }

    return state
  }

  console.log('unexpected message')
  console.dir(message, { colors: true, depth: null })

  return state
}

channel.on('open', function open (): void {
  truncateMessagesFile()

  let botImport: Promise<{ bot: BotAPI<any>}>
  if (argv.p) {
    botImport = import(path.resolve(__dirname, path.relative(__dirname, argv.p as string)))
  } else {
    // TODO remove this import as this framework will only work with custom
    // bots
    botImport = import('./bot')
  }

  botImport.then(({ bot }) => {
    let state: BotState<any> = {
      // TODO fix the typings here
      tracker: argv.t as boolean,
      shooter: argv.s as boolean,
      bot: {}
    }

    channel.on('message', function handleMessage (json: string): void {
      const message = JSON.parse(json)

      writeMessagesToFile('recv', message)
      state = dispatchMessage(channel, message, state, bot)
    })

    const message: RegisterPlayerRequestMessage = {
      type: MessageTypes.Request,
      id: RequestTypes.RegisterPlayer,
      data: {
        id: playerId
      }
    }

    writeMessagesToFile('send', message)
    channel.send(JSON.stringify(message))
  })
})

channel.on('close', function close (): void {
  console.log('Connection closed')
  process.exit(0)
})

function truncateMessagesFile (): void {
  if (fs.existsSync(messagesLogPath)) {
    fs.truncateSync(messagesLogPath)
  }
}

function writeMessagesToFile (prefix: string, messages: any): void {
  const data = '[' + prefix + ']' + JSON.stringify(messages) + '\n'

  fs.appendFileSync(messagesLogPath, data)
}