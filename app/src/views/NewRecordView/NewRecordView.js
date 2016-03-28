import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'

import { reloadRecord, createRecord, getRecord, updateRecord, clearForm } from '../../redux/modules/records'
import {isStaff} from '../../utils'

import IconButton from 'material-ui/lib/icon-button'
import FlatButton from 'material-ui/lib/flat-button'
import DatePicker from 'material-ui/lib/date-picker/date-picker'
import TimePicker from 'material-ui/lib/time-picker/time-picker'
import TextField from 'material-ui/lib/text-field'

import FormsyDate from 'formsy-material-ui/lib/FormsyDate'
import FormsyTime from 'formsy-material-ui/lib/FormsyTime'
import FormsyText from 'formsy-material-ui/lib/FormsyText'
import Formsy from 'formsy-react'

import CoreLayout from '../../layouts/CoreLayout'
import CircularProgress from 'material-ui/lib/circular-progress';


class NewRecordView extends React.Component {

  componentWillMount(){
    let props = this.props;
    let {form} = props;

    if(props.params.id){
      props.reloadRecord(props.params.id)
    }

    this.state = {
      isValid: false,
      time: (form.time ? new Date(form.time) : new Date())
    };

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
    let {createRecord, updateRecord, form, user} = this.props;
    let model = {
      title: this.refs.title_input.getValue(),
      calories: this.refs.calories_input.getValue(),
      time: this.state.time
    };
    if (isStaff(user)) {
      model.user = this.refs.user_input.getValue()
    }
    if (form.id){
      updateRecord(form.id, model)
    } else {
      createRecord(model)
    }

  }

  render() {
    let {form, user} = this.props;
    let is_staff = isStaff(user);
    let loading = (this.props.params.id && !form.time);
    return (
      <CoreLayout title={form.id ? 'Edit record' : 'New Record'} iconElementRight={<FlatButton onClick={this.handleSave.bind(this)} label='Save'/>}>
      {(loading ? (<center><CircularProgress /></center>) : (
      <div className='form-wrapper'>
      <div className='form record-form'>
      <Formsy.Form
        ref="form"
//        onValid={() => this.setState({isValid: true})}
//        onInvalid={() => this.setState({isValid: false})}
      >
      {(is_staff ? (<FormsyText
         name='user'
         ref='user_input'
         required
         value={form.user}
         hintText="Username of record author"
         floatingLabelText="Record author"
       />) : '')
       }
      <FormsyText
         name='title'
         ref='title_input'
         required
         value={form.title}
         hintText="What did you eat?"
         floatingLabelText="Meal title"
       />
      <FormsyText
         name='calories'
         ref='calories_input'
         required
         value={'' + form.calories}
         type="number"
         hintText="How many calories?"
         floatingLabelText="Calories"
       />
      <FormsyDate
        label="Hello"
        name="date"
        hintText='Date'
        autoOk={true}
        value={form.time ? new Date(form.time): new Date()}
        onChange={(err, value) => this.setState({time: value})}/>
      <FormsyTime
        format='24hr'
        name="time"
        hintText='Time'
        autoOk={true}
        defaultTime={form.time ? new Date(form.time): new Date()}
        onChange={(err, value) => this.setState({time: value})}/>
      </Formsy.Form>
      </div></div>))}
      </CoreLayout>
    )
  }
}

NewRecordView.propTypes = {
    records: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    createRecord: PropTypes.func.isRequired,
    reloadRecord: PropTypes.func.isRequired,
    updateRecord: PropTypes.func.isRequired,
    clearForm: PropTypes.func.isRequired
};

const mapStateToProps = (state, props) => ({
  records: state.records,
  user: state.auth.user,
  form: state.records.record.form,
  errors: state.records.record.errors
});
export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  reloadRecord,
  createRecord,
  updateRecord,
  clearForm
}, dispatch))(NewRecordView)
