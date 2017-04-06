export const changeCurrentUsersPasswordQueryObj = (newPw) => ({
  query: 'CALL dbms.security.changePassword($password)',
  parameters: {password: newPw}
})
