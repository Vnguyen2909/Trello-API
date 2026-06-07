// eslint-disable-next-line no-unused-vars
import multer from 'multer';
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

//Function kiem tra loai file duoc chap nhan
const customFileFilter = (req, file, callback) => {

  //Doi voi multer, kiem tra kieu file bang mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    return callback(new ApiError(StatusCodes.UNAUTHORIZED, 'File type is invalid. Only accept jpg, jpeg and png'), null)
  }

  return callback(null, true)
}

const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE},
  fileFilter : customFileFilter
})

export const multerUploadMiddleware = { upload }