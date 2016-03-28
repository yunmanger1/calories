import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import auth from './modules/auth'
import records from './modules/records'
import stats from './modules/stats'
import users from './modules/users'

export default combineReducers({
  auth,
  records,
  stats,
  users,
  router
})
