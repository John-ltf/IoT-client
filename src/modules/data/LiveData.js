import {Statistic, Label, Header, Segment, Dimmer, Loader} from 'semantic-ui-react';
import React, { memo } from 'react';
import IotUtils from '../../common/IoTutils';

const LiveData = ({ deviceData }) => {
  const hourInSeconds= 60*60;

  function getMetrics(){
    switch(deviceData["deviceType"]) {
      case 'LYWSD03MMC':
        return (<Statistic.Group className='statistisClass' size="large">
                  <Statistic color="purple" inverted>
                    <Statistic.Value>{deviceData["recentData"]["telemetry"]["temperature"]}</Statistic.Value>
                    <Statistic.Label color="purple">temperature - ({deviceData["deviceUnits"]["temperature"]})</Statistic.Label>
                  </Statistic>
                  <Statistic color="purple" inverted>
                    <Statistic.Value>{deviceData["recentData"]["telemetry"]["humidity"]}</Statistic.Value>
                    <Statistic.Label>humidity - (%)</Statistic.Label>
                  </Statistic>
                </Statistic.Group>);

      case 'MIBFS':
        return (<Statistic.Group className='statistisClass' size="medium">
                  <Statistic color="purple" inverted>
                    <Statistic.Value>{Math.round(deviceData["recentData"]["telemetry"]["bodyFat"] * 100) / 100}</Statistic.Value>
                    <Statistic.Label color="purple">body Fat - (%)</Statistic.Label>
                  </Statistic>
                  <Statistic color="purple" inverted>
                    <Statistic.Value>{deviceData["recentData"]["telemetry"]["weight"]}</Statistic.Value>
                    <Statistic.Label>weight - ({deviceData["deviceUnits"]["weight"]})</Statistic.Label>
                  </Statistic>
                  <Statistic color="purple" inverted>
                    <Statistic.Value>{Math.round(deviceData["recentData"]["telemetry"]["muscle"] * 100) / 100}</Statistic.Value>
                    <Statistic.Label>muscle - ({deviceData["deviceUnits"]["muscle"]})</Statistic.Label>
                  </Statistic>
                </Statistic.Group>);
      default:
        return (<></>);
    }
  }

  if(deviceData === null)
    return (
      <>
        <Dimmer active>
          <Loader size='massive'>Loading</Loader>
        </Dimmer>
        <Header inverted as='h1'>No Recent Data</Header>
      </>
    )
  else if(deviceData["recentData"] === undefined)
  return (
    <Header inverted as='h1'>No Recent Data</Header>
  )

  return (
    <>
      {
        deviceData != null?
        (
          getMetrics()
        ) : (<div></div>)
      }
      {
        deviceData != null?
        (
          <Label color="purple">
            {IotUtils.getDateTime(deviceData["recentData"]["telemetry"]["time"])}
          </Label>
        ) : (<div></div>)
      }
      {
        ((Date.now() - (new Date(deviceData["recentData"]["telemetry"]["time"])).getTime())/1000) >= hourInSeconds?
        <Label color='red'>
          Not Recent Data
        </Label>
        : null
      }

    </>
  )
};

export default memo(LiveData);