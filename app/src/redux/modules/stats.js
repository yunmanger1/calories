import { checkHttpStatus, parseJSON, Enum } from '../../utils'
import { push } from 'react-router-redux'
import fetch from 'isomorphic-fetch'
import queryString from 'query-string'

import {authFailed, getToken} from './auth'
import { base_url } from './common'

export const GET_STATS = Enum("GET_STATS", "REQUEST", "SUCCESS", "FAILURE");


// ------------------ get stats ------------------------

export const getStatsSuccess = (payload) => {
  return {
    type: GET_STATS.SUCCESS,
    data: payload
  }
};

export const getStatsFailure = (payload) => {
  return {
    type: GET_STATS.FAILURE,
    payload
  }
};

export const getStats = (query, token = null) => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch({
        type: GET_STATS.REQUEST,
        query
      });
      let q = {
        ...query,
        from_date: query.from_date.toJSON(),
        to_date: query.to_date.toJSON()
      };
      return fetch(`${base_url}/v1/stats/?${queryString.stringify(q)}`, {
        method: 'get',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`
        },
        data: query
      })
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
          dispatch(getStatsSuccess(response.results));
          // dispatch(push(redirect));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          }
          dispatch(getStatsFailure(error));
      })
    });
  }
};

// ------------------ get stats ------------------------

export const actions = {
  getStats,
  getStatsFailure,
  getStatsSuccess
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [GET_STATS.REQUEST]: (state, action) => ({...state, query: action.query, data: [], isFetching: true}),
  [GET_STATS.SUCCESS]: (state, action) => ({...state, data: action.data, isFetching: false}),
  [GET_STATS.FAILURE]: (state, action) => ({...state, isFetching: false}),
  ["LOGOUT_USER"]: (state, action) => (initialState)
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  data: [],
  query: {
    from_date: new Date((new Date()).getTime() - 30 * 24 * 60 * 60 * 1000),
    to_date: new Date(),
    from_time: '11:00',
    to_time: '13:00',
    timezone: 'Asia/Almaty'
  },
  isFetching: false
};

export default function reducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state
}
