/* eslint-disable no-useless-catch */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { cloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqbody) => {
  try {
    const newCard = {
      ...reqbody
    }

    const createdCard = await cardModel.createNew(newCard)

    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      //Cap nhat mang
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody, cardCoverFile, userInfor) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      //Truong hop upload file len Cloud Storage
      const uploadResult = await cloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      //Luu lai url(secure_url) cua file anh vao trong Database
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (updateData.commentToAdd) {
      //Tao du lieu comment them vao Database, can bo sung them nhung field can thiet
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfor._id,
        userEmail: userInfor.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else {
      //Cac truong hop update chung title, description
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew, update
}