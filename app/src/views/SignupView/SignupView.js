import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'

import { userSignup } from '../../redux/modules/auth'

import styles from '../../styles/form.css'

import RaisedButton from 'material-ui/lib/raised-button'

import FormsyText from 'formsy-material-ui/lib/FormsyText'
import Formsy from 'formsy-react'


class SignupView extends React.Component {

  handleSignup(model){
    this.props.userSignup(
      model.username,
      model.email,
      model.password,
      "/records"
     )
  }

  static transformErrors (errors) {
    return {
      username: errors.username && errors.username.join(", ") || null,
      password: errors.password1 && errors.password1.join(", ") || null,
      email: errors.email && errors.email.join(", ") || null
    }
  }

  componentDidUpdate(){
    let {auth: {signup}} = this.props;
    this.refs.form.updateInputsWithError(SignupView.transformErrors(signup.errors))
  }

  render() {
    let {push, auth: {signup}} = this.props;
    return (
      <div className='form-wrapper'>
      <div className='form'>
        <h1>Calories App</h1>
        <Formsy.Form
          className={styles.bottom_space}
          ref="form"
          onValidSubmit={this.handleSignup.bind(this)}
          preventExternalErrorValidation
        >
          <div className={styles.bottom_space}>
          <div>
          <FormsyText
            required
            name="username"
            value={signup.form.username}
            floatingLabelText="Login"
          />
          </div>
          <div>
          <FormsyText
            required
            name="email"
            value={signup.form.email}
            floatingLabelText="Email"
          />
          </div>
          <div>
          <FormsyText
            required
            value={signup.form.password1}
            name="password"
            floatingLabelText="Password"
            type="password"
          />
          </div>
          </div>
          <RaisedButton label="Signup" type="submit" primary={true}/>
        </Formsy.Form>
        <div className={styles.top_space}>
          <div className={styles.bottom_space}>If you have an account then Login here</div>
          <RaisedButton label="Login" secondary={true} onClick={() => push("/login")} />
        </div>
     </div>
     </div>
    )
  }
}

SignupView.propTypes = {
    auth: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    userSignup: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  userSignup
}, dispatch))(SignupView)
