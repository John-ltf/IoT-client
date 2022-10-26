import React, { useState, useEffect, memo } from 'react';
import axiosAgent from '../api/apiAgents';
import DeviceBattery from './DeviceBattery';
import { Header, Dimmer, Modal, Loader, Select, Segment, Button, Card, Popup, Icon, Form, Grid } from 'semantic-ui-react';
import IotUtils from '../common/IoTutils';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import { toast } from 'react-toastify';

const Devices = ({ device, deleteDevice }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [DeviceStatus, setDeviceStatus] = useState(IotUtils.isEnabled(selectedDevice));
  const [activeDimmer, setActiveDimmer] = useState(false);
  const [open, setOpen] = useState(false)
  const [telemetryData, setTelemetryData] = useState(true)
  const [controller, setController] = useState(true)
  const [Height, setHeight] = useState("")
  const [Gender, setGender] = useState("")
  const [birthday, setBirthday] = useState(null);
  const onBirthdayChange = (event, data) => setBirthday(data.value);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosAgent.Device.get(device.deviceId, {'user':'john'});
      setSelectedDevice(response[0]);
      setDeviceStatus(IotUtils.isEnabled(response[0]))
      setTelemetryData(IotUtils.toBoolean(IotUtils.getDesiredProperty(response[0], 'TelemetryData')))
      setController(IotUtils.toBoolean(IotUtils.getDesiredProperty(response[0], 'Controller')))

      setBirthday(
        new Date(
          IotUtils.getDesiredProperty(response[0], 'Year') + "-" +
          IotUtils.getDesiredProperty(response[0], 'Month') + '-' +
          IotUtils.getDesiredProperty(response[0], 'Day')
        )
      )
    };
    fetchData()
  }, [device]);

  const changeDeviceStatus = () => {
    const updateStatusCall = async (enable) => {
      let response;
      setActiveDimmer(true)
      if(enable)
        response = await axiosAgent.Device.setEnabled(device.deviceId, {'user':'john'});
      else
        response = await axiosAgent.Device.setDisabled(device.deviceId, {'user':'john'});
      setActiveDimmer(false)
      if(response === false)
        toast.error(`Cannot update device: ${device.deviceId}`);
    };
    updateStatusCall(!DeviceStatus);
    setDeviceStatus(!DeviceStatus);
    selectedDevice.status = IotUtils.switchedStatus(selectedDevice)
  };

  async function deleteDeviceHandle(){
    let response = false;
    const deleteDeviceCall = async () => {
      setActiveDimmer(true)
      response = await axiosAgent.Device.delete(device.deviceId, {'user':'john'});

      //wait for 5 seconds, IoT Hub get a little bit to eventually delete device
      await new Promise(resolve => setTimeout(resolve, 5000));
      setActiveDimmer(false)
      if(response === false)
        toast.error(`Cannot change Status of ${device.deviceId}`);
    };

    await deleteDeviceCall();
    if(response === true){
      setSelectedDevice(null);
      deleteDevice();
    }
  }

  async function updateDevice(event){
    const updateDeviceCall = async (type, name, value) => {
      setActiveDimmer(true);
      let response = await axiosAgent.Device.update(device.deviceId,
          {'user':'john', 'updateType': type, 'updateName': name, 'updateValue': value});
      setActiveDimmer(false);
      if(response === false)
        toast.error(`Cannot change Status of ${device.deviceId}`);
    };

    event.preventDefault();
    const {target} = event;

    if('interval' in target && target.interval.value !== "")
      await updateDeviceCall('desiredProperty', 'Interval', target.interval.value)
    if('retentionPolicyData' in target && target.retentionPolicyData.value !== "")
      await updateDeviceCall('desiredProperty', 'RetentionPolicyData', target.retentionPolicyData.value)
    if('NickName' in target && target.NickName.value !== "")
      await updateDeviceCall('tags', 'NickName', target.NickName.value)
    if('TelemetryData' in target && target.TelemetryData.checked !== IotUtils.getDesiredProperty(selectedDevice, 'TelemetryData'))
      await updateDeviceCall('desiredProperty', 'TelemetryData', target.TelemetryData.checked)
    if('Controller' in target && target.Controller.checked !== IotUtils.getDesiredProperty(selectedDevice, 'Controller'))
      await updateDeviceCall('desiredProperty', 'Controller', target.Controller.checked)
    if(IotUtils.getReportedProperty(selectedDevice, 'DeviceType') === "MIBFS"){
      if(Height !== "")
        await updateDeviceCall('desiredProperty', 'Height', Height)
      if(Gender !== "")
        await updateDeviceCall('desiredProperty', 'Gender', Gender)
      if(birthday !== ""){
        await updateDeviceCall('desiredProperty', 'Day', IotUtils.getDayInMonth(birthday))
        await updateDeviceCall('desiredProperty', 'Month', IotUtils.getMonthNum(birthday))
        await updateDeviceCall('desiredProperty', 'Year', IotUtils.getYear(birthday))
      }
    }
  }

  const handleGender = (e) => {
    for (const option of genderOptions) {
      if(option['text'] === e.target.innerText)
      setGender(option['key'])
    }
  };
  const genderOptions = [
    { key: 'male', text: 'male', value: 'male' },
    { key: 'female', text: 'female', value: 'female' }
  ]

  const handleHeight = (e) => {
    for (const option of height) {
      if(option['text'] === e.target.innerText)
      setHeight(option['key'])
    }
  };
  const height = Array.apply(null, Array(81)).map(
    function (x, i) {
       return { key: `${140+i}`, text: `${140+i}`, value: `${140+i}` };
    })

  return (
  <Card.Group centered>
    <Segment>
      <Dimmer active={activeDimmer}>
        <Loader size='massive'>Requesting</Loader>
      </Dimmer>
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
          <Card.Content>
          <Card.Header>{IotUtils.getDeviceName(selectedDevice)}</Card.Header>
          <Card.Meta>{IotUtils.getReportedProperty(selectedDevice, 'DeviceType')}</Card.Meta>
          <Card.Meta>{IotUtils.getMac(selectedDevice)}</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Form onSubmit={updateDevice}>
            { telemetryData === true?
              (
                <Form.Group widths='equal'>
                  <>
                    <Form.Input fluid name='interval' label='Interval (sec)' placeholder={IotUtils.getDesiredProperty(selectedDevice, 'Interval')} width={1}/>
                    <Form.Input fluid name='retentionPolicyData' label='Retention (days)' placeholder={IotUtils.getDesiredProperty(selectedDevice, 'RetentionPolicyData')} width={1}/>
                  </>
                </Form.Group>
              ) : (<div></div>)
            }
            <Form.Group widths='equal'>
              <Form.Input fluid name='NickName' label='NickName' placeholder={IotUtils.getTag(selectedDevice, 'NickName')}/>
            </Form.Group>
            {
              (IotUtils.getReportedProperty(selectedDevice, 'DeviceType') === "MIBFS") ?
                (
                  <>
                    <Form.Group widths='equal'>
                      <SemanticDatepicker
                        label='Date of birth'
                        format="DD/MM/YYYY"
                        onChange={onBirthdayChange}
                        showToday={true}
                        value={birthday}
                      />
                    </Form.Group>
                    <Form.Group widths='equal'>
                      <Form.Field fluid required id='Gender' value={IotUtils.getDesiredProperty(selectedDevice, 'Gender')} onChange={handleGender} control={Select} label='Gender' options={genderOptions} placeholder='Gender' />
                    </Form.Group>
                    <Form.Group widths='equal'>
                      <Form.Field fluid required id='Height' value={IotUtils.getDesiredProperty(selectedDevice, 'Height')} onChange={handleHeight} control={Select} label='Height' options={height} placeholder='Height' />
                    </Form.Group>
                  </>
                ) : (<div></div>)
            }
            <Form.Group widths='equal'>
              <Form.Checkbox name='TelemetryData' label='Telemetry Device' checked={telemetryData === true} onClick={() => setTelemetryData(!telemetryData)} />
              <Form.Checkbox name='Controller' label='Controller Device' checked={controller === true}  onClick={() => setController(!controller)}/>
            </Form.Group>
            <Grid>
              <Grid.Column textAlign="center">
                <Form.Button>Update</Form.Button>
              </Grid.Column>
            </Grid>
          </Form>
        </Card.Content>
        <Card.Content extra>
          <div>
          <Modal
            basic
            size='small'
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
            trigger={<Button fluid basic color='red'><Icon name='power' /></Button>}
          >
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
          </div>
        </Card.Content>
      </Card>
    </Segment>
  </Card.Group>
  )
};

export default memo(Devices);