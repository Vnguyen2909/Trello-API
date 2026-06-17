
//Params socket se duoc lay tu thu vien IoSoket
export const inviteUserToBoardSocket = (socket) => {
  //Lang nghe su kien tu client emit gui len (FE)
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //Emit lai nguoc lai su kien ve cho moi client khac (Ngoai tru cai client da gui len)
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}