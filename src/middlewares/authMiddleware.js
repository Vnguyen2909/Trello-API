import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

//Middleware nay dam nhiem viec xac thuc cai JWT accessToken nhan duoc tu phia FE co hop le hay khong
const isAuthorized = async (req, res, next) => {

  //Lay accessToken nam trong request cookia phia client - withCredentials trong authorizeAxios
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (Token not found)'))
    return
  }

  try {
    //Thuc hien giai ma Token
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    //Hop le: Luu thong tin giai ma vao req.jwtDecoded de su dung cac tang phia sau
    req.jwtDecoded = accessTokenDecoded
    //Cho phep request di tiep
    next()
  } catch (error) {
    //Neu nhu accessToken bi gioi han (expired) thi minh can tra ve mot cai ma loi 410 cho phia FE biet de goi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh Token'))
      return
    }
    //Neu nhu cai accessToken no khong hop le (tru truong hop bi gioi han) => tra ve ma 401 cho phai FE goi API sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}