import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouters } from '~/routes/v1/boardRoute'
import { columnRouters } from '~/routes/v1/columnRoute'
import { cardRouters } from '~/routes/v1/cardRoute'
import { userRoutes } from './userRoute'

const Router = express.Router()

//Check APIs v1/status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use' })
})

//Board APIs
Router.use('/boards', boardRouters)

//Column APIs
Router.use('/columns', columnRouters)

//Card APIs
Router.use('/cards', cardRouters)

//User APIs
Router.use('/users', userRoutes)

export const APIs_v1 = Router