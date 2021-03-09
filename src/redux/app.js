const initState = { data: 'ssss' }
const reducer = (state = initState, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return action.data
    default:
      return state
  }
}
const app = { initState, reducer }
export default app
