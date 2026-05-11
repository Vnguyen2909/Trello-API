/* eslint-disable no-useless-catch */

import { slugify } from '~/utils/formatter'

const createNew = async (reqbody) => {
  try {
    // Xu ly logic du lieu tuy dac thu du an
    const newBoard = {
      ...reqbody,
      slug: slugify(reqbody.title)
    }
    // Goi toi tang Model de xu ly ban ghi newBoard vao trong Database

    // Tra ket qua ve, trong Service luon phai co return
    return newBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew
}