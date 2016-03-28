import React, {PropTypes} from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'

import { getStats } from '../../redux/modules/stats'

import IconButton from 'material-ui/lib/icon-button'
import FlatButton from 'material-ui/lib/flat-button'
import RaisedButton from 'material-ui/lib/raised-button'
import TextField from 'material-ui/lib/text-field'

import FormsyText from 'formsy-material-ui/lib/FormsyText'
import Formsy from 'formsy-react'
import FormsyDate from 'formsy-material-ui/lib/FormsyDate'
import FormsyTime from 'formsy-material-ui/lib/FormsyTime'
import moment from 'moment-timezone'

import CoreLayout from '../../layouts/CoreLayout'

import '../../styles/stats.scss'


class StatsView extends React.Component {

  componentWillMount() {
    this.state = {
      isValid: false
    };
  }

  render() {
    let {getStats, stats} = this.props;
    return (
      <CoreLayout title='Statistics'>
      <div className='stats-wrapper'>
      <div className='stats-form'>
      <Formsy.Form
        style={{backgroundColor: '#eee', padding: '10px 10px 20px 10px'}}
        ref="form"
//        onValid={() => this.setState({isValid: true})}
//        onInvalid={() => this.setState({isValid: false})}
        onSubmit={(model) => getStats({...model, timezone: moment.tz.guess()})}
      >
        <div style={{marginBottom: '15px'}}>
        <FormsyDate
          name="from_date"
          hintText='From date'
          autoOk={true}
          value={stats.query.from_date}
  //        onChange={(err, value) => this.setState({time: value})}
        />
        <FormsyDate
          name="to_date"
          hintText='To date'
          autoOk={true}
          value={stats.query.to_date}
  //        onChange={(err, value) => this.setState({time: value})}
        />
        <FormsyText
           name='from_time'
           required
           value={stats.query.from_time}
           floatingLabelText="From time"
         /><br/>
        <FormsyText
           name='to_time'
           required
           value={stats.query.to_time}
           floatingLabelText="To time"
        />
      </div>
      <RaisedButton
          type="submit"
          label="Go"
//          disabled={!this.state.isValid || stats.isFetching}
      />
      </Formsy.Form>
      </div>
      </div>
      <div>
        <div className='stats'>
        {stats.data.map((item) => (
            <div key={item.date} className='stat-item'>
              <span className="stat-title">{item.date}</span>
              <span style={{height: '16px', backgroundColor: '#A7E0A5', display: 'inline-block', width: `${item.calories/50}%`}}></span>
              <span className="stat-value">{item.calories}</span>
            </div>
        ))}
        </div>
      </div>

      </CoreLayout>
    )
  }
}

StatsView.propTypes = {
    stats: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    getStats: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  stats: state.stats,
});
export default connect((mapStateToProps), (dispatch) => bindActionCreators({
  push,
  getStats
}, dispatch))(StatsView)
