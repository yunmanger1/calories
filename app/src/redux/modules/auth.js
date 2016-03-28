import { checkHttpStatus, parseJSON, Enum} from '../../utils';
import { push, replace } from 'react-router-redux'
import jwtDecode from 'jwt-decode'
import { base_url } from './common'

/* @flow */
// ------------------------------------
// Constants
// ------------------------------------

export const LOGOUT_USER = 'LOGOUT_USER';

const LOGIN_USER = Enum("LOGIN_USER", "REQUEST", "SUCCESS", "FAILURE");
const USER_SIGNUP = Enum("USER_SIGNUP", "REQUEST", "SUCCESS", "FAILURE");

const EDIT_USER = Enum("EDIT_USER", "REQUEST", "SUCCESS", "FAILURE");

// ------------------------------------
// Actions
// ------------------------------------

// ----------------- Signup --------------------------

export const signupRequest = (form) => {
  return {
    type: USER_SIGNUP.REQUEST,
    form
  }
};

export const signupSuccess= (token, user) => {
  return (dispatch: Function, getState: Function) => {
    dispatch({
      type: USER_SIGNUP.SUCCESS,
      token,
      user
    });
    dispatch(loginUserSuccess(token, user))
  }
};

export const signupFailure = (error) => {
  return {
    type: USER_SIGNUP.FAILURE,
    error: error
  }
};

export const userSignup = (username, email, password, redirect = '/records') => {
  return (dispatch: Function, getState: Function) => {
    let form = {username: username, email: email, password1: password, password2: password};
    dispatch(signupRequest(form));
    return fetch(`${base_url}/rest-auth/registration/`, {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
    })
    .then(checkHttpStatus)
    .then(parseJSON)
    .then(response => {
        try {
            let decoded = jwtDecode(response.token);
            dispatch(signupSuccess(response.token, response.user));
            dispatch(push(redirect));
        } catch (e) {
            dispatch(signupFailure({"non_field_error": 'Invalid token'}));
        }
    })
    .catch(error => {
        if (error.data){
          dispatch(signupFailure(error.data));
        }else{
          dispatch(signupFailure({"non_field_error": "Something wrong"}));
        }

    })
  }
};


// ------------------- Login -----------------------

export const loginUserSuccess = (token, user) => {
  localStorage.setItem('auth', JSON.stringify({token, user}));
  return {
    type: LOGIN_USER.SUCCESS,
    token,
    user
  }
};

export const loginUserFailure = (payload) => {
  localStorage.removeItem('auth');
  return {
    type: LOGIN_USER.FAILURE,
    payload
  }
};

const defaultRedirect = '/records';
const defaultManagerRedirect = '/users';

export const login = (username, password, redirect = defaultRedirect) => {
  return (dispatch: Function, getState: Function) => {
    dispatch({
      type: LOGIN_USER.REQUEST,
      payload: username
    })
    return fetch(`${base_url}/api-token-auth/`, {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })
    .then(checkHttpStatus)
    .then(parseJSON)
    .then(response => {
        try {
            let decoded = jwtDecode(response.token);
            dispatch(loginUserSuccess(response.token, response.user));
            if (response.user.is_manager && redirect === defaultRedirect){
              dispatch(push(defaultManagerRedirect));
            } else {
              dispatch(push(redirect));
            }
        } catch (e) {
            dispatch(loginUserFailure({
                response: {
                    status: 403,
                    statusText: 'Invalid token'
                }
            }));
        }
    })
    .catch(error => {
        dispatch(loginUserFailure(error));
    })
  }
};

// ------------------- Authenticate -----------------------

export const tryAuthUser = (redirectAfterLogin) => {
  return (dispatch: Function, getState: Function) => {
    let stored = localStorage.getItem("auth");
    let {token, user} = stored && JSON.parse(stored) || {token: null, user: null};
    if (!token){
      dispatch(logoutAndRedirect(redirectAfterLogin));
    }

    try {
      let {exp} = jwtDecode(token);
      if ((new Date()).getTime() > exp * 1000){
        // expired
        return fetch(`${base_url}/api-token-refresh/`, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({token})
        })
        .then(checkHttpStatus)
        .then(parseJSON)
        .then(response => {
            try {
                let decoded = jwtDecode(response.token);
                dispatch(loginUserSuccess(response.token, response.user));
//                dispatch(push(redirectAfterLogin))
//                return response.token;
            } catch (e) {
                dispatch(logoutAndRedirect(redirectAfterLogin));
            }
        })
        .catch(error => {
            dispatch(logoutAndRedirect(redirectAfterLogin));
        })
      } else {
        return new Promise((resolve)=> {
          if (user){
            dispatch(loginUserSuccess(token, user));
//            dispatch(push(redirectAfterLogin))
          }
//          resolve(token);
        });
      }
    } catch (e) {
      dispatch(logoutAndRedirect(redirectAfterLogin));
    }
  }
};

export const logout = () => {
  localStorage.removeItem('auth');
  return {
    type: LOGOUT_USER
  }
};

export const logoutAndRedirect = (redirect = '/login') => {
  return (dispatch: Function, state: Function) => {
    dispatch(logout());
    dispatch(push(redirect));
  }
};

export const authFailed = (error) => {
  return (dispatch: Function, getState: Function) => {
    dispatch(loginUserFailure(error));
    dispatch(push('/login'));
  }
};

export const getToken = (dispatch, state, token = null) => {
  token = token || state.auth.token;
  let user = null;
  if (!token) {
    let stored  = JSON.parse(localStorage.getItem("auth"));
    if (stored){
      token = stored.token;
      user = stored.user;
    }
  }
  if (!token){
    return new Promise((resolve, reject)=> {
      reject("Missing token");
    });
  }
  return new Promise((resolve)=> {
    resolve(token);
  });

};

// ------------------- Update user -----------------------


export const updateUserSuccess = (user) => {
  return {
    type: EDIT_USER.SUCCESS,
    user
  }
};

export const updateUserFailure = (payload) => {
  return {
    type: EDIT_USER.FAILURE,
    payload
  }
};

export const updateUser = (id, name, daily_calories, token = null, redirect = '/records') => {
  return (dispatch: Function, getState: Function) => {
    return getToken(dispatch, getState(), token).then(token =>{
      dispatch({
        type: EDIT_USER.REQUEST
      });
      return fetch(`${base_url}/v1/users/${id}/`, {
          method: 'put',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `JWT ${token}`
          },
          body: JSON.stringify({name, daily_calories})
      })
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(updateUserSuccess(response));
        dispatch(push(redirect));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          } else {
            dispatch(updateUserFailure(error));
          }
      })
    });
  }
};

// ------------------- Get user -----------------------

export const getUser = (id, name, daily_calories, token = null, redirect = '/records') => {
  return (dispatch: Function, getState: Function) => {
    return getToken(getState(), token).then(token =>{
      dispatch({
        type: EDIT_USER.REQUEST
      })
      return fetch(`${base_url}/v1/users/${id}/`, {
          method: 'put',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `JWT ${token}`
          },
          body: JSON.stringify({name, daily_calories})
      })
      .then(checkHttpStatus)
      .then(parseJSON)
      .then(response => {
        dispatch(updateUserSuccess(response));
        dispatch(push(redirect));
      })
      .catch(error => {
          if(error.response.status === 401) {
            dispatch(authFailed(error));
          } else {
            dispatch(updateUserFailure(error));
          }
      })
    });
  }
};



export const actions = {
  login,
  loginUserSuccess,
  loginUserFailure,
  updateUser,
  updateUserFailure,
  updateUserSuccess
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const SIGNUP_HANDLERS = {
  [USER_SIGNUP.REQUEST]: (state, action) => ({...state, form: action.form}),
  [USER_SIGNUP.SUCCESS]: (state, action) => initialSignup,
  [USER_SIGNUP.FAILURE]: (state, action) => ({...state, errors: action.error})
};

const ACTION_HANDLERS = {
  [LOGIN_USER.REQUEST]: (state, action) => ({...state, isAuthenticating: true}),
  [LOGIN_USER.SUCCESS]: (state, action) => ({
    ...state,
    user: action.user,
    token: action.token,
    isAuthenticated: true,
    isAuthenticating: false}),
  [LOGIN_USER.FAILURE]: (state, action) => ({...state, isAuthenticating: false}),
  [LOGOUT_USER]: (state, action) => ({...state, user: initialUser, isAuthenticated: false}),

  [EDIT_USER.SUCCESS]: (state, action) => ({
    ...state,
    user: action.user
  }),

  [USER_SIGNUP.REQUEST]: (state, action) => ({...state, isAuthenticating: true, signup: signupReducer(state.signup, action)}),
  [USER_SIGNUP.SUCCESS]: (state, action) => ({...state, isAuthenticating: false, signup: signupReducer(state.signup, action)}),
  [USER_SIGNUP.FAILURE]: (state, action) => ({...state, isAuthenticating: false, signup: signupReducer(state.signup, action)})

};

// ------------------------------------
// Reducer
// ------------------------------------
const initialUser = {
    id: null,
    username: null,
    name: null,
    is_superuser: false,
    is_manager: false
};

const initialSignupForm = {
  username: '',
  email: '',
  password1: '',
  password2: ''
};

const initialSignup = {
  form: initialSignupForm,
  errors: {}
};

const initialState = {
  user: initialUser,
  token: null,
  signup: initialSignup,
  isAuthenticating: false,
  isAuthenticated: false
};

export function signupReducer(state = initialSignupForm, action) {
  const handler = SIGNUP_HANDLERS[action.type];

  return handler ? handler(state, action) : state
}


export default function reducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state
}
