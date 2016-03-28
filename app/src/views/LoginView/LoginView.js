import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'

import styles from '../../styles/form.css'

import { login, tryAuthUser } from '../../redux/modules/auth'

import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'

class LoginView extends React.Component {

  componentWillMount() {
//    const redirectRoute = this.props.location.query.redirect || '/records';
//    this.props.tryAuthUser(redirectRoute)
    this.state = {
      login: '',
      password: ''
    }
  }

  handleLogin() {
    const redirectRoute = this.props.location.query.redirect || '/records';
    let {login} = this.props;
    login(
      this.state.login,
      this.state.password,
      redirectRoute)
  }

  render() {
    let {auth, push} = this.props;
    return (
      <div className='form-wrapper'>
      <div className='form'>
        <h1>Calories App</h1>
        <div className={styles.bottom_space}>
          <TextField
            floatingLabelText="Login"
            onChange={(event) => this.setState({login: event.target.value})}
          />
          <TextField
            floatingLabelText="Password"
            onChange={(event) => this.setState({password: event.target.value})}
            type="password"
          />
        </div>
        <RaisedButton disabled={auth.isAuthenticating} label="Login" primary={true} onClick={this.handleLogin.bind(this)} />
        <div className={styles.top_space}>
          <div className={styles.bottom_space}>If you have no account then create one</div>
          <RaisedButton label="Create Account" secondary={true} onClick={() => push("/signup")} />
        </div>
      </div>
      </div>
    )
  }
}

LoginView.propTypes = {
    auth: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    tryAuthUser: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  login,
  tryAuthUser
}, dispatch))(LoginView)
