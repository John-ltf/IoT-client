import React, { useState, useEffect, memo } from 'react';
import axiosAgent from '../../api/apiAgents';
import { Dimmer, Loader, Select, Segment, Form } from 'semantic-ui-react';
import IotUtils from '../../common/IoTutils';
import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import { toast } from 'react-toastify';

const DeviceInfoProps = ({ selectedDevice, modifySelectedDevice, objectId }) => {
  const [activeDimmer, setActiveDimmer] = useState(false);
  const [telemetryData, setTelemetryData] = useState(true)
  const [controller, setController] = useState(true)
  const [Height, setHeight] = useState("")
  const [Gender, setGender] = useState("")
  const [birthday, setBirthday] = useState(null);
  const onBirthdayChange = (event, data) => setBirthday(data.value);

  useEffect(() => {
    setTelemetryData(IotUtils.toBoolean(IotUtils.getDesiredProperty(selectedDevice, 'TelemetryData')))
    setController(IotUtils.toBoolean(IotUtils.getDesiredProperty(selectedDevice, 'Controller')))
    setGender(IotUtils.getDesiredProperty(selectedDevice, 'Gender'))
    setHeight(IotUtils.getDesiredProperty(selectedDevice, 'Height'))

    const dateStr = IotUtils.getDesiredProperty(selectedDevice, 'Year') + "-" +
                    IotUtils.getDesiredProperty(selectedDevice, 'Month') + '-' +
                    IotUtils.getDesiredProperty(selectedDevice, 'Day');
    var timestamp = Date.parse(dateStr);
    (isNaN(timestamp) === false)? setBirthday(new Date(timestamp)) : setBirthday(null)

  }, [selectedDevice]);

  async function updateDevice(event){
    const updateDeviceCall = async (type, name, value, setter = null) => {
      setActiveDimmer(true);
      let response = await axiosAgent.Device.update(selectedDevice.deviceId,
          {'user':objectId, 'updateType': type, 'updateName': name, 'updateValue': value})
      if(setter !== null)
      setter(selectedDevice, name, value)
      setActiveDimmer(false);
      if(response === false)
        toast.error(`Cannot change Status of ${selectedDevice.deviceId}`);
    };

    event.preventDefault();
    const {target} = event;

    if('NickName' in target && target.NickName.value !== "")
      await updateDeviceCall('tags', 'NickName', target.NickName.value, IotUtils.setTag)

    if('TelemetryData' in target && target.TelemetryData.checked !== IotUtils.getDesiredProperty(selectedDevice, 'TelemetryData'))
      await updateDeviceCall('desiredProperty', 'TelemetryData', target.TelemetryData.checked, IotUtils.setDesiredProperty)
    if('Controller' in target && target.Controller.checked !== IotUtils.getDesiredProperty(selectedDevice, 'Controller'))
      await updateDeviceCall('desiredProperty', 'Controller', target.Controller.checked, IotUtils.setDesiredProperty)
    if('interval' in target && target.interval.value !== "")
      await updateDeviceCall('desiredProperty', 'Interval', target.interval.value, IotUtils.setDesiredProperty)
    if('retentionPolicyData' in target && target.retentionPolicyData.value !== "")
      await updateDeviceCall('desiredProperty', 'RetentionPolicyData', target.retentionPolicyData.value, IotUtils.setDesiredProperty)
    if(IotUtils.getReportedProperty(selectedDevice, 'DeviceType') === "MIBFS"){
      if(Height !== "")
        await updateDeviceCall('desiredProperty', 'Height', Height, IotUtils.setDesiredProperty)
      if(Gender !== "")
        await updateDeviceCall('desiredProperty', 'Gender', Gender, IotUtils.setDesiredProperty)
      if(birthday !== ""){
        await updateDeviceCall('desiredProperty', 'Day', IotUtils.getDayInMonth(birthday), IotUtils.setDesiredProperty)
        await updateDeviceCall('desiredProperty', 'Month', IotUtils.getMonthNum(birthday), IotUtils.setDesiredProperty)
        await updateDeviceCall('desiredProperty', 'Year', IotUtils.getYear(birthday), IotUtils.setDesiredProperty)
      }
    }
    modifySelectedDevice(selectedDevice);
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
    <Segment color='purple'>
      <Dimmer active={activeDimmer}>
        <Loader size='massive'>Requesting</Loader>
      </Dimmer>
      <Form onSubmit={updateDevice}>
        <Form.Group widths='equal'>
          <Form.Input fluid name='NickName' label='NickName' placeholder={IotUtils.getTag(selectedDevice, 'NickName')}/>
        </Form.Group>
        <Form.Group widths='equal'>
          <Form.Checkbox name='TelemetryData' label='Telemetry Device' checked={telemetryData === true} onClick={() => setTelemetryData(!telemetryData)} />
          <Form.Checkbox name='Controller' label='Controller Device' checked={controller === true}  onClick={() => setController(!controller)}/>
        </Form.Group>
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
                  <Form.Field fluid required id='Gender' value={Gender} onChange={handleGender} control={Select} label='Gender' options={genderOptions} placeholder='Gender' />
                </Form.Group>
                <Form.Group widths='equal'>
                  <Form.Field fluid required id='Height' value={Height} onChange={handleHeight} control={Select} label='Height' options={height} placeholder='Height' />
                </Form.Group>
              </>
            ) : (<div></div>)
        }
        <Form.Button inverted color='purple'>Update</Form.Button>
      </Form>
    </Segment>
  )
};

export default memo(DeviceInfoProps);