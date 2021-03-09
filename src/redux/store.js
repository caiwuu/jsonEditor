import app from './app'
import { applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk'
const reducers = {
  app: app.reducer,
}
const finalReducer = combineReducers(reducers)
const store = createStore(finalReducer, applyMiddleware(thunk))
export default store
