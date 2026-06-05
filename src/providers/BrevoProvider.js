
import SibApiV3Sdk from 'sib-api-v3-sdk'
import { env } from '~/config/environment'

const defaultClient = SibApiV3Sdk.ApiClient.instance

const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = env.BREVO_API_KEY

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  //Khoi tao sendSmtpEmail
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  //Tai khoan gui Email: dia chi Admin email (tai khoan tren Brevo)
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  //Nhung tai khoan nhan Email
  //'To' phai la mot array de gui 1 email den nhieu user
  sendSmtpEmail.to = [{ email: recipientEmail }]

  //Title cua Email
  sendSmtpEmail.subject = customSubject
  //Noi dung Email (HTML)
  sendSmtpEmail.htmlContent = customHtmlContent

  //Goi hanh dong gui Email
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}