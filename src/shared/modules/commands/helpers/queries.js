export const handleQueriesCommand = (action, cmdchar, put, store) => {
  console.log("Handle Server Command");
  console.log(action);
  return {...action, type: 'queries', result: "{res : 'QUERIES RESULT'}" }; 
}
