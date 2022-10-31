import React, { useState, useEffect, useCallback, memo } from 'react';
import axiosAgent from '../../api/apiAgents';
import {Segment, Grid} from 'semantic-ui-react';
import { toast } from 'react-toastify';
import DeviceCard from './DeviceCard';
import DeviceInfoProps from './DeviceInfoProps';

const DeviceInfo = ({ device, deleteDevice, objectId }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    axiosAgent.Device.get(device.deviceId, {'user':objectId}).then(response => {
      setSelectedDevice(response[0]);
    }).catch(error =>{
      toast.error(error);
    });
  }, [device, objectId]);

  const resetSelectedDevice = useCallback(
    () => {
      setSelectedDevice(null);
      deleteDevice();
    },
    [],
  );

  const modifySelectedDevice = useCallback(
    (modifiedDevice) => {
      setSelectedDevice(JSON.parse(JSON.stringify(modifiedDevice)));
    },
    [],
  );

  return (
    <Segment color='purple'>
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column textAlign='left'>
            <DeviceInfoProps selectedDevice={selectedDevice} modifySelectedDevice={modifySelectedDevice} objectId={objectId}/>
          </Grid.Column>
          <Grid.Column>
            <DeviceCard selectedDevice={selectedDevice} resetSelectedDevice={resetSelectedDevice} modifySelectedDevice={modifySelectedDevice} objectId={objectId}/>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  )
};

export default memo(DeviceInfo);