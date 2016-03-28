import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'

import { updateUser } from '../../redux/modules/auth'

import IconButton from 'material-ui/lib/icon-button'
import FlatButton from 'material-ui/lib/flat-button'
import TextField from 'material-ui/lib/text-field'

import FormsyText from 'formsy-material-ui/lib/FormsyText'
import Formsy from 'formsy-react'

import CoreLayout from '../../layouts/CoreLayout'



class SettingsView extends React.Component {

  handleSave() {
    let {updateUser, auth} = this.props;
    updateUser(
      auth.user.id,
      this.refs.name_input.getValue(),
      this.refs.calories_input.getValue())
  }

  render() {
    let {user} = this.props.auth;
    return (
      <CoreLayout title='Settings' iconElementRight={<FlatButton onClick={this.handleSave.bind(this)} label='Save'/>}>
      <div className='form-wrapper'>
      <div className='form record-form'>
      <Formsy.Form
        ref="form"
      >
      <FormsyText
         name='name'
         ref='name_input'
         required
         value={user.name}
         hintText="What did your name?"
         floatingLabelText="Name"
       />
      <FormsyText
         name='calories'
         ref='calories_input'
         required
         value={'' + user.daily_calories}
         type="number"
         hintText="What is your daily intake?"
         floatingLabelText="Daily calories"
       />
      </Formsy.Form>
      </div>
      </div>
      </CoreLayout>
    )
  }
}

SettingsView.propTypes = {
    auth: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth
});
export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  updateUser
}, dispatch))(SettingsView)
