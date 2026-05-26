/* eslint-disable no-useless-catch */

import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'

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


export const columnService = {
  createNew, update
}