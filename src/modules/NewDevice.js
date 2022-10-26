import React, { useState, memo } from 'react';
import axiosAgent from '../api/apiAgents';
import { Dimmer, Loader, Select, Segment, Card, Form, Grid } from 'semantic-ui-react';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import IotUtils from '../common/IoTutils';
import { toast } from 'react-toastify';

const NewDevice = () => {
  const [activeDimmer, setActiveDimmer] = useState(false);
  const [telemetryData, setTelemetryData] = useState(false)
  const [controller, setController] = useState(false)
  const [DeviceType, setDeviceType] = useState("")
  const [Height, setHeight] = useState("")
  const [Gender, setGender] = useState("")
  const [birthday, setBirthday] = useState(null);
  const onBirthdayChange = (event, data) => setBirthday(data.value);

  async function registerDevice(event){
    const registerDeviceCall = async (deviceId, mac, body) => {
      setActiveDimmer(true);
      let response = await axiosAgent.Device.register(deviceId, body);
      if(response === false){
        toast.error(`Cannot register device: ${deviceId}`);
        setActiveDimmer(false);
        return false;
      }

      //wait for actual register on IoT hub
      while(true){
        await new Promise(resolve => setTimeout(resolve, 5000));
        if( await axiosAgent.Device.get(deviceId + "_" + mac, {'user':'john'}) !== 0)
          break;
      }
      setActiveDimmer(false);
      return true;
    };
    const updateDeviceCall = async (deviceId, type, name, value) => {
      let response;
      setActiveDimmer(true);
      while(true){
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
          response = await axiosAgent.Device.update(deviceId,
              {'user':'john', 'updateType': type, 'updateName': name, 'updateValue': value});
        }
        catch(error){
          response = ""
        }
        if(response !== "")
          break;
      }
      setActiveDimmer(false);
      if(response === false){
        console.log('error update')
        toast.error(`Cannot register device: ${deviceId}`);
        return false;
      }
      return true;
    };

    event.preventDefault();
    const {target} = event;
    let body = {
      "user": "john",
      "nickName": target.NickName.value,
      "mac": target.MacAddress.value,
      "telemetryData": target.TelemetryData.checked,
      "deviceType": DeviceType,
      "controller": target.Controller.checked,
      "autoRegistered": false
    }

    let deviceId = target.NickName.value + "_" +  target.MacAddress.value;
    let res = await registerDeviceCall(target.NickName.value, target.MacAddress.value, body);
    if(res){
      toast(`Device ${target.NickName.value} has been initially registered. Wait to apply Device properties...`);
      if(target.TelemetryData.checked){
        if('interval' in target && target.interval.value !== "")
          await updateDeviceCall(deviceId, 'desiredProperty', 'Interval', target.interval.value)
        if('retentionPolicyData' in target && target.retentionPolicyData.value !== "")
          await updateDeviceCall(deviceId, 'desiredProperty', 'RetentionPolicyData', target.retentionPolicyData.value)
      }
      if(DeviceType === "MIBFS"){
        if(Height !== "")
          await updateDeviceCall(deviceId, 'desiredProperty', 'Height', Height)
        if(Gender !== "")
          await updateDeviceCall(deviceId, 'desiredProperty', 'Gender', Gender)
        if(birthday !== ""){
          await updateDeviceCall(deviceId, 'desiredProperty', 'Day', IotUtils.getDayInMonth(birthday))
          await updateDeviceCall(deviceId, 'desiredProperty', 'Month', IotUtils.getMonthNum(birthday))
          await updateDeviceCall(deviceId, 'desiredProperty', 'Year', IotUtils.getYear(birthday))
        }
      }
    }
  }

  function enableTelemertyFields(){
    setTelemetryData(!telemetryData)
  }

  function enableControlerFields(){
    setController(!controller)
  }

  const handleDeviceType = (e) => {
    for (const option of options) {
      if(option['text'] === e.target.innerText)
      setDeviceType(option['key'])
    }
  };
  const options = [
    { key: 'LYWSD03MMC', text: 'Xiaomi Mijia', value: 'LYWSD03MMC' },
    { key: 'MIBFS', text: 'Mi Body Composition Scale 2', value: 'MIBFS' }
  ]

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
            <Card.Header>Register Device</Card.Header>
          </Card.Content>
          <Card.Content extra>
            <Form onSubmit={registerDevice}>
              <Form.Group widths='equal'>
                <Form.Checkbox name='TelemetryData' label='Telemetry Device' checked={telemetryData === true} onClick={() => enableTelemertyFields()} />
                <Form.Checkbox name='Controller' label='Controller Device' checked={controller === true}  onClick={() => enableControlerFields()}/>
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Input fluid required name='NickName' label='Device Name' placeholder='Your device Name'/>
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Input fluid required name='MacAddress' label='Mac Address' placeholder='00:B0:D0:63:C2:26'/>
              </Form.Group>
              <Form.Group widths='equal'>
                <Form.Select fluid required id='DeviceType' value={DeviceType} onChange={handleDeviceType} label='Device Type' options={options} placeholder='Device Type'/>
              </Form.Group>
              { telemetryData ?
                (
                  <Form.Group widths='equal'>
                    <>
                      <Form.Input fluid required name='interval' label='Interval (sec)' placeholder='Retrieve Data frequency (sec)' width={4}/>
                      <Form.Input fluid required name='retentionPolicyData' label='Retention (days)' placeholder='Data Retention policy (days)' width={4}/>
                    </>
                  </Form.Group>
                ) : (<div></div>)
              }
              {
                (DeviceType === "MIBFS") ?
                  (
                    <>
                      <Form.Group widths='equal'>
                        <SemanticDatepicker label='Date of birth' format="DD/MM/YYYY" onChange={onBirthdayChange}/>
                      </Form.Group>
                      <Form.Group widths='equal'>
                        <Form.Field fluid required id='Gender' value={Gender} onChange={handleGender} control={Select} label='Gender' options={genderOptions} placeholder='Gender' />
                      </Form.Group>
                      <Form.Group widths='equal'>
                        <Form.Field fluid required id='Height' value={Height} onChange={handleHeight} control={Select} label='Height' options={height} placeholder='Height' />
                      </Form.Group>
                    </>
                  ) : (<div></div>)
              }
              <Grid>
                <Grid.Column textAlign="center">
                  <Form.Button>Register</Form.Button>
                </Grid.Column>
              </Grid>
            </Form>
          </Card.Content>
        </Card>
      </Segment>
    </Card.Group>
    )
};

export default memo(NewDevice);