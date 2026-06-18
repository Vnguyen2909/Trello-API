/* eslint-disable no-useless-catch */

import { slugify } from '~/utils/formatter'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_PAGE, DEFAULT_ITEM_PER_PAGE } from '~/utils/constants'

const createNew = async (userId, reqbody) => {
  try {
    // Xu ly logic du lieu tuy dac thu du an
    const newBoard = {
      ...reqbody,
      slug: slugify(reqbody.title)
    }

    // Goi toi tang Model de xu ly ban ghi newBoard vao trong Database
    const createdBoard = await boardModel.createNew(userId, newBoard)

    //Lay ban ghi board sau khi goi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Tra ket qua ve, trong Service luon phai co return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    //Deep Clone board la mot cai moi de xu ly khong anh huong toi cai board ban dau
    const resBoard = cloneDeep(board)
    //Dua card ve dung column cua no
    resBoard.columns.forEach(column => {
      //Su dung ham equals cua MongoDB
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    //Xoa card cua Resboard
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    //Cap nhat mang CardOrderIds cua Column ban dau chua card (Xoa id Card cua mang ban dau)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds : reqBody.prevCardOrderIds,
      updatedAt : Date.now()
    })
    //Cap nhat mang CardOrderIds cua Column ma card keo den (Cap nhat id Card vao mang moi)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds : reqBody.nextCardOrderIds,
      updatedAt : Date.now()
    })
    //Cap nhat lai ColumnId cua Card di chuyen
    await cardModel.update(reqBody.currentCardId, { columnId : reqBody.nextColumnId })

    return { updateResult: 'Successfully!' }
  } catch (error) { throw error }
}

const getBoards = async (userId, page, ItemsPerPage, queryFilters) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!ItemsPerPage) ItemsPerPage = DEFAULT_ITEM_PER_PAGE

    const result = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(ItemsPerPage, 10), queryFilters)
    return result
  } catch (error) { throw error }
}

export const boardService = {
  createNew, getDetails, update, moveCardToDifferentColumn, getBoards
}