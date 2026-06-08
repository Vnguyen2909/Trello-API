
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPE } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { pagingSkipValue } from '~/utils/algorithms'

//Define Collection (Name & Schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required(),

  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  //Nhung Admin cua Boards
  ownerIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  //Thanh vien cua Boards
  memnberIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//Chi dinh cac fields khong cho phep cap trong trong update()
const InvalidUpdateFields = ['id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(String(userId))]
    }

    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    return createdBoard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(id))
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async (userId, boardId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
    //   _id: new ObjectId(String(id))
    // })
    const queryConditions = [
      { _id: new ObjectId(String(boardId)) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      }
    ]).toArray()
    return result[0]
  } catch (error) { throw new Error(error) }
}

//Push gia tri columId vao cuoi mang ColumnOrderIds
const pushColumOrderIds = async ( column ) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(String(column.boardId))
      },
      { $push : { columnOrderIds : new ObjectId(String(column._id)) } },
      { ReturnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const update = async ( boardId, updateData ) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (InvalidUpdateFields.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => new ObjectId(String(_id)))
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(String(boardId))
      },
      { $set : updateData },
      { ReturnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

//Pull lay mot phan tu columId ra khoi mang columnOrderIds
const pullColumOrderIds = async ( column ) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(String(column.boardId))
      },
      { $pull : { columnOrderIds : new ObjectId(String(column._id)) } },
      { ReturnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      //Dieu kien 01: Board chua bi xoa
      { _destroy: false },
      //Dieu kien 02: UserId dang thuc hien phai thuoc memberIds hoac ownerIds cuar Board
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      //sort title cua Board theo A-Z
      { $sort: { title: 1 } },
      //Xu ly nhieu luong trong 1 query
      { $facet: {
        //Luong thu nhat: query Boards
        'queryBoards' : [
          //Bo qua so luong ban ghi cua nhung page truoc do
          { $skip: pagingSkipValue(page, itemsPerPage) },
          //Gioi han toi da so luong ban ghi tra ve tren 1 Page
          { $limit: itemsPerPage }
        ],
        //Luong thu hai: dem tong so luong ban ghi Board trong Database
        'queryTotalBoards' : [{ $count: 'countedAllBoards' }]
      } }
    ], { collation: { locale: 'en' } }).toArray()

    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) { throw new Error(error) }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumOrderIds,
  update,
  pullColumOrderIds,
  getBoards
}
