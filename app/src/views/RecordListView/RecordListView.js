import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'
import styles from '../../styles/records.css'
import {isStaff} from '../../utils'
import { deleteRecord, loadRecords, filterRecords } from '../../redux/modules/records'

import List from 'material-ui/lib/lists/list'
import ListItem from 'material-ui/lib/lists/list-item'
import IconButton from 'material-ui/lib/icon-button'
import DeleteIcon from 'material-ui/lib/svg-icons/action/delete'
import FlatButton from 'material-ui/lib/flat-button'
import CircularProgress from 'material-ui/lib/circular-progress';

import ActionFilter from 'material-ui/lib/svg-icons/content/filter-list'
import FloatingActionButton from 'material-ui/lib/floating-action-button'
import ContentAdd from 'material-ui/lib/svg-icons/content/add'
import Dialog from 'material-ui/lib/dialog'

import FormsyDate from 'formsy-material-ui/lib/FormsyDate'
import FormsyText from 'formsy-material-ui/lib/FormsyText'
import Formsy from 'formsy-react'

import CoreLayout from '../../layouts/CoreLayout'
import moment from 'moment'


class RecordsFilter extends React.Component {

  componentWillMount(){
    this.model = {};
  }

  updateModel(chunk){
    this.model = {...this.model, ...chunk};
  }

  render(){
    let {is_staff, query} = this.props;
    return (
      <Formsy.Form
        ref="form"
      >
      {(is_staff ? (<FormsyText
         name='user'
         ref='user_input'
         value={query.user}
         onChange={(e) => this.updateModel({user: e.target.value})}
         hintText="Username of record author"
         floatingLabelText="Record author"
       />) : '')
       }
      <FormsyDate
        name="from_date"
        hintText='From date'
        autoOk={true}
        value={query.from_date}
        onChange={(err, value) => this.updateModel({from_date: value})}/>
      <FormsyDate
        name="to_date"
        hintText='To date'
        autoOk={true}
        value={query.to_date}
        onChange={(err, value) => this.updateModel({to_date: value})}/>
      </Formsy.Form>
    );
  }

}

RecordsFilter.propTypes = {
    query: PropTypes.object.isRequired,
    is_staff: PropTypes.bool.isRequired
};

class RecordListView extends React.Component {

  componentWillMount() {
    this.props.loadRecords();
    this.state = {open: false};
  }

  handleOpenDialog = () => {
    this.setState({open: true});
  };

  handleCloseDialog = () => {
    this.setState({open: false});
  };

  handleFilter = () => {
    this.setState({open: false});
    this.props.filterRecords(this.refs.filter.model);
  };

  handleClear = () => {
    this.setState({open: false});
    this.props.filterRecords({});
  };

  render() {
    let {records, deleteRecord, loadRecords, push, user, query, caloriesToday} = this.props;
    let status = '';
    let is_staff = isStaff(user);
    if (!is_staff) {
      let limit = user.daily_calories;
      status = (
        <div className={styles.todayStatus} style={{backgroundColor: (caloriesToday < limit ? '#A7E0A5': '#FA7470')}}>
          {`${caloriesToday} out of ${limit} for today`}
        </div>
      )
    }
    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this.handleCloseDialog}
      />,
      <FlatButton
        label="Clear"
        secondary={true}
        onTouchTap={this.handleClear}
      />,
      <FlatButton
        label="Filter"
        primary={true}
        onTouchTap={this.handleFilter}
      />
    ];
    return (
      <CoreLayout title="Records" iconElementRight={
          <IconButton tooltip="Filter" onTouchTap={this.handleOpenDialog.bind(this)} touch={true} tooltipPosition="bottom-left">
            <ActionFilter/>
          </IconButton>
         }>
      <div className="record-list">
        <div className="float_btn">
          <FloatingActionButton onClick={() => push("/records/new")}>
            <ContentAdd />
          </FloatingActionButton>
        </div>
      {status}
      {(records.isFetching ? (<CircularProgress style={{position: 'absolute', left: 'auto', top: 'auto', bottom: 30, right: 30, zIndex: 1000}} />) : '')}
      <List>
      {records.data.map((item) => (
        <ListItem
          onTouchTap={()=> push(`/records/${item.id}`)}
          primaryText={`${item.title} - ${item.calories}`}
          secondaryText={(is_staff ? `${item.user} - ${moment(item.time).fromNow()}` : moment(item.time).fromNow())}
          key={item.id}
          rightIconButton={
            <IconButton onTouchTap={() => deleteRecord(item.id)}>
              <DeleteIcon/>
             </IconButton>
            } />))}
      </List>
      {records.has_next ? (<center><FlatButton label="Load more" onClick={() => loadRecords()}/></center>) : ''}
      <Dialog
          title="Filter records"
          actions={actions}
          modal={true}
          open={this.state.open}
        >
          <RecordsFilter ref="filter" is_staff={is_staff} query={query}/>
       </Dialog>
      </div>
      </CoreLayout>
    )
  }
}

RecordListView.propTypes = {
    records: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    loadRecords: PropTypes.func.isRequired
};

const countCalories = (items) => {
  let day_start = moment().startOf('day');
  return items.filter((item) => {
    let d = moment(item.time).diff(day_start, 'hours');
    return (d >= 0 && d < 24);
  }).map((item) => item.calories).reduce((a, b) => (a + b), 0);
};

const mapStateToProps = (state) => ({
  records: state.records,
  query: state.records.query,
  auth: state.auth,
  user: state.auth.user,
  caloriesToday: (isStaff(state.auth.user) ? 0 : countCalories(state.records.data))
});
export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  deleteRecord,
  loadRecords,
  filterRecords
}, dispatch))(RecordListView)
