
import { WHITELIST_DOMAINS } from '~/utils/constants'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

export const corsOptions = {
  origin: function (origin, callback) {
    //Cho phep goi API bang POSTMAN o moi truong dev
    //Khi su dung POSTMAN thi Origin se co gia tri underfined
    if (!origin && env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    //Kiem tra xem origin co la domain duoc chap nhan hay khong
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    //Cuoi cung neu domain khong duoc chap nhan thi tra ve loi
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  //CORS cho phep nhan cookies tu requets
  credentials: true
}