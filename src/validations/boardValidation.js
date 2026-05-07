/* eslint-disable no-console */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  const conrrectCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
  })

  try {
    console.log(req.body),

    //Chi dinh abortEarly false : truong hop co nhieu loi Validaiton thi tra ve tat ca loi
    await conrrectCondition.validateAsync(req.body, { abortEarly: false })

    //next()
    res.status(StatusCodes.CREATED).json({ message: 'POST from Validation: API create new board' })
  } catch (error) {
    console.log(error),
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }
}

export const boardValidation = {
  createNew
}