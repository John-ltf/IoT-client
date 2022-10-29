import React, { useState, useEffect, memo } from 'react';
import axiosAgent from '../../api/apiAgents';
import DeviceBattery from '../DeviceBattery';
import { Header, Dimmer, Modal, Loader, Segment, Button, Card, Popup, Icon} from 'semantic-ui-react';
import IotUtils from '../../common/IoTutils';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import { toast } from 'react-toastify';

const DeviceCard = ({ selectedDevice, resetSelectedDevice, modifySelectedDevice, objectId }) => {
  const [DeviceStatus, setDeviceStatus] = useState(IotUtils.isEnabled(selectedDevice));
  const [activeDimmer, setActiveDimmer] = useState(false);
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setDeviceStatus(IotUtils.isEnabled(selectedDevice))
  }, [selectedDevice, objectId]);

  const changeDeviceStatus = () => {
    const updateStatusCall = async (enable) => {
      let response;
      setActiveDimmer(true)
      if(enable)
        response = await axiosAgent.Device.setEnabled(selectedDevice.deviceId, {'user':objectId});
      else
        response = await axiosAgent.Device.setDisabled(selectedDevice.deviceId, {'user':objectId});
      setActiveDimmer(false)
      if(response === false)
        toast.error(`Cannot update device: ${selectedDevice.deviceId}`);
    };
    updateStatusCall(!DeviceStatus);
    setDeviceStatus(!DeviceStatus);
    selectedDevice.status = IotUtils.switchedStatus(selectedDevice)
    modifySelectedDevice(selectedDevice);
  };

  async function deleteDeviceHandle(){
    let response = false;
    const deleteDeviceCall = async () => {
      setActiveDimmer(true)
      response = await axiosAgent.Device.delete(selectedDevice.deviceId, {'user':objectId});

      //Check till device is actually deleted, IoT Hub get a little bit to eventually delete device
      let deviceCheck = await axiosAgent.Device.get(selectedDevice.deviceId, {'user':objectId});
      let count=0;
      while(deviceCheck.length !== 0){
        await new Promise(resolve => setTimeout(resolve, 5000));
        deviceCheck = await axiosAgent.Device.get(selectedDevice.deviceId, {'user':objectId});
        if(count++ > 20) break;
      }

      setActiveDimmer(false)
      if(response === false)
        toast.error(`Cannot change Status of ${selectedDevice.deviceId}`);
    };

    await deleteDeviceCall();
    if(response === true){
      resetSelectedDevice();
    }
  }

  return (
    <Segment placeholder color='purple'>
      <Dimmer active={activeDimmer}>
        <Loader size='massive'>Requesting</Loader>
      </Dimmer>
      <Card.Group centered>
        <Card color='purple'>
          <Card.Content>
            <div className='ui left floated'>
              <DeviceBattery value={ parseInt(IotUtils.getReportedProperty(selectedDevice, 'battery'), 10)} />
            </div>
            <div className='ui right floated'>
              <Popup content='Enable/Disable Device' trigger=
              {
                <div className="ui toggle checkbox">
                  <input type="checkbox" checked={DeviceStatus} onChange={changeDeviceStatus} />
                  <label></label>
                </div>
              } />
            </div>
            </Card.Content>
            <Card.Content textAlign='left'>
              <Card.Header>{IotUtils.getDeviceName(selectedDevice)}</Card.Header>
              <Card.Meta>{IotUtils.getReportedProperty(selectedDevice, 'DeviceType')}</Card.Meta>
              <Card.Meta>{IotUtils.getMac(selectedDevice)}</Card.Meta>
          </Card.Content>
          <Card.Content extra>
            <Modal basic size='small' onClose={() => setOpen(false)} onOpen={() => setOpen(true)}
              open={open} trigger={<Button fluid basic color='red'><Icon name='power' /></Button>}>
              <Header icon>
                <Icon name='delete' />
                Delete Device
              </Header>
              <Modal.Content>
                <p>
                  This action will delete your device with its data
                </p>
              </Modal.Content>
              <Modal.Actions>
                <Button basic color='red' inverted onClick={() => setOpen(false)}>
                  <Icon name='remove' /> No
                </Button>
                <Button color='green' onClick={() => {setOpen(false); deleteDeviceHandle()}}>
                  <Icon name='checkmark' /> Yes
                </Button>
              </Modal.Actions>
            </Modal>
        </Card.Content>
        </Card>
      </Card.Group>
    </Segment>
  )
};

export default memo(DeviceCard);