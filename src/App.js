import './App.css';
import React, { useState, useCallback } from 'react'
import { Segment, Grid } from 'semantic-ui-react';
import {ToastContainer} from 'react-toastify';
import Devices from './modules/DevicesMenu';
import DeviceInfo from './modules/DeviceInfo';
import DeviceData from './modules/DeviceData';
import NewDevice from './modules/NewDevice';
import BackroundImage from './modules/BackroundImage';

function App() {
  const [device, setDevice] = useState({deviceId: null, nickName: null})
  const [fetchTrigger, setfetchTrigger] = useState(0)
  const [showBackround, setBackround] = useState(true)
  const [newDevicePanel, setnewDevicePanel] = useState(false)

  const showDevice = useCallback(
    (deviceId, nickName) => {
      setDevice({deviceId: deviceId, nickName: nickName});
      setBackround(false);
      setnewDevicePanel(false);
    },
    [],
  );

  const newDevice = useCallback(
    () => {
      setDevice({deviceId: null, nickName: null});
      setBackround(false);
      setnewDevicePanel(true);
    },
    [],
  );

  const deleteDevice = useCallback(
    () => {
      setfetchTrigger(fetchTrigger+1)
      setDevice({deviceId: null, nickName: null});
      setBackround(true);
      setnewDevicePanel(false);
    },
    [],
  );

  return (
    <Segment className='segmentClass' inverted vertical>
    <ToastContainer position='bottom-right' />
    <Grid padded celled  columns={16}>
        <Grid.Column>
          <Segment className='segmentClass' inverted vertical>
              <Devices fetchTrigger={fetchTrigger} showDevice={showDevice} newDevice={newDevice} />
          </Segment>
        </Grid.Column>
      {
        (showBackround)?
          <Grid.Row centered columns={1} className='gridRowClass'>
            <BackroundImage />
          </Grid.Row>
        : null
      }
      {
        (newDevicePanel)?
            <Grid.Row centered columns={2} className='gridRowClass'>
              <Grid.Column >
                <BackroundImage />
              </Grid.Column>
              <Grid.Column >
                <NewDevice />
              </Grid.Column>
            </Grid.Row>
        : null
      }
      {
        (device.deviceId != null)?
            <Grid.Row   className='gridRowClass'>
              <Grid.Column textAlign="center" width={12}>
                <DeviceData device={device} />
              </Grid.Column>
              <Grid.Column width={4}>
              <Segment className='segmentClass' inverted vertical>
                <DeviceInfo device={device} deleteDevice={deleteDevice} />
                </Segment>
              </Grid.Column>
            </Grid.Row>
        : null
      }
    </Grid>
    </Segment>
  );
}

export default App;
