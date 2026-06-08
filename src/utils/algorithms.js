
//Tinh toan gia tri skip phuc vu cho tac vu phan Trang
export const pagingSkipValue = ( page, itemsPerPage ) => {
  //Luon dam bao gia tri khong hop le thi return 0
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  //
  return (page - 1) * itemsPerPage
}
