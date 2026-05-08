import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  try {
    //Dieu huong du lieu sang tang Service
    
    //Co ket qua thi tra ve phia Client
    res.status(StatusCodes.CREATED).json({ message: 'POST from Controller: API create new board' })
  } catch (error) {next(error)}
}

export const boardController = {
  createNew
}