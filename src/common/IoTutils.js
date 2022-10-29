function getDeviceName(device){
    if(device === null || typeof device  === 'undefined') //no device is set
        return "";

    if(device.tags.tags.NickName &&
      device.tags.tags.NickName !== 'null') //return nickname
      return device.tags.tags.NickName;

    let tokens = device.deviceId.split("_"); //return device Id without MAC
    if(tokens.constructor === Array)
        return tokens.slice(0,tokens.length-1).join("_")
    return device.deviceId; //return device Id
}

function getTag(device, tag){
  if(device === null|| typeof device === 'undefined') //no device is set
        return "";
  if(tag in device.tags.tags)
    return device.tags.tags[tag];
  return "";
}

function setTag(device, tag, value, addNewEntry = true){
  if(typeof value !== 'string')
    value = value.toString()

  if(device === null|| typeof device === 'undefined') //no device is set
        return false;
  if(tag in device.tags.tags)
    device.tags.tags[tag] = value;
  if(addNewEntry)
    device.tags.tags[tag] = value;
  return true;
}

function getMac(device){
    if(device === null|| typeof device === 'undefined') //no device is set
        return "";

    if(device.reportedProperties && 'Mac' in device.reportedProperties )
      return device.reportedProperties.Mac;

      if(device.reportedProperties && 'MAC' in device.reportedProperties )
      return device.reportedProperties.MAC;

    let tokens = device.deviceId.split("_"); //get it from the device Id
    const pattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{3})$/
    if(tokens.constructor === Array &&
      pattern.test(tokens[tokens.length-1]))
      return tokens[tokens.length-1];

    return null;
}

function getReportedProperty(device, property){
  if(device === null|| typeof device === 'undefined') //no device is set
      return "";

  if(device.reportedProperties && property in device.reportedProperties )
    return device.reportedProperties[property];
  return null;
}

function getDesiredProperty(device, property){
  if(device === null|| typeof device === 'undefined') //no device is set
      return "";

  if(device.desiredProperties && property in device.desiredProperties )
    return device.desiredProperties[property];
  return null;
}

function setDesiredProperty(device, property, value, addNewEntry = true){
  if(typeof value !== 'string')
    value = value.toString()

  if(device === null|| typeof device === 'undefined') //no device is set
      return false;

  if(device.desiredProperties && property in device.desiredProperties )
    device.desiredProperties[property] = value;
  if(addNewEntry)
    device.desiredProperties[property] = value;
  return true;
}

function getReportedUnitProperties(device){
  var unitProperties = {}
  Object.keys(device.reportedProperties).map(key => {
    if (key.startsWith("unit_")){
      unitProperties[key.substring(5)] = device.reportedProperties[key]
    }
  })
  return unitProperties
}

function getStatus(device) {
  if(device === null|| typeof device === 'undefined') //no device is set
      return "";
  return device.status;
}

function isEnabled(device){
  if(getStatus(device) === 'Enabled')
    return true
  return false
}

function switchedStatus(device){
  if(device.status === 'Disabled')
    return 'Enabled'
  return 'Disabled'
}

function toBoolean(value){
  return (value === 'true' || value === 'True' || value === 'TRUE')? true : false
}

function getDateTime(dateTime){
  const t = new Date(dateTime).getTime();
  return  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(t)
}

function getTime(dateTime){
  const t = new Date(dateTime).getTime();
  return  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(t)
}

function getDate(dateTime){
  const t = new Date(dateTime).getTime();
  return  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit'}).format(t)
}

function getMonth(dateTime){
  const t = new Date(dateTime).getTime();
  if(new Date().getFullYear() !== new Date(dateTime).getFullYear())
   return  [new Intl.DateTimeFormat('en-US', { month: 'short' }).format(t), new Date(dateTime).getFullYear()]
return  new Intl.DateTimeFormat('en-US', { month: 'short' }).format(t)
}

function getDayInMonth(dateTime){
  const t = new Date(dateTime).getTime();
  return  new Intl.DateTimeFormat('en-US', {day: '2-digit'}).format(t)
}

function getMonthNum(dateTime){
  const t = new Date(dateTime).getTime();
  return  new Intl.DateTimeFormat('en-US', {month: '2-digit'}).format(t)
}

function getYear(dateTime){
  const t = new Date(dateTime).getTime();
  return  new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(t)
}

function isCurrentDay(timestamp){
  var today = new Date().setHours(0, 0, 0, 0);
  var evalDay = new Date(timestamp).setHours(0, 0, 0, 0);
  if(today === evalDay)
    return true;
  return false;
}

export default {
  getDeviceName,
  getMac,
  getTag,
  setTag,
  getStatus,
  getDesiredProperty,
  setDesiredProperty,
  getReportedProperty,
  getReportedUnitProperties,
  isEnabled,
  switchedStatus,
  toBoolean,
  getDateTime,
  getTime,
  getDate,
  getMonth,
  getMonthNum,
  getDayInMonth,
  getYear,
  isCurrentDay
};