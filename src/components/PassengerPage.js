import React from 'react'
import pureRender from "pure-render-decorator"
import Immutable from 'immutable'
import * as C from '../Constants'
import * as F from '../Functions'
import PassengerList from './PassengerList'
import PassengerEdit from './PassengerEdit'
import PassengerSelect from './PassengerSelect'
import PassengerOperator from './PassengerOperator'
import CheckInPage from './CheckInPage'
import FlightStatusManage from './FlightStatusManage'
import SeatSetting from './SeatSetting'
import ShowSeat from './ShowSeat'
import FlightStatusPanel from './FlightStatusPanel'
import UserList from './UserList'
import FlightList from './FlightList'
import LogList from './LogList'
import ShortCutHelp from './ShortCutHelp'
import CmdHelp from './CmdHelp'

@pureRender
class PassengerPage extends React.Component {

    constructor() {
        super();

        this.state = {
            cmd: ''
        }
    }

    renderOperator() {
        const pp = this.props.immutableProps.toJS()

        if (F.isShowOperator(pp.pageName)) {
            const p = {
                page: pp.page,
                pageName: pp.pageName,
                cmd: pp.cmd
            }
            const fetchPassengers = this.props.fetchPassengers
            return (
                <PassengerOperator immutableProps={Immutable.Map(p)} fetchPassengers={fetchPassengers}
                                   onCheckin={this.doCheckin.bind(this)} cancelCheckin={this.props.cancelCheckin}/>
            )
        }
    }

    /**
     * 旅客列表
     * @returns {*}
     */
    renderQuery() {
        const pp = this.props.immutableProps.toJS()
        if (pp.page == C.PAGE_QUERY) {
            const p = {
                selectList: pp.selectList,
            }
            return (
                <PassengerList immutableProps={Immutable.Map(p)} onCheckin={this.doCheckin.bind(this)}/>
            )
        }
    }

    /**
     * 选中区1
     * @returns {*}
     */
    renderSelect() {
        const pp = this.props.immutableProps.toJS()
        if (pp.selectList.length > 0 && pp.pageName == C.DEFAULT_PAGENAME) {
            const p = {
                page: pp.page,
                defaultBlock: pp.defaultBlock,
                defaultActive: pp.defaultActive,
                selectList: pp.selectList,
            }
            return (
                <PassengerSelect immutableProps={Immutable.Map(p)}/>
            )
        }
    }

    /**
     * 编辑界面
     * @returns {*}
     */
    renderEdit() {
        const pp = this.props.immutableProps.toJS()
        // const c = this.context.immutableContext.toJS()
        if (pp.page == C.PAGE_EDIT) {
            switch (pp.pageName) {
                case C.PAGE_CHECKIN ://值机页面

                    const canCheckinPassengers = []
                    for (const id of pp.selectList) {
                        const o = F.getDataByEid(id, pp.passengerData);
                        const pl = o[1]
                        if (pl.wci === false) {
                            canCheckinPassengers.push(pl)
                        }
                    }
                    const s = {
                        canCheckinPassengers: canCheckinPassengers
                    }
                    return <CheckInPage immutableProps={Immutable.Map(s)} fetchPassengers={this.props.fetchPassengers}/>

                case C.PAGE_FLIGHT_STATUS_MANAGE://航班状态管理页面

                    const g = this.context.globalContext.toJS()
                    const fl = g.token.fl
                    return <FlightStatusManage fl={fl}/>

                case C.PAGE_OPEN_FLIGHT_SEAT://开放座位

                    return <SeatSetting tag="*"/>

                case C.PAGE_SET_FLIGHT_SEAT://设置座位

                    return <SeatSetting />

                case C.PAGE_SHOW_FLIGHT_SEAT:

                    return <ShowSeat />

                case C.PAGE_USERLIST :

                    return <UserList />

                case C.PAGE_FLIGHTLIST :

                    return <FlightList/>

                case C.PAGE_LOGLIST:

                    return <LogList cmd={pp.cmd}/>

                case C.PAGE_SHORTCUTHELP:

                    return <ShortCutHelp/>

                case C.PAGE_CMDHELP:

                    return <CmdHelp/>
            }
            throw 'page not found !!' + pp.pageName
            // return (
            //     <PassengerEdit immutableProps={{}}/>
            // )
        }
    }

    doOnKeyDown(e) {

        const keyCode = e.which
        const $t = $(e.target)
        const newValue = $.trim($t.val())

        if (keyCode == 13) {
            this.doExecuteCmd()
            F.stopEvent(e);
        }
    }

    doExecuteCmd() {

        const ip = $('#' + C.DEFAULT_INPUT),
            cmd = $.trim(ip.val() || '').toLocaleLowerCase()

        ip.val(cmd.toLocaleUpperCase()).select()

        let d;
        switch (true) {
            case C.CMD_USERLIST == cmd:

                d = {
                    page: C.PAGE_EDIT,
                    pageName: C.PAGE_USERLIST
                }
                break
            case C.CMD_FLIGHTLIST == cmd:
                d = {
                    page: C.PAGE_EDIT,
                    pageName: C.PAGE_FLIGHTLIST
                }
                break
            case C.CMD_LOG == cmd:
                d = {
                    page: C.PAGE_EDIT,
                    pageName: C.PAGE_LOGLIST
                }
                break
            case C.CMD_SYSLOG == cmd:
                d = {
                    page: C.PAGE_EDIT,
                    pageName: C.PAGE_LOGLIST
                }
                break
            case cmd == '?' || cmd == '？':
                d = {
                    page: C.PAGE_EDIT,
                    pageName: C.PAGE_CMDHELP
                }
                break
            default:
                this.props.fetchPassengers(cmd)
                return
        }

        d.cmd = cmd;

        this.context.updateData(d);
    }

    doCheckin() {

        const c = this.context.immutableContext.toJS()
        const canCheckin = c.selectList && c.selectList.some(function (id) {

                const pl = F.getDataByEid(id, c.passengerData)[1]
                return !pl.wci;
            });
        if (canCheckin) {
            this.context.updateData({
                page: C.PAGE_EDIT,
                pageName: C.PAGE_CHECKIN,
                block: C.BLOCK_LIST
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        const p = nextProps.immutableProps.toJS();
        this.setState(Object.assign({}, this.state, {
            cmd: p.cmd
        }))
    }

    render() {
        const p = this.props.immutableProps.toJS();
        const c = this.context.immutableContext.toJS()
        const activeEid = c.activeEid
        const handleFocus = this.context.handleFocus
        return (
            <div>
                <nav className="navbar navbar-default" style={{marginBottom: 0}}>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12">
                                <div className="input-group" style={{paddingTop: ".5em"}}>
                                  <span className="input-group-btn">
                                  <button className="btn btn-default" tabIndex="-1" title="返回">
                                    <span className="glyphicon glyphicon-menu-left">Esc</span>
                                  </button>
                                  </span>
                                    <input id="mainInput" key="mainInput"
                                           className={F.getSelClass(activeEid == C.DEFAULT_INPUT)}
                                           onFocus={ handleFocus } tabIndex="-1"
                                           style={{marginLeft: 2}}
                                           onKeyDown={this.doOnKeyDown.bind(this)}
                                    />
                                    <span className="input-group-btn">
                                  <button onClick={this.doExecuteCmd.bind(this)} className="btn btn-default"
                                          tabIndex="-1" style={{marginLeft: 3}}>
                                    Enter<span className="glyphicon glyphicon-menu-right"></span>
                                  </button>
                                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                <div id="mainContainer" className="container-fluid" style={{overflowX: 'hidden', overflowY: 'auto'}}>
                    <div className="panel panel-default" style={{marginTop: '5px', paddingRight: '10px'}}>
                        <div className="panel-body" style={{padding: 0}}>
                            <FlightStatusPanel />
                        </div>
                    </div>

                    {this.renderSelect()}
                    {this.renderOperator()}
                    {this.renderQuery()}
                    {this.renderEdit()}
                </div>
                <nav className="navbar navbar-default navbar-fixed-bottom">
                    <div className="container-fluid" style={{paddingTop: '1em'}}>
                        <div className="row">
                            <div className="col-xs-1">
                                <span className="glyphicon glyphicon-tasks">F6</span>
                            </div>
                            <div className="col-xs-7">
                                <button className="btn btn-xs btn-success">
                                    <span className="glyphicon glyphicon-print">登机牌打印机</span>
                                </button>
                                <b> </b>
                                <button className="btn btn-xs btn-success">
                                    <span className="glyphicon glyphicon-print">行李条打印机</span>
                                </button>
                                <b> </b>
                                <button className="btn btn-xs btn-success">
                                    <span className="glyphicon glyphicon-eye-open">身份证阅读器</span>
                                </button>
                                <b> </b>
                                <button className="btn btn-xs btn-danger">
                                    <span className="glyphicon glyphicon-camera">登机牌扫描枪</span>
                                </button>
                            </div>
                            <div className="col-xs-3 text-right">
                                <button className="btn btn-xs btn-success">
                                    <span className="glyphicon glyphicon-globe">正常</span>
                                </button>
                                <b> </b>
                                <button className="btn btn-xs btn-default">
                                    <span className="glyphicon glyphicon-log-out">退出</span>
                                </button>
                            </div>
                            <div className="col-xs-1 text-right">
                                <span className="glyphicon glyphicon-cog">F8</span>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        )
    }
}
PassengerPage.propTypes = {
    immutableProps: React.PropTypes.any.isRequired,
    fetchPassengers: React.PropTypes.func.isRequired,
}
PassengerPage.contextTypes = {
    immutableContext: React.PropTypes.any,
    globalContext: React.PropTypes.any,
    handleFocus: React.PropTypes.func,
    updateData: React.PropTypes.func,
}
export default PassengerPage