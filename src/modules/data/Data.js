var _deviceData_ = {
  deviceId: null,
  deviceType: null,
  deviceUnits: null,
  recentData: null,
  historyData: null
}
function getDeviceLiveData(){
  return {
    deviceId: _deviceData_.deviceId,
    deviceType: _deviceData_.deviceType,
    deviceUnits: _deviceData_.deviceUnits,
    recentData: _deviceData_.recentData,
    historyData: null
  };
}
function getDeviceHistoryData(){
  return {
    deviceId: _deviceData_.deviceId,
    deviceType: _deviceData_.deviceType,
    deviceUnits: _deviceData_.deviceUnits,
    recentData: null,
    historyData: _deviceData_.historyData
  };
}
function deviceReset(){
  _deviceData_["deviceId"]  = null;
  _deviceData_["deviceType"]  = null;
  _deviceData_["deviceUnits"] = null;
  _deviceData_["recentData"]  = null;
  _deviceData_["historyData"]  = null;
}
function allSet(){
  if(_deviceData_["deviceType"] !== null &&
  _deviceData_["deviceUnits"] !== null &&
  _deviceData_["recentData"] !== null)
    return true
  return false;
}
function allHistorySet(){
  if(_deviceData_["deviceType"] !== null &&
  _deviceData_["deviceUnits"] !== null &&
  _deviceData_["historyData"] !== null)
    return true
  return false;
}
function setDeviceId(deviceId){
  _deviceData_["deviceId"] = deviceId;
}
function setDeviceType(deviceType){
  _deviceData_["deviceType"] = deviceType;
  return allSet()? true: false;
}
function setDeviceUnits(deviceUnits){
  _deviceData_["deviceUnits"] = deviceUnits;
  return allSet()? true: false;
}
function setDeviceRecentData(recentData){
  _deviceData_["recentData"] = recentData;
  return allSet()? true: false;
}
function setDeviceRecentDataIfNotExist(recentData){
  if(_deviceData_["recentData"] != null)
    return false;
  _deviceData_["recentData"] = recentData;
  return allSet()? true: false;
}
function setHistory(historyData){
  if(_deviceData_["historyData"] === null)
    _deviceData_["historyData"] = []
  if(Array.isArray(historyData))
    _deviceData_["historyData"] = _deviceData_["historyData"].concat(historyData);
  else
    _deviceData_["historyData"].unshift(historyData);
  return allHistorySet()? true: false;
}

export default{
  getDeviceLiveData,
  getDeviceHistoryData,
  deviceReset,
  allHistorySet,
  setDeviceId,
  setDeviceType,
  setDeviceUnits,
  setDeviceRecentData,
  setDeviceRecentDataIfNotExist,
  setHistory
};
