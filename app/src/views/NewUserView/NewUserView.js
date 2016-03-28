import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'

import { reloadUser, createUser, updateUser, clearForm } from '../../redux/modules/users'

import FlatButton from 'material-ui/lib/flat-button'

import FormsyText from 'formsy-material-ui/lib/FormsyText'
import FormsyToggle from 'formsy-material-ui/lib/FormsyToggle'
import Formsy from 'formsy-react'

import CoreLayout from '../../layouts/CoreLayout/CoreLayout'
import CircularProgress from 'material-ui/lib/circular-progress';


class NewUserView extends React.Component {

  componentWillMount(){
    let props = this.props;

    if(props.params.id){
      props.reloadUser(props.params.id)
    }
  }

  componentWillUnmount() {
    this.props.clearForm()
  }

  componentDidUpdate(){
    if (this.refs.form){
      let {errors} = this.props;
      this.refs.form.updateInputsWithError(errors)
    }
  }


  handleSave() {
    let {createUser, updateUser, form, user} = this.props;
    let model = {
      username: this.refs.username_input.getValue(),
      email: this.refs.email_input.getValue()
    };
    if (this.refs.name_input.getValue()){
      model.name = this.refs.name_input.getValue();
    }
    if (this.refs.password_input.getValue()){
      model.password = this.refs.password_input.getValue();
    }
    if (user.is_superuser) {
      model.is_manager = this.refs.is_manager_input.getValue()
    }
    if (form.id) {
      updateUser(form.id, model)
    } else {
      createUser(model)
    }

  }

  render() {
    let {form, user} = this.props;
    let is_superuser = user.is_superuser;
    let loading = (this.props.params.id && !form.username);
    console.log(form);
    return (
      <CoreLayout title={form.id ? 'Edit user' : 'New user'} iconElementRight={<FlatButton onClick={this.handleSave.bind(this)} label='Save'/>}>
      {(loading ? (<center><CircularProgress /></center>) : (
      <div className='form user-form'>
      <Formsy.Form
        ref="form"
      >
      <FormsyText
         name='username'
         ref='username_input'
         required
         value={form.username}
         floatingLabelText="username"
      />
      <FormsyText
         name='name'
         ref='name_input'
         value={form.name}
         floatingLabelText="full name"
      />
      <FormsyText
        name='email'
        ref='email_input'
        required
        value={form.email}
        floatingLabelText="Email"
      />
      <FormsyText
         name='password'
         type='password'
         ref='password_input'
         floatingLabelText="Password"
      />
      {(is_superuser ? (<FormsyToggle
         name='is_manager'
         ref='is_manager_input'
         required
         defaultToggled={form.is_manager}
         label="Is this user a manager?"
       />) : '')
       }
      </Formsy.Form>
      </div>))}
      </CoreLayout>
    )
  }
}

NewUserView.propTypes = {
    users: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    createUser: PropTypes.func.isRequired,
    reloadUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    clearForm: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
  users: state.users,
  user: state.auth.user,
  form: state.users.user.form,
  errors: state.users.user.errors
});

export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  reloadUser,
  createUser,
  updateUser,
  clearForm
}, dispatch))(NewUserView)
