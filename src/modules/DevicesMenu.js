import React, { useState, useEffect, memo } from 'react'
import { Icon, Dropdown } from 'semantic-ui-react';
import axiosAgent from '../api/apiAgents';
import uuid from 'react-uuid';

const Devices = ({ fetchTrigger, showDevice, newDevice }) => {
  const [devices, setDevices] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosAgent.Devices.list( {'user':'john'});
      setDevices(response);
    };
    fetchData()
  }, [fetchTrigger]);

  const trigger = (
    <span>
      <Icon color='purple' name='microchip' /> Devices
    </span>
  )

  function selectdevice(deviceId, nickName){
    showDevice(deviceId, nickName);
  }

  function newdevice(){
    newDevice();
  }

  return (
    <Dropdown floating trigger={trigger} >
    <Dropdown.Menu>
      {
        devices
          .map(device =>
            {
              return ('nickName' in device && device.nickName !== "") ?
                <Dropdown.Item onClick={() => selectdevice(device.deviceId, device.NickName)} key={uuid()} text={device.nickName} />
              :
                <Dropdown.Item onClick={() => selectdevice(device.deviceId,"")} key={uuid()} text={device.deviceId} />
            }
          )
      }
    <Dropdown.Divider />
    <Dropdown.Item icon='add' onClick={newdevice} key={uuid()} text='Add Device' />
    </Dropdown.Menu>
    </Dropdown>
  )
};

export default memo(Devices);