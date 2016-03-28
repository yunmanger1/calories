import React from 'react'
import { Route, IndexRoute } from 'react-router'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { push } from 'react-router-redux'

import {tryAuthUser} from 'redux/modules/auth'

import LoginView from 'views/LoginView'
import SignupView from 'views/SignupView'
import RecordListView from 'views/RecordListView'
import NewRecordView from 'views/NewRecordView'
import SettingsView from 'views/SettingsView'
import StatsView from 'views/StatsView'
import UserListView from 'views/UserListView'
import NewUserView from 'views/NewUserView'

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.auth,
  redirectAction: tryAuthUser,
  predicate: auth => auth.isAuthenticated,
  wrapperDisplayName: 'UserIsAuthenticated'
});
// Admin Authorization, redirects non-admins to /app and don't send a redirect param
const UserIsAdmin = UserAuthWrapper({
  authSelector: state => state.auth.user,
  wrapperDisplayName: 'UserIsAdmin',
  predicate: user => user.is_superuser,
  allowRedirectBack: false
});

const UserIsManager = UserAuthWrapper({
  authSelector: state => state.auth.user,
  wrapperDisplayName: 'UserIsManager',
  predicate: user => (user.is_manager || user.is_superuser),
  allowRedirectBack: false
});

export default (store) => (
  <Route path='/'>
    <IndexRoute component={LoginView} />
    <Route path="signup" component={SignupView} />
    <Route path="login" component={LoginView} />
    <Route path="records">
      <IndexRoute component={UserIsAuthenticated(RecordListView)} />
      <Route path="new" component={UserIsAuthenticated(NewRecordView)} />
      <Route path=":id" component={UserIsAuthenticated(NewRecordView)} />
    </Route>
    <Route path="settings" component={UserIsAuthenticated(SettingsView)} />
    <Route path="stats" component={UserIsAuthenticated(StatsView)} />
    <Route path="users">
      <IndexRoute component={UserIsAuthenticated(UserIsManager(UserListView))} />
      <Route path="new" component={UserIsAuthenticated(NewUserView)} />
      <Route path=":id" component={UserIsAuthenticated(NewUserView)} />
    </Route>

  </Route>
)
