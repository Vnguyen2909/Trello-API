import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

//Cau hinh cloudinary, su dung v2 - version
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRECT
})

//Update fiel len cloudinary
const streamUpload = (fileBuffer, folderName ) => {
  return new Promise((resolve, reject) => {
    //Tao 1 luong stream upload len Cloudinary
    let stream = cloudinaryV2.uploader.upload_stream({folder: folderName},
      (error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }})

    //Thuc hien upload len luong bang lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const cloudinaryProvider = {
  streamUpload
}