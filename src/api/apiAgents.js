import axios from 'axios';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.request.use(
  config => {
    const token = window.localStorage.getItem('jwt');
    if (token) config.headers.Authorization = `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJleHAiOjE2NjY3NzY5NTksIm5iZiI6MTY2Njc3MzM1OSwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9qb2hubHRmLmIyY2xvZ2luLmNvbS9lYmFiM2VkNi0wM2NlLTQwZWUtYjk5OS04NDk3MzAyODExMTkvdjIuMC8iLCJzdWIiOiJhYzE1ZDVjNi0yODUxLTRkOGYtOGRlMy03YjBlM2VkNTZmODAiLCJhdWQiOiJmMzY3MWY4OS1kZTE3LTRlYjMtYjI0ZC04ZWZiZDFiNTFlYWEiLCJub25jZSI6ImRlZmF1bHROb25jZSIsImlhdCI6MTY2Njc3MzM1OSwiYXV0aF90aW1lIjoxNjY2NzczMzU5LCJuYW1lIjoiR2lhbm5pcyBMYXRpZmlzIiwiaWRwIjoiZ29vZ2xlLmNvbSIsImNvdW50cnkiOiJHcmVlY2UiLCJlbWFpbHMiOlsibGF0aWZpcy5naWFubmlzQGdtYWlsLmNvbSJdLCJ0ZnAiOiJCMkNfMV9zaWdudXBzaWduaW4xIn0.qBP8wtt2PKGE1FrbimVUf6C3Z_bammIIeZ_jw-t8QhK4F6cPh4amkKO0nFqHvmtRIU70017PQJuhWbCqoFk4Xq9FkgALia0QPkVbO4l-VWDVdq2rmUmluAX0Q7b5rkKs1uEOGkWRywXkLxonwBGUbyQmhOsj_faq98wihqClB8Qrxo4FGSfmI0sEmtpzidQa7mlTt_u3yB9LfvusUeFKEVTgk5EmWwl-NcVIrbZyRj0CV-ZlAc5ERUH43voWn-olCgADK95K4Xnd6Kuu4qO_3NXT2cQg-E6_PQOueESXdtigzfX76o4psEkIDnTHUr5Bd2cBG4wYJ3RJei9U88NYiw`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

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
    axios.get('/devices/list?', { params: parameters }).then(responseBody)
}

const Device = {
  get: (deviceId, parameters) =>
    axios.get(`/device/${deviceId}?`, { params: parameters }).then(responseBody),
  setEnabled: (deviceId, parameters) =>
    axios.put(`/device/${deviceId}/status/Enabled?`, null, { params: parameters }).then(responseBody),
  setDisabled: (deviceId, parameters) =>
    axios.put(`/device/${deviceId}/status/Disabled?`,  null, { params: parameters }).then(responseBody),
  delete: (deviceId, parameters) =>
    axios.delete(`/device/${deviceId}?`, { params: parameters }).then(responseBody),
  update: (deviceId, parameters) =>
    axios.put(`/device/${deviceId}?`, null, { params: parameters }).then(responseBody),
  register: (deviceId, body) =>
    axios.post(`/device/${deviceId}`, body).then(responseBody)
}

const History = {
  fetch: (device, timestart, parameters) =>
    axios.get(`${process.env.REACT_APP_SIGNALR_URL}/api/history/${device}/${timestart}`, { params: parameters }).then(responseBody),
  delete: (device, telemetryId, body) =>
    axios.post(`${process.env.REACT_APP_SIGNALR_URL}/api/delete/${device}/${telemetryId}`, body).then(responseBody)
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
    client.post(`/api/negotiate/${endpoint}?userid=${user}`, null).then(resp => {
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
  client,
  Devices,
  Device,
  signalR,
  History
};