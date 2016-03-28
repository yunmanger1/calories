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
const CREATE_RECORD = Enum("CREATE_RECORD", "REQUEST", "SUCCESS", "FAILURE", "INIT");
const LOAD_RECORDS = Enum("LOAD_RECORDS", "REQUEST", "SUCCESS", "FAILURE");
const FILTER = Enum("FILTER", "UPDATED", "CLEARED");
const DELETE_RECORD = Enum("DELETE_RECORD", "REQUEST", "SUCCESS", "FAILURE");
const UPDATE_RECORD = Enum("UPDATE_RECORD", "REQUEST", "SUCCESS", "FAILURE");
const GET_RECORD = Enum("GET_RECORD", "REQUEST", "SUCCESS", "FAILURE");


// ------------------------------------
// Actions
// ------------------------------------

// ---------------------- new record -----------------------

export const createRecordRequest = (payload) => {
  return {
    type: CREATE_RECORD.REQUEST,
    payload
  }
};

export const clearForm = () => {
  return {
    type: CREATE_RECORD.INIT
  }
};

export const createRecordSuccess = (payload) => {
  return {
    type: CREATE_RECORD.SUCCESS,
    payload: payload
  }
};

export const createRecordFailure = (errors) => {
  return {
    type: CREATE_RECORD.FAILURE,
    errors
  }
};

export const createRecord = (fields, token = null, redirect = '/records') => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch(createRecordRequest(fields));
      return fetch(`${base_url}/v1/records/`, {
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
          dispatch(createRecordSuccess(response));
          dispatch(push(redirect));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(createRecordFailure(error));
      })
    });
  }
};

// --------------- filter records --------------------

export const filterRecords = (query) => {
  return (dispatch: Function, getState: Function) => {
    dispatch({
      type: FILTER.UPDATED,
      query
    });
    dispatch(loadRecords())
  }
};

// --------------- load records ----------------------

export const loadRecordsSuccess = (response, page) => {
  return {
    type: LOAD_RECORDS.SUCCESS,
    data: response.results,
    count: response.count,
    has_next: (response.next ? true : false),
    page: (response.next ? page + 1 : page)
  }
};

export const loadRecordsFailure = (payload) => {
  return {
    type: LOAD_RECORDS.FAILURE,
    payload
  }
};

export const loadRecords = (page = null, query = null, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch({
        type: LOAD_RECORDS.REQUEST
      });
      let state = getState().records;
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
      return fetch(`${base_url}/v1/records/?page=${page}&${queryString.stringify(q)}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`
        }
      })
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(loadRecordsSuccess(response, page));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(loadRecordsFailure(error));
      })
    }, error => dispatch(authFailed(error)));
  }
};


// --------------- update record ----------------------

export const updateRecordRequest = (payload) => {
  return {
    type: UPDATE_RECORD.REQUEST,
    payload
  }
};

export const updateRecordSuccess = (payload) => {
  return {
    type: UPDATE_RECORD.SUCCESS,
    payload: payload
  }
};

export const updateRecordFailure = (errors) => {
  return {
    type: UPDATE_RECORD.FAILURE,
    errors
  }
};

export const updateRecord = (id, fields, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch(updateRecordRequest({id, ...fields}))
      return fetch(`${base_url}/v1/records/${id}/`, {
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
          dispatch(updateRecordSuccess(response));
          dispatch(push("/records"))
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(updateRecordFailure(error.data));
      })
    });
  }
};


// --------------- delete record ----------------------

export const deleteRecordSuccess = (payload) => {
  return {
    type: DELETE_RECORD.SUCCESS,
    payload: payload
  }
};

export const deleteRecordFailure = (payload) => {
  return {
    type: DELETE_RECORD.FAILURE,
    payload
  }
};

export const deleteRecord = (recordId, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch({
        type: DELETE_RECORD.REQUEST
      });
      return fetch(`${base_url}/v1/records/${recordId}/`, {
        method: 'delete',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`
        }
      })
      .then(checkHttpStatus)
      .then(response => {
          dispatch(deleteRecordSuccess(recordId));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(deleteRecordFailure(error));
      })
    });
  }
};

// --------------- reload record ----------------------

export const reloadRecordSuccess = (payload) => {
  return {
    type: GET_RECORD.SUCCESS,
    payload: payload
  }
};

export const reloadRecordFailure = (payload) => {
  return {
    type: GET_RECORD.FAILURE,
    payload
  }
};

export const reloadRecord = (recordId, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch({
        type: GET_RECORD.REQUEST
      })
      return fetch(`${base_url}/v1/records/${recordId}/`, {
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
          dispatch(reloadRecordSuccess(response));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(reloadRecordFailure(error));
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
  createRecord,
  createRecordSuccess,
  createRecordFailure,
  updateRecord,
  updateRecordSuccess,
  updateRecordFailure,
  deleteRecord,
  deleteRecordSuccess,
  deleteRecordFailure,
  reloadRecord
};

// ------------------------------------
// Action Handlers
// ------------------------------------

const RECORD_ACTION_HANDLERS = {

  [CREATE_RECORD.INIT]: (state, action) => (initialRecord),
  [CREATE_RECORD.REQUEST]: (state, action) => ({...state, form: {...action.payload}, errors: {}}),
  [CREATE_RECORD.SUCCESS]: (state, action) => (initialRecord),
  [CREATE_RECORD.FAILURE]: (state, action) => ({...state, errors: action.errors}),

  [GET_RECORD.REQUEST]: (state, action) => (initialRecord),
  [GET_RECORD.SUCCESS]: (state, action) => ({...state, form: action.payload}),

  [UPDATE_RECORD.REQUEST]: (state, action) => ({...state, form: {...action.payload}, errors: {}}),
  [UPDATE_RECORD.SUCCESS]: (state, action) => (initialRecord),
  [UPDATE_RECORD.FAILURE]: (state, action) => ({...state, errors: action.errors})
};

const ACTION_HANDLERS = {
  [CREATE_RECORD.INIT]: (state, action) => ({...state, record: recordReducer(state.record, action)}),
  [CREATE_RECORD.REQUEST]: (state, action) => ({...state, isFetching: true, record: recordReducer(state.record, action)}),
  [CREATE_RECORD.SUCCESS]: (state, action) => ({...state, data: [action.payload, ...state.data], isFetching: false, record: recordReducer(state.record, action)}),
  [CREATE_RECORD.FAILURE]: (state, action) => ({...state, isFetching: false, record: recordReducer(state.record, action)}),

  [UPDATE_RECORD.REQUEST]: (state, action) => ({...state, isFetching: true, record: recordReducer(state.record, action)}),
  [UPDATE_RECORD.SUCCESS]: (state, action) => ({...state, data: state.data.map((item) => (item.id == action.payload.id ? action.payload : item)), isFetching: false, record: recordReducer(state.record, action)}),
  [UPDATE_RECORD.FAILURE]: (state, action) => ({...state, isFetching: false, record: recordReducer(state.record, action)}),

  [DELETE_RECORD.REQUEST]: (state, action) => ({...state, isFetching: true}),
  [DELETE_RECORD.SUCCESS]: (state, action) => ({...state, data: state.data.filter((item) => item.id != action.payload), isFetching: false}),
  [DELETE_RECORD.FAILURE]: (state, action) => ({...state, isFetching: false}),

  [GET_RECORD.REQUEST]: (state, action) => ({...state, record: recordReducer(state.record, action)}),
  [GET_RECORD.SUCCESS]: (state, action) => ({...state, data: updateOrAppend(state.data, action.payload), record: recordReducer(state.record, action)}),

  [LOAD_RECORDS.REQUEST]: (state, action) => ({...state, isFetching: true}),
  [LOAD_RECORDS.SUCCESS]: (state, action) => ({
    ...state,
    data: uniqBy([...state.data, ...action.data], (item) => item.id),
    has_next: action.has_next,
    page: Math.max(state.page, action.page),
    isFetching: false
  }),
  [LOAD_RECORDS.FAILURE]: (state, action) => ({...state, isFetching: false}),

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
    user: null,
    title: null,
    calories: null,
    time: null
  },
  errors: {}
};

const initialState = {
  data: [],
  total: null,
  record: initialRecord,
  query: {},
  page: 1,
  has_next: true,
  isFetching: false
};

export function recordReducer (state = initialRecord, action) {
  const handler = RECORD_ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state
}

export default function reducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state
}

