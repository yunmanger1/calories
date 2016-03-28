import React, { PropTypes } from 'react'
import '../../styles/core.scss'

import AppBar from 'material-ui/lib/app-bar'
import IconButton from 'material-ui/lib/icon-button'
import NavigationMenu from 'material-ui/lib/svg-icons/navigation/menu'
import NavigationClose from 'material-ui/lib/svg-icons/navigation/close'
import ArchiveIcon from 'material-ui/lib/svg-icons/content/archive'
import SettingsIcon from 'material-ui/lib/svg-icons/action/settings'
import AccountIcon from 'material-ui/lib/svg-icons/action/account-box'
import StatsIcon from 'material-ui/lib/svg-icons/editor/insert-chart'
import ExitIcon from 'material-ui/lib/svg-icons/action/exit-to-app'
import LeftNav from 'material-ui/lib/left-nav'
import MenuItem from 'material-ui/lib/menus/menu-item'
import Menu from 'material-ui/lib/menus/menu'

import { push } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { logoutAndRedirect } from '../../redux/modules/auth'

const styles = {
  title: {
    cursor: 'pointer'
  }
};

class CoreLayout extends React.Component {

  componentWillMount () {
    this.state = {open: false};
  }

  handleToggle () {
    this.setState({open: !this.state.open});
  }

  render () {
    let {push, user} = this.props;
    return (<div>
      <LeftNav className='menu' open={this.state.open}>
        <IconButton style={{position: 'absolute'}} onTouchTap={this.handleToggle.bind(this)}><NavigationClose /></IconButton>
        <center>
          <h1>@{user.username}</h1>
          <h3>{user.name}</h3>
        </center>
        <Menu onClick={this.handleToggle.bind(this)}>
          {user.is_manager ? '': (<MenuItem leftIcon={<ArchiveIcon />} onTouchTap={() => push('/records')}>Records</MenuItem>)}
          {user.is_staff ? (<MenuItem leftIcon={<AccountIcon />} onTouchTap={() => push('/users')}>Users</MenuItem>): ''}
          {user.is_staff ? '': (<MenuItem leftIcon={<StatsIcon />} onTouchTap={() => push('/stats')}>Statistics</MenuItem>)}
          {user.is_staff ? '': (<MenuItem leftIcon={<SettingsIcon />} onTouchTap={() => push('/settings')}>Settings</MenuItem>)}
          <MenuItem leftIcon={<ExitIcon />}  onClick={this.props.logoutAndRedirect}>Logout</MenuItem>
        </Menu>
      </LeftNav>
      <AppBar
        title={<span style={styles.title}>{this.props.title}</span>}
        onTitleTouchTap={this.handleToggle.bind(this)}
        iconElementLeft={<IconButton onTouchTap={this.handleToggle.bind(this)}><NavigationMenu /></IconButton>}
        iconElementRight={this.props.iconElementRight}
      />
      {this.props.children}
    </div>);
  }

}

CoreLayout.propTypes = {
  auth: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
  children: PropTypes.element,
  iconElementRight: PropTypes.element,
  title: PropTypes.string.isRequired
};

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    user: state.auth.user
  };
};
export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  logoutAndRedirect
}, dispatch))(CoreLayout)
