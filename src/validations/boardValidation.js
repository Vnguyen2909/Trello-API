/* eslint-disable no-console */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const conrrectCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required (2909ngv)',
      'string.empty': 'Title is not allowed to be empty (2909ngv)',
      'string.min': 'Title length must be at least 3 characters long (2909ngv)',
      'string.max': 'Title length must be less than or equal to 5 characters long (2909ngv)',
      'string.trim': 'Title must not have leading or trailing whitespace (2909ngv)'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    //Chi dinh abortEarly false : truong hop co nhieu loi Validaiton thi tra ve tat ca loi
    await conrrectCondition.validateAsync(req.body, { abortEarly: false })
    //Validation du lieu hop le thi cho request di tiep sang Controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const boardValidation = {
  createNew
}