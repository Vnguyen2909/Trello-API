import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { pickUser } from '~/utils/formatter'
import { StatusCodes } from 'http-status-codes'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Nguoi di moi
    const inviter = await userModel.findOneById(inviterId)
    // Nguoi duoc moi
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Tim board de lay data xu ly
    const board = await boardModel.findOneById(reqBody.boardId)

    //Neu khong ton tai 1 trong 3 => reject
    if (!invitee || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    //Tao data can thiet de luu vao DB
    //Co the thu bo hoac lam sai len type, boardInvatitation, status de test xem Model Validate
    const newInvivationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    //Goi sang Model de luu vao DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvivationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    //Ngoai thong tin cua cai board invitation moi tao thi tra ve du ca luon board, inviter, invitee cho FE xu ly
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }
    return resInvitation
  } catch (error) { throw error }
}

export const invitationService = {
  createNewBoardInvitation
}
