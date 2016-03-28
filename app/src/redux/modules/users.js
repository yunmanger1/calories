import { checkHttpStatus, parseJSON, Enum, updateOrAppend } from '../../utils'
import { push } from 'react-router-redux'
import fetch from 'isomorphic-fetch'
import queryString from 'query-string'

import {authFailed, getToken} from './auth'
import { base_url } from './common'
import {uniqBy} from 'lodash'

// ------------------------------------
// Constants
// ------------------------------------
const CREATE_USER = Enum("CREATE_USER", "REQUEST", "SUCCESS", "FAILURE", "INIT");
const GET_USERS = Enum("GET_USERS", "REQUEST", "SUCCESS", "FAILURE");
const FILTER = Enum("FILTER", "UPDATED", "CLEARED");
const DELETE_USER = Enum("DELETE_USER", "REQUEST", "SUCCESS", "FAILURE");
const UPDATE_USER = Enum("UPDATE_USER", "REQUEST", "SUCCESS", "FAILURE");
const GET_USER = Enum("GET_USER", "REQUEST", "SUCCESS", "FAILURE");


// ------------------------------------
// Actions
// ------------------------------------

// ---------------------- new user -----------------------

export const createUserRequest = (payload) => {
  return {
    type: CREATE_USER.REQUEST,
    payload
  }
};

export const clearForm = () => {
  return {
    type: CREATE_USER.INIT
  }
};

export const createUserSuccess = (payload) => {
  return {
    type: CREATE_USER.SUCCESS,
    payload: payload
  }
};

export const createUserFailure = (errors) => {
  return {
    type: CREATE_USER.FAILURE,
    errors
  }
};

export const createUser = (fields, token = null, redirect = '/users') => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch(createUserRequest(fields));
      return fetch(`${base_url}/v1/users/`, {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`
        },
        body: JSON.stringify(fields)
      })
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(createUserSuccess(response));
          dispatch(push(redirect));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(createUserFailure(error.data));
      })
    });
  }
};

// --------------- filter users --------------------

export const filterUsers = (query) => {
  return (dispatch: Function, getState: Function) => {
    dispatch({
      type: FILTER.UPDATED,
      query
    });
    dispatch(loadUsers())
  }
};

// --------------- load users ----------------------

export const loadUsersSuccess = (response, page) => {
  return {
    type: GET_USERS.SUCCESS,
    data: response.results,
    count: response.count,
    has_next: (response.next ? true : false),
    page: (response.next ? page + 1 : page)
  }
};

export const loadUsersFailure = (payload) => {
  return {
    type: GET_USERS.FAILURE,
    payload
  }
};

export const loadUsers = (page = null, query = null, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch({
        type: GET_USERS.REQUEST
      });
      let state = getState().users;
      if (!page){
        page = state.page;
      }
      if (!query) {
        query = state.query || {};
      }
      let q = {
        ...query
      };
      if (query.from_date){
        q.from_date = query.from_date.toJSON()
      }
      if (query.to_date){
        q.to_date = query.to_date.toJSON()
      }
      return fetch(`${base_url}/v1/users/?page=${page}&${queryString.stringify(q)}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`
        }
      })
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(loadUsersSuccess(response, page));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(loadUsersFailure(error));
      })
    }, error => dispatch(authFailed(error)));
  }
};


// --------------- update user ----------------------

export const updateUserRequest = (payload) => {
  return {
    type: UPDATE_USER.REQUEST,
    payload
  }
};

export const updateUserSuccess = (payload) => {
  return {
    type: UPDATE_USER.SUCCESS,
    payload: payload
  }
};

export const updateUserFailure = (errors) => {
  return {
    type: UPDATE_USER.FAILURE,
    errors
  }
};

export const updateUser = (id, fields, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch(updateUserRequest({id, ...fields}));
      return fetch(`${base_url}/v1/users/${id}/`, {
        method: 'put',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`
        },
        body: JSON.stringify(fields)
      })
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(updateUserSuccess(response));
          dispatch(push("/users"))
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(updateUserFailure(error.data));
      })
    });
  }
};


// --------------- delete user ----------------------

export const deleteUserSuccess = (payload) => {
  return {
    type: DELETE_USER.SUCCESS,
    payload: payload
  }
};

export const deleteUserFailure = (payload) => {
  return {
    type: DELETE_USER.FAILURE,
    payload
  }
};

export const deleteUser = (userId, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch({
        type: DELETE_USER.REQUEST
      });
      return fetch(`${base_url}/v1/users/${userId}/`, {
        method: 'delete',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`
        }
      })
      .then(checkHttpStatus)
      .then(response => {
          dispatch(deleteUserSuccess(userId));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(deleteUserFailure(error));
      })
    });
  }
};

// --------------- reload user ----------------------

export const reloadUserSuccess = (payload) => {
  return {
    type: GET_USER.SUCCESS,
    payload: payload
  }
};

export const reloadUserFailure = (payload) => {
  return {
    type: GET_USER.FAILURE,
    payload
  }
};

export const reloadUser = (userId, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch({
        type: GET_USER.REQUEST
      });
      return fetch(`${base_url}/v1/users/${userId}/`, {
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`
        }
      })
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(reloadUserSuccess(response));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(reloadUserFailure(error));
      })
    });
  }
};

// ------------------------------------------------------

export const getRecord = (state, id) => {
  let res = state.data.filter((item) => (item.id == id));
  if (res.length > 0){
    return res[0];
  }else{
    return null;
  }
};


export const actions = {
  createUser,
  createUserSuccess,
  createUserFailure,
  updateUserSuccess,
  updateUserFailure,
  deleteUser,
  deleteUserSuccess,
  deleteUserFailure,
  updateUser,
  reloadUser
};

// ------------------------------------
// Action Handlers
// ------------------------------------

const USER_ACTION_HANDLERS = {

  [CREATE_USER.INIT]: (state, action) => (initialRecord),
  [CREATE_USER.REQUEST]: (state, action) => ({...state, form: {...action.payload}, errors: {}}),
  [CREATE_USER.SUCCESS]: (state, action) => (initialRecord),
  [CREATE_USER.FAILURE]: (state, action) => ({...state, errors: action.errors}),

  [GET_USER.REQUEST]: (state, action) => (initialRecord),
  [GET_USER.SUCCESS]: (state, action) => ({...state, form: action.payload}),

  [UPDATE_USER.REQUEST]: (state, action) => ({...state, form: {...action.payload}, errors: {}}),
  [UPDATE_USER.SUCCESS]: (state, action) => (initialRecord),
  [UPDATE_USER.FAILURE]: (state, action) => ({...state, errors: action.errors})
};

const ACTION_HANDLERS = {
  [CREATE_USER.INIT]: (state, action) => ({...state, user: userReducer(state.user, action)}),
  [CREATE_USER.REQUEST]: (state, action) => ({...state, isFetching: true, user: userReducer(state.user, action)}),
  [CREATE_USER.SUCCESS]: (state, action) => ({...state, data: [action.payload, ...state.data], isFetching: false, user: userReducer(state.user, action)}),
  [CREATE_USER.FAILURE]: (state, action) => ({...state, isFetching: false, user: userReducer(state.user, action)}),

  [UPDATE_USER.REQUEST]: (state, action) => ({...state, isFetching: true, user: userReducer(state.user, action)}),
  [UPDATE_USER.SUCCESS]: (state, action) => ({...state, data: state.data.map((item) => (item.id == action.payload.id ? action.payload : item)), isFetching: false, user: userReducer(state.user, action)}),
  [UPDATE_USER.FAILURE]: (state, action) => ({...state, isFetching: false, user: userReducer(state.user, action)}),

  [DELETE_USER.REQUEST]: (state, action) => ({...state, isFetching: true}),
  [DELETE_USER.SUCCESS]: (state, action) => ({...state, data: state.data.filter((item) => item.id != action.payload), isFetching: false}),
  [DELETE_USER.FAILURE]: (state, action) => ({...state, isFetching: false}),

  [GET_USER.REQUEST]: (state, action) => ({...state, user: userReducer(state.user, action)}),
  [GET_USER.SUCCESS]: (state, action) => ({...state, data: updateOrAppend(state.data, action.payload), user: userReducer(state.user, action)}),

  [GET_USERS.REQUEST]: (state, action) => ({...state, isFetching: true}),
  [GET_USERS.SUCCESS]: (state, action) => ({
    ...state,
    data: uniqBy([...state.data, ...action.data], (item) => item.id),
    has_next: action.has_next,
    page: Math.max(state.page, action.page),
    isFetching: false
  }),
  [GET_USERS.FAILURE]: (state, action) => ({...state, isFetching: false}),

  [FILTER.UPDATED]: (state, action) => ({...state, data: [], query: action.query, page: 1}),
  [FILTER.CLEARED]: (state, action) => ({...state, data: [], query: {}, page: 1}),

  ["LOGOUT_USER"]: (state, action) => ({...initialState})
};

// ------------------------------------
// Reducer
// ------------------------------------


const initialRecord = {
  form: {
    id: null,
    name: "",
    username: '',
    is_superuser: false,
    is_manager: false,
    is_staff: false,
    email: ''
  },
  errors: {}
};

const initialState = {
  data: [],
  total: null,
  user: initialRecord,
  query: {},
  page: 1,
  has_next: true,
  isFetching: false
};

export function userReducer (state = initialRecord, action) {
  const handler = USER_ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state
}

export default function reducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state
}

