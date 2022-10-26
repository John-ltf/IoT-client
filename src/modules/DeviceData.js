import React, { useState, useEffect, memo } from 'react';
import {Label} from 'semantic-ui-react';
import apiAgents from '../api/apiAgents';
import LiveData from './data/LiveData';
import Data from './data/Data';
import HistoryData from './data/HistoryData';
import IotUtils from '../common/IoTutils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DevicesData = ({ device }) => {
  const [ registeredLiveDeviceId, setRegisteredLiveDeviceId ] = useState(null);
  const [ registeredHistoryDeviceId, setRegisteredHistoryDeviceId ] = useState(null);
  const [ liveConnection, setLiveConnection ] = useState(null);
  const [ historyConnection, setHistoryConnection ] = useState(null);
  const [ deviceLiveData, setDeviceLiveData] = useState(null);
  const [ deviceHistoryData, setDeviceHistoryData] = useState(null);
  const [telemetryData, setTelemetryData] = useState(false)

   useEffect(() => {
    Data.deviceReset();
    Data.setDeviceId(device.deviceId);

    if(liveConnection && registeredLiveDeviceId)
      onNewLiveConnection(registeredLiveDeviceId)
    else
      apiAgents.signalR.init("live","john", setLiveConnection);

    if(historyConnection && registeredHistoryDeviceId)
      onNewHistoryConnection(registeredHistoryDeviceId)
    else
      apiAgents.signalR.init("history","john", setHistoryConnection);

    apiAgents.Device.get(device.deviceId, {'user':'john'}).then(response => {
      setTelemetryData(IotUtils.toBoolean(IotUtils.getDesiredProperty(response[0], 'TelemetryData')))
      Data.setDeviceType(IotUtils.getReportedProperty(response[0], 'DeviceType')) && setDeviceLiveData(Data.getDeviceLiveData());
      Data.setDeviceUnits(IotUtils.getReportedUnitProperties(response[0])) && setDeviceLiveData(Data.getDeviceLiveData());
      if(Data.allHistorySet()) setDeviceHistoryData(Data.getDeviceHistoryData());
    }).catch(error =>{
      toast.error(error);
    });

    var timeStart = new Date();
    timeStart.setMonth(timeStart.getMonth() - 32)

    apiAgents.History.fetch(device.deviceId, timeStart.toISOString(), {'user':'john'}).then(response => {
      Data.setDeviceRecentDataIfNotExist(response[0]) && setDeviceLiveData(Data.getDeviceLiveData());
      Data.setHistory(response) && setDeviceHistoryData(Data.getDeviceHistoryData());
    }).catch(error =>{
      toast.error(error);
    });

  }, [device]);

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

  return (
    <div>
    {
      telemetryData?
      (
        <div>
          <div className='statistisClass' >
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
          </div>
          <HistoryData deviceData={deviceHistoryData} />
        </div>
      )
      : (<div></div>)
    }
    </div>
  )
};

export default memo(DevicesData);