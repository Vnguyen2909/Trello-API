/* eslint-disable no-useless-catch */

import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqbody) => {
  try {
    const newColumn = {
      ...reqbody
    }

    const createdColumn = await columnModel.createNew(newColumn)

    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      //Xu ly cau truc data o day truoc khi tra du lieu ve
      getNewColumn.cards = []

      //Cap nhat mang
      await boardModel.pushColumOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) { throw error }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  } catch (error) { throw error }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }

    //Xoa Column
    await columnModel.deleteOneById(columnId)
    //Xoa toan bo Card trong Column
    await cardModel.deleteManyByColumnId(columnId)
    //Xoa columnId trong mang ColumnOrderIds cua cai Board chua no
    await boardModel.pullColumOrderIds(targetColumn)

    return { deleteResult: 'Column and its Cards deleted successfully!' }
  // eslint-disable-next-line no-unreachable
  } catch (error) { throw error }
}


export const columnService = {
  createNew, update, deleteItem
}