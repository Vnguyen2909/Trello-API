/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_v1 } from '~/routes/v1'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors'
import cookieParser from 'cookie-parser'
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket'

const START_SERVER = () => {
  const app = express()
  //Fix Cache from disk cua ExpressJS
  app.use((req, res, next) => {
    res.set('Cache-control', 'no-store')
    next()
  })

  //Cau hinh CookieParser
  app.use(cookieParser())
  //Xu ly CORS
  app.use(cors(corsOptions))

  //Enable req.body json data
  app.use(express.json())

  //Use APIs v1
  app.use('/v1', APIs_v1)

  //Middleware xu ly loi tap trung
  app.use(errorHandlingMiddleware)

  //Tao sever moi boc App cua Express de lam realtime SocketIo
  const server = http.createServer(app)
  //Khoi tao bien io voi sever va cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  //Moi truong Production
  if (env.BUILD_MODE === 'production') {
    server.listen(env.APP_PORT, env.APP_HOST, () => {
      console.log(`Production - Hi ${env.AUTHOR} - Back-end is running successfully at Host and Port: http://${ env.APP_HOST }:${ env.APP_PORT }/`)
    })
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`Local Dev - Hi ${env.AUTHOR} - Back-end is running successfully at Host and Port: http://${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

  exitHook(() => {
    console.log('Server is shutting down...')
    CLOSE_DB()
    console.log('Disconnected from MongoDB Cloud Atlas')
  })
}

(async() => {
  try {
    console.log('Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('Connected to MongoDB Cloud Atlas')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

