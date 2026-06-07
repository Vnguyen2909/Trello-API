/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'

const createNew = async (reqbody) => {
  try {
    //Kiem tra xem email da ton tai chua
    const existUser = await userModel.findOneByEmail(reqbody.email)

    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already Exists!')
    }

    //Tao data luu vao Database
    const nameFromEmail = reqbody.email.split('@')[0]
    const newUser = {
      email: reqbody.email,
      password: bcryptjs.hashSync(reqbody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    //Thuc hien luu vao Database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    //Gui email cho nguoi dung xac thuc tai khoan
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Please verify your email before using our service!'
    const htmlContent = `
    <h3>Here is you verification link:</h3>
    <h3>${verificationLink}</h3>
    `
    //Goi toi cai Provider gui email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    //Tra ve du lieu cho phia Controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqbody) => {
  try {
    //Query user trong Database
    const exitsUser = await userModel.findOneByEmail(reqbody.email)

    //Cac buoc kiem tra can thiet
    if (!exitsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')

    if (exitsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')

    if (reqbody.token !== exitsUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is valid')

    //Cap nhat lai thong tin cua user de verify account
    const updateData = {
      isActive : true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(exitsUser._id, updateData)

    //Tra ve du lieu cho phia Controller
    return pickUser(updatedUser)

  } catch (error) { throw error }
}

const login = async (reqbody) => {
  try {
    //Query user trong Database
    const exitsUser = await userModel.findOneByEmail(reqbody.email)

    //Cac buoc kiem tra can thiet
    if (!exitsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')

    if (!exitsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    if (!bcryptjs.compareSync(reqbody.password, exitsUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your password is incorrect!')
    }

    /**Neu moi thu ok thi bat dau tao Token dang nhap gui ve phia FE*/
    //Tao thong tin de dinh kem trong JWT Token gom _id va email cua user
    const userInfo = {
      _id: exitsUser._id,
      email: exitsUser.email
    }
    //Tao ra 2 loai Token: accessToken va refreshToken de tra ve phia FE
    const accessToken = await JwtProvider.genarateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)
    const refreshToken = await JwtProvider.genarateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

    //Tra thong tin cua user kem 2 cai Token vua tao
    return { accessToken, refreshToken, ...pickUser(exitsUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    //Verify giai ma cai refreshToken xem co hop le khong
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    //Tao token moi
    const accessToken = await JwtProvider.genarateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)

    return { accessToken }
  } catch (error) { throw error }
}

export const userService = {
  createNew, verifyAccount, login, refreshToken
}