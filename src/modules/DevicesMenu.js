import React, { useState, useEffect, memo } from 'react'
import { Dropdown } from 'semantic-ui-react';
import axiosAgent from '../api/apiAgents';
import uuid from 'react-uuid';

const DevicesMenu = ({ fetchTrigger, showDevice, objectId }) => {
  const [devices, setDevices] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosAgent.Devices.list( {'user':objectId});
      setDevices(response);
    };
    fetchData()
  }, [fetchTrigger, objectId]);

  function selectdevice(deviceId, nickName){
    showDevice(deviceId, nickName);
  }

  return (
    <Dropdown color='purple'  item text='Devices' >
    <Dropdown.Menu color='purple'>
      {
        devices
          .map(device =>
            {
              return ('nickName' in device && device.nickName !== "") ?
                <Dropdown.Item color='purple' onClick={() => selectdevice(device.deviceId, device.NickName)} key={uuid()} text={device.nickName} />
              :
                <Dropdown.Item onClick={() => selectdevice(device.deviceId,"")} key={uuid()} text={device.deviceId} />
            }
          )
      }
    </Dropdown.Menu>
    </Dropdown>
  )
};

export default memo(DevicesMenu);