import React, { useState, useEffect, memo } from 'react';
import {Label, Segment, Tab, Grid} from 'semantic-ui-react';
import apiAgents from '../api/apiAgents';
import LiveData from './data/LiveData';
import Controller from './controller/Controller';
import Data from './data/Data';
import DeviceInfo from './info/DeviceInfo';
import HistoryDataTable from './data/HistoryDataTable';
import HistoryDataChart from './data/HistoryDataChart';
import IotUtils from '../common/IoTutils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DeviceData = ({ device, deleteDevice, objectId}) => {
  const [ registeredLiveDeviceId, setRegisteredLiveDeviceId ] = useState(null);
  const [ registeredHistoryDeviceId, setRegisteredHistoryDeviceId ] = useState(null);
  const [ liveConnection, setLiveConnection ] = useState(null);
  const [ historyConnection, setHistoryConnection ] = useState(null);
  const [ deviceLiveData, setDeviceLiveData] = useState(null);
  const [ deviceHistoryData, setDeviceHistoryData] = useState(null);
  const [telemetryData, setTelemetryData] = useState(false)
  const [controller, setController] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)
  const [metricType, setMetricType] = useState(null);

   useEffect(() => {
    Data.deviceReset();
    Data.setDeviceId(device.deviceId);

    if(liveConnection && registeredLiveDeviceId)
      onNewLiveConnection(registeredLiveDeviceId)
    else
      apiAgents.signalR.init("live",objectId, setLiveConnection);

    if(historyConnection && registeredHistoryDeviceId)
      onNewHistoryConnection(registeredHistoryDeviceId)
    else
      apiAgents.signalR.init("history",objectId, setHistoryConnection);

    apiAgents.Device.get(device.deviceId, {'user':objectId}).then(response => {
      setTelemetryData(IotUtils.toBoolean(IotUtils.getDesiredProperty(response[0], 'TelemetryData')))
      setController(IotUtils.toBoolean(IotUtils.getDesiredProperty(response[0], 'Controller')))
      Data.setDeviceType(IotUtils.getReportedProperty(response[0], 'DeviceType')) && setDeviceLiveData(Data.getDeviceLiveData());
      Data.setDeviceUnits(IotUtils.getReportedUnitProperties(response[0])) && setDeviceLiveData(Data.getDeviceLiveData());
      if(Data.allHistorySet()) setDeviceHistoryData(Data.getDeviceHistoryData());
    }).catch(error =>{
      toast.error(error);
    });

    var timeStart = new Date();
    timeStart.setMonth(timeStart.getMonth() - 32)

    apiAgents.History.fetch(device.deviceId, timeStart.toISOString(), {'user':objectId}).then(response => {
      Data.setDeviceRecentDataIfNotExist(response[0]) && setDeviceLiveData(Data.getDeviceLiveData());
      Data.setHistory(response) && setDeviceHistoryData(Data.getDeviceHistoryData());
    }).catch(error =>{
      toast.error(error);
    });

  }, [device, objectId]);

  useEffect(() => {
    if (liveConnection)
      apiAgents.signalR.start(liveConnection, onNewLiveMessage, onNewLiveConnection, onCloseLiveConnection, "Live");
  }, [liveConnection]);

  useEffect(() => {
    if (historyConnection)
      apiAgents.signalR.start(historyConnection, onNewHistoryMessage, onNewHistoryConnection, onCloseHistoryConnection, "History");
  }, [historyConnection]);

  function onNewLiveMessage(message) {
    Data.setDeviceRecentData(message) && setDeviceLiveData(Data.getDeviceLiveData());
  };

  function onNewHistoryMessage(message) {
    Data.setHistory(message) && setDeviceHistoryData(Data.getDeviceHistoryData());
  };

  async function onNewLiveConnection(message) {
      try {
        if(registeredLiveDeviceId != null)
          await liveConnection.invoke("UnregisterFromLiveDevice", registeredLiveDeviceId.ConnectionId, registeredLiveDeviceId.deviceId);
        await liveConnection.invoke("RegisterLiveToDevice", message.ConnectionId, device.deviceId);
        setRegisteredLiveDeviceId({'deviceId': device.deviceId, 'ConnectionId': message.ConnectionId});
      } catch (error) {
        toast.error(error);
      }
  }

  async function onNewHistoryConnection(message) {
    try {
      if(registeredHistoryDeviceId != null)
          await historyConnection.invoke("UnregisterFromHistoryDevice", registeredHistoryDeviceId.ConnectionId, registeredHistoryDeviceId.deviceId);
      await historyConnection.invoke("RegisterHistoryToDevice", message.ConnectionId, device.deviceId);
      setRegisteredHistoryDeviceId({'deviceId': device.deviceId, 'ConnectionId': message.ConnectionId});
    } catch (error) {
      toast.error(error);
    }
  }

  async function onCloseLiveConnection() {
    setLiveConnection(null);
    setRegisteredLiveDeviceId(null);
    toast.error('disconnected');
  }
  async function onCloseHistoryConnection(){
    setHistoryConnection(null);
    setRegisteredHistoryDeviceId(null);
    toast.error('disconnected');
  }

  const handleTab = (e, data) => {
    setTabIndex(data.activeIndex)
  }

  function OtherData({telemetryData, deviceHistoryData}){

    if(deviceHistoryData === null)
      return (<div></div>)

    const InfoDataPane = {
      menuItem: 'Device Info',
      render: () => <DeviceInfo device={device} deleteDevice={deleteDevice} objectId={objectId}></DeviceInfo>
    }

    const ChartDataPane = {
      menuItem: 'Metrics Chart',
      render: () => <HistoryDataChart deviceData={deviceHistoryData}></HistoryDataChart>
    }

    const historyDataPane = {
      menuItem: 'History Table',
      render: () => <HistoryDataTable deviceData={deviceHistoryData} ></HistoryDataTable>
    }
    if(telemetryData)
      return (<Tab onTabChange={handleTab} defaultActiveIndex={tabIndex} menu={{ pointing: true }} panes={[InfoDataPane, ChartDataPane, historyDataPane]} />)
    return (<Tab menu={{ pointing: true }} panes={[InfoDataPane]} />)
  }

  return (
    <div>
      <Segment id='0' className="segmentClassSmaller" inverted basic textAlign={"center"}>
        <Grid>
          <Grid.Row className='noTopHorPadding' columns={(telemetryData && controller)? 2 : 1}>
          {
            controller?
            (
              <Grid.Column className='noTopHorPadding'>
                <Segment  basic textAlign={"center"}>
                  <Controller device={device} objectId={objectId} />
                </Segment>
              </Grid.Column>
            )
            : (<></>)
          }
          {
            telemetryData?
            (
              <Grid.Column className='noTopHorPadding'>
                <Segment basic textAlign={"center"}>
                  <LiveData deviceData={deviceLiveData} />
                  {
                    liveConnection === null || historyConnection === null?
                    (
                      <Label color="red">
                        Not streaming
                      </Label>
                    ) : (
                      <Label color="green">
                        streaming
                      </Label>
                    )
                  }
                </Segment>
              </Grid.Column>
            )
            : (<></>)
          }
          </Grid.Row>
        </Grid>
        </Segment>
      <Segment className="segmentClassSmaller" inverted basic textAlign={"center"}>
        <OtherData telemetryData={telemetryData} deviceHistoryData={deviceHistoryData}/>
      </Segment>
    </div>
  )
};

export default memo(DeviceData);