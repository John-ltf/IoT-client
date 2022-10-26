import {Icon} from 'semantic-ui-react';
import React, { useState, useEffect, memo } from 'react';

const DeviceBattery = ({ value }) => {
  if(value > 95)
    return (<Icon disabled name='battery full' color="green" />)
  else if(value > 75)
    return (<Icon disabled name='battery three quarters' color="green" />)
  else if(value > 50)
    return (<Icon disabled name='battery half' color="green" />)
  else if(value > 25)
    return (<Icon disabled name='battery quarter' color="orange" />)
  return (<Icon disabled name='battery empty' color="red" />)
};

export default memo(DeviceBattery);