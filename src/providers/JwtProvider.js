
// eslint-disable-next-line no-unused-vars
import JWT from 'jsonwebtoken'

//Function tao moi mot Token - Can 3 tham so dau vao
//UserInfo, secretSignature(la mot chuoi String ngau nhien) chu ky bi mat, tokenLife
const genarateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //Ham sign cua JWT - Thuat toan mac dinh HS256
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) { throw new Error(error)}
}

//Kiem tra xem Token co hop le hay khong
const verifyToken = async (token, secretSignature) => {
  try {
    //Ham verify cua JWT
    return JWT.verify(token, secretSignature)
  } catch (error) { throw new Error(error)}
}

export const JwtProvider = {
  genarateToken, verifyToken
}