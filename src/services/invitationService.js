import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { pickUser } from '~/utils/formatter'
import { StatusCodes } from 'http-status-codes'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'

const createNewBoardInvitation = async (reqBody, inviterId) => {
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
  } catch (error) { throw new Error(error) }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)

    //Vi cac du lieu inviter, invitee va board dang o gia tri mang 1 phan tu => Neu lay ra chung ta bien doi thanh Json Object truoc khi tra ve
    const resInvitations = getInvitations.map(i => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      }
    })

    return resInvitations
  } catch (error) { throw new Error(error) }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

    //Sau khi getInvitation roi thi lay full thong tin board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    //Kiem tra status la ACCEPTED => Join cai Board vao user (Invitee) da la owner hoac member cua Board roi thi tra ve loi
    const boardOwnerMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already member or owner of this board!')
    }

    //Tao du lieu de update ban ghi vao Database
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }

    //Cap nhat ban ghi
    const updatedInvitaion = await invitationModel.update(invitationId, updateData)

    //Neu trong truong hop Accept thanh cong mot loi moi => Them thong tin user(userId) vao ban ghi memberIds
    if (updatedInvitaion.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(boardId, userId)
    }
    return updatedInvitaion
  } catch (error) { throw new Error(error) }
}

export const invitationService = {
  createNewBoardInvitation, getInvitations, updateBoardInvitation
}
