/* eslint-disable no-useless-catch */

import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqbody) => {
  try {
    // Xu ly logic du lieu tuy dac thu du an
    const newBoard = {
      ...reqbody,
      slug: slugify(reqbody.title)
    }

    // Goi toi tang Model de xu ly ban ghi newBoard vao trong Database
    const createdBoard = await boardModel.createNew(newBoard)

    //Lay ban ghi board sau khi goi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Tra ket qua ve, trong Service luon phai co return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    return board
  } catch (error) { throw error }
}

export const boardService = {
  createNew, getDetails
}