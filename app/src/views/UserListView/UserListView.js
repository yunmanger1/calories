import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'
import {isStaff} from '../../utils'
import { deleteUser, loadUsers, filterUsers } from '../../redux/modules/users'

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

import FormsyText from 'formsy-material-ui/lib/FormsyText'
import FormsyToggle from 'formsy-material-ui/lib/FormsyToggle'
import Formsy from 'formsy-react'

import CoreLayout from '../../layouts/CoreLayout'
import moment from 'moment'


class UserFilter extends React.Component {

  componentWillMount(){
    this.model = {};
  }

  updateModel(chunk){
    this.model = {...this.model, ...chunk};
    if (!this.model.is_manager){
      delete this.model.is_manager;
    }
  }

  render(){
    let {is_superuser, query} = this.props;
    return (
      <Formsy.Form
        ref="form"
      >
      <FormsyText
         name='search'
         value={query.search}
         onChange={(e) => this.updateModel({search: e.target.value})}
         hintText="username, name, email"
         label="Search"
         floatingLabelText="Search"
      />
      {(is_superuser ? (<FormsyToggle
         name='is_manager'
         ref="is_manager"
         defaultToggled={query.is_manager}
         onChange={(e) => this.updateModel({is_manager: !this.refs.is_manager.getValue()})}
         label="Is manager"
       />) : '')
       }
      </Formsy.Form>
    );
  }

}

UserFilter.propTypes = {
    query: PropTypes.object.isRequired,
    is_superuser: PropTypes.bool.isRequired
};

class UserListView extends React.Component {

  componentWillMount() {
    this.props.loadUsers();
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
    this.props.filterUsers(this.refs.filter.model);
  };

  handleClear = () => {
    this.setState({open: false});
    this.props.filterUsers({});
  };

  render() {
    let {users, deleteUser, loadUsers, push, user, query} = this.props;
    let is_superuser = user.is_superuser;
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
      <CoreLayout title="Users" iconElementRight={
          <IconButton tooltip="Filter" onTouchTap={this.handleOpenDialog.bind(this)} touch={true} tooltipPosition="bottom-left">
            <ActionFilter/>
          </IconButton>
         }>
      <div className="user-list">
        <div className="float_btn">
          <FloatingActionButton onClick={() => push("/users/new")}>
            <ContentAdd />
          </FloatingActionButton>
        </div>
      {(users.isFetching ? (<CircularProgress style={{position: 'absolute', left: 'auto', top: 'auto', bottom: 30, right: 30, zIndex: 1000}} />) : '')}
      <List>
      {users.data.map((item) => (
        <ListItem
          onTouchTap={()=> push(`/users/${item.id}`)}
          primaryText={`@${item.username}${(item.is_superuser ? ' (admin)' : (item.is_manager ? ' (manager)' : ''))}`}
          secondaryText={item.name}
          key={item.id}
          rightIconButton={
            <IconButton onTouchTap={() => deleteUser(item.id)}>
              <DeleteIcon/>
             </IconButton>
            } />))}
        {users.has_next ? (<FlatButton label="Load more" onClick={() => loadUsers()}/>) : ''}
      </List>
      <Dialog
          title="Filter users"
          actions={actions}
          modal={true}
          open={this.state.open}
        >
          <UserFilter ref="filter" is_superuser={is_superuser} query={query}/>
       </Dialog>
      </div>
      </CoreLayout>
    )
  }
}

UserListView.propTypes = {
    users: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    loadUsers: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
  users: state.users,
  query: state.users.query,
  auth: state.auth,
  user: state.auth.user
});
export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  deleteUser,
  loadUsers,
  filterUsers
}, dispatch))(UserListView)
