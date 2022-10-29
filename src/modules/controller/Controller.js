import React, { useState, useEffect, memo } from 'react';
import axiosAgent from '../../api/apiAgents';
import { toast } from 'react-toastify';
import IotUtils from '../../common/IoTutils';
import {Segment, Dimmer, Loader, Button, Label, List, Grid} from 'semantic-ui-react';
import { Slider } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import uuid from 'react-uuid';

const responseTimeout = 40.0;
const connectionTimeout = 2.0;

const Controller = ({ device, objectId }) => {
  const [activeDimmer, setActiveDimmer] = useState(false);
  const [switches, setSwitches] = useState({})
  const [buttons, setButtons] = useState([])
  const [adjusters, setAdjusters] = useState([])
  const [switchesStatus, setSwitchesStatus] = useState({})
  const [adjustersStatus, setAdjustersStatus] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosAgent.Device.get(device.deviceId, {'user':objectId});

      const controllersRes = IotUtils.getReportedProperty(response[0], 'Controllers');
      if(controllersRes !== null){
        try {
          const controllers = JSON.parse(controllersRes);
          ("switches" in controllers) && setSwitches(controllers["switches"]);
          ("buttons" in controllers) &&setButtons(controllers["buttons"]);
          ("adjusters" in controllers) &&setAdjusters(controllers["adjusters"]);
        } catch(e) {
          toast.error(`Cannot get controller Commands`);
        }
      }

      const controllersStatus = IotUtils.getDesiredProperty(response[0], 'ControllersStatus');
      if(controllersStatus !== null){
        try {
          const controllers = JSON.parse(controllersStatus);
          ("switches" in controllers)  && setSwitchesStatus(controllers["switches"]);
          ("adjusters" in controllers) && setAdjustersStatus(controllers["adjusters"]);
        } catch(e) {
          toast.error(`Cannot get controller Commands Status`);
        }
      }

    };
    fetchData();
  }, [device, objectId]);

  const getDirectMethodBody = (methodName, payload) => {
    const body = {
      user:               objectId,
      payload:            payload,
      methodName:         methodName,
      responseTimeout:    responseTimeout,
      connectionTimeout:  connectionTimeout
    }
    console.log(JSON.stringify(body))
    return JSON.stringify(body);
  }

  const sendMessageSwitch = event => {
    setActiveDimmer(true)
    event.preventDefault();

    //get values
    const switchname = event.target.getAttribute("switchname")
    const deviceStatus = switchesStatus[switchname];
    const buttonText = event.target.innerHTML;
    const index = event.target.getAttribute("index")

    //if the current status is clicked, don't call direct method
    if(event.target.classList.contains('active') === true || deviceStatus === buttonText){
      toast.info(`${switchname} allready on status ${deviceStatus}`);
      setActiveDimmer(false)
    }
    else {

      //find counterpart value
      const switchTo = (index === '1')? switches[switchname][1] : switches[switchname][0];

      //call direct method
      axiosAgent.IoTMessaging.directMethod(device.deviceId, getDirectMethodBody(switchTo, "{}")).then(response => {

        if("Message" in response){

          //get and parse message
          const message = JSON.parse(response["Message"])

          //if error, set current button as enabled and print error
          if("errorCode" in message && "message" in message){
            setSwitchesStatus(JSON.parse(JSON.stringify(switchesStatus))) //set itself to re-render (disable the switching button)
            toast.error(`error: ${message["errorCode"]}. Message: ${message["message"]}`);
          }
          else{

            //direct method completed, switch active button
            switchesStatus[switchname] = switchTo;
            setSwitchesStatus(JSON.parse(JSON.stringify(switchesStatus)))
            toast.info(`Device ${device.deviceId} switched to ${switchesStatus[switchname]}`);
          }
        }
        setActiveDimmer(false)
      }).catch(error =>{
        toast.error(error);
        setActiveDimmer(false)
      });
    }
  }

  const sendMessageButton = event => {
    setActiveDimmer(true)
    event.preventDefault();

    //get values
    const directMethod = event.target.innerHTML;

    //call direct method
    axiosAgent.IoTMessaging.directMethod(device.deviceId, getDirectMethodBody(directMethod, "{}")).then(response => {

      if("Message" in response){

        //get and parse message
        const message = JSON.parse(response["Message"])

        //if error, set current button as enabled and print error
        if("errorCode" in message && "message" in message)
          toast.error(`error: ${message["errorCode"]}. Message: ${message["message"]}`);
        else
          toast.info(`${directMethod} send to Device ${device.deviceId}`);
      }
      setActiveDimmer(false)
    }).catch(error =>{
      toast.error(error);
      setActiveDimmer(false)
    });
  }

  const sendMessageRange = (value, directMethod) => {
    setActiveDimmer(true)

    //call direct method
    axiosAgent.IoTMessaging.directMethod(device.deviceId, getDirectMethodBody(directMethod, "{\"payload\":\""+value+"\"}")).then(response => {

      if("Message" in response){

        //get and parse message
        const message = JSON.parse(response["Message"])

        //if error, set current button as enabled and print error
        if("errorCode" in message && "message" in message){
          setAdjustersStatus(JSON.parse(JSON.stringify(adjustersStatus)));
          toast.error(`error: ${message["errorCode"]}. Message: ${message["message"]}`);
        }
        else{
          adjustersStatus[directMethod]['currentValue'] = '' + value;
          setAdjustersStatus(JSON.parse(JSON.stringify(adjustersStatus)));
          toast.info(`${directMethod} send to Device ${device.deviceId} with payload ${value}`);
        }
      }
      setActiveDimmer(false)
    }).catch(error =>{
      toast.error(error);
      setActiveDimmer(false)
    });
  }

  return (
    <Segment basic textAlign={"center"}>
      <Dimmer active={activeDimmer}>
        <Loader size='massive'>Requesting</Loader>
      </Dimmer>
      <Grid>
        <Grid.Row className='segmentClassNoPadding' columns={3} >
          <Grid.Column className='segmentClassNoPadding'>
            {
              Object.keys(switches).map((key, index) =>
                {
                  return (
                      switches[key].length === 2?
                      (
                        <Segment  key={uuid()} className="BottomPadding" basic textAlign={"center"}>
                          <Button.Group key={key}>
                            <Button active={switchesStatus[key] === switches[key][0]} index='0' switchname={key} key='{key}_{switches[key][0]}' onClick={sendMessageSwitch} inverted size='mini' color='purple'>{switches[key][0]}</Button>
                            <Button.Or key={uuid()} text='vs' />
                            <Button active={switchesStatus[key] === switches[key][1]} index='1' switchname={key} key='{key}_{switches[key][1]}' onClick={sendMessageSwitch} inverted size='mini' color='purple'>{switches[key][1]}</Button>
                          </Button.Group >
                        </Segment>
                      )
                      : (<div key={uuid()}></div>)
                  )
                }
              )
            }
          </Grid.Column>
          <Grid.Column className='segmentClassNoPadding'>
            { buttons.map((button) =>
                {
                  return (
                    <Segment  key={uuid()} className="BottomPadding" basic textAlign={"center"}>
                      <Button key={button} onClick={sendMessageButton} inverted size='small' color='purple'>{button}</Button>
                    </Segment>
                  )
                }
              )
            }
          </Grid.Column>
          <Grid.Column className='segmentClassNoPadding'>
            <List>
              { adjusters.map((adjuster) =>
                  {
                    return (
                      <Segment  key={uuid()} className="BottomPadding" basic textAlign={"center"}>
                        <List.Item key={uuid()}>
                          <Slider
                            key={adjuster['name']}
                            onChangeCommitted={(value) => sendMessageRange(value, adjuster['name'])}
                            defaultValue={parseFloat(adjustersStatus[adjuster['name']]['currentValue'], 10)}
                            min={parseFloat(adjuster['values']['min'], 10)}
                            step={parseFloat(adjuster['values']['step'], 10)}
                            max={parseFloat(adjuster['values']['max'], 10)}
                            graduated progress
                          />
                          <Label key={uuid()} as='a' basic pointing color='purple' horizontal>{adjuster['name']}</Label>
                        </List.Item>
                      </Segment>
                    )
                  }
                )
              }
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  )
};

export default memo(Controller);