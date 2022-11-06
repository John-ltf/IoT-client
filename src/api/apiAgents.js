import axios from 'axios';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

var IoTApiHeader = {
  'Authorization': ''
}
var IoTFuncApiHeader = {
  'Authorization': ''
}

var IoTMessagingHeaders = {
  'accept': 'text/plain',
  'Content-Type': 'application/json'
}

const setIoTApiAccessToken = (accessToken) => {
  IoTApiHeader['Authorization'] = `Bearer ${accessToken}`;
  IoTMessagingHeaders['Authorization'] = `Bearer ${accessToken}`;
}

const setFuncIoTApiAccessToken = (accessToken) => {
  IoTFuncApiHeader['Authorization'] = `Bearer ${accessToken}`;
}

axios.interceptors.response.use(response => response, error => {
  if ( error.response ) {
    const { status, headers } = error.response;
    toast.error(status + ":" + error.message);
    if (status === 401 && headers['www-authenticate'] === 'Bearer error="invalid_token", error_description="The token is expired"') {
      window.localStorage.removeItem('jwt');
    }
  }
  else if (error.message === 'Network Error' && !error.response) {
    toast.error('Network error');
  }
  throw error.response;
});

const responseBody = (response) => response.data;

const Devices = {
  list: (parameters) =>
    axios.get('/devices/list?', {headers: IoTApiHeader, params: parameters}).then(responseBody)
}

const Device = {
  get: (deviceId, parameters) =>
    axios.get(`/device/${deviceId}?`, {headers: IoTApiHeader, params: parameters}).then(responseBody),
  setEnabled: (deviceId, parameters) =>
    axios.put(`/device/${deviceId}/status/Enabled?`, null, {headers: IoTApiHeader, params: parameters}).then(responseBody),
  setDisabled: (deviceId, parameters) =>
    axios.put(`/device/${deviceId}/status/Disabled?`,  null, {headers: IoTApiHeader, params: parameters}).then(responseBody),
  delete: (deviceId, parameters) =>
    axios.delete(`/device/${deviceId}?`, {headers: IoTApiHeader, params: parameters}).then(responseBody),
  update: (deviceId, parameters) =>
    axios.put(`/device/${deviceId}?`, null, {headers: IoTApiHeader, params: parameters}).then(responseBody),
  register: (deviceId, body) =>
    axios.post(`/device/${deviceId}`, body, {headers: IoTApiHeader}).then(responseBody)
}

const History = {
  fetch: (device, timestart, parameters) =>
    axios.get(`${process.env.REACT_APP_SIGNALR_URL}/api/history/${device}/${timestart}`, { headers: IoTFuncApiHeader, params: parameters }).then(responseBody),
  delete: (device, telemetryId, body) =>
    axios.post(`${process.env.REACT_APP_SIGNALR_URL}/api/delete/${device}/${telemetryId}`, body, { headers: IoTFuncApiHeader }).then(responseBody)
}


const IoTMessaging = {
  directMethod: (deviceId, body) =>
    axios.post(`${process.env.REACT_APP_API_IOT_MSG_URL}/direct-method/${deviceId}`, body, {headers: IoTMessagingHeaders }).then(responseBody)
}

const client = axios.create({
  baseURL: process.env.REACT_APP_SIGNALR_URL,
  withCredentials: false,
  headers: {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    }
});

const signalR = {
  init: (endpoint, user, functionHandler) =>
    client.post(`/api/negotiate/${endpoint}?userid=${user}`, null, {headers: IoTFuncApiHeader }).then(resp => {
      const info = resp.data;
      info.accessToken = info.AccessToken || info.accessKey;
      info.url = info.Url || info.endpoint;
      const options = {
          accessTokenFactory: () => info.accessToken
      };
      const newConnection = new HubConnectionBuilder()
        .withUrl(info.url, options)
        .build();
      functionHandler(newConnection);
    }).catch(error =>{
      toast.error(error);
    }),
  start: (connection, onNewMessage, onNewConnection, onCloseConnection, streamingType) => {
    connection.start()
      .then(result => {
        toast.info(`${streamingType} streaming started`);
        connection.on('newMessage', onNewMessage);
        connection.on('newConnection', onNewConnection)
        connection.onclose(onCloseConnection);
      })
      .catch(error =>{
        toast.error(error);
      });
  }
}

export default {
  setIoTApiAccessToken,
  setFuncIoTApiAccessToken,
  client,
  Devices,
  Device,
  IoTMessaging,
  signalR,
  History
};