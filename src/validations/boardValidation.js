/* eslint-disable no-console */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  const conrrectCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    //Chi dinh abortEarly false : truong hop co nhieu loi Validaiton thi tra ve tat ca loi
    await conrrectCondition.validateAsync(req.body, { abortEarly: false })
    //Validation du lieu hop le thi cho request di tiep sang Controller
    next()
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