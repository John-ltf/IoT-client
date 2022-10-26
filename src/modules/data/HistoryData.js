import {Tab} from 'semantic-ui-react';
import React, { memo } from 'react';
import HistoryDataTable from './HistoryDataTable';
import HistoryDataChart from './HistoryDataChart';
import 'react-toastify/dist/ReactToastify.css';

function HistoryData({deviceData}){

  if(deviceData === null)
    return (<div></div>)

  const ChartDataPane = {
    menuItem: 'Metrics Chart',
    render: () => <HistoryDataChart deviceData={deviceData}></HistoryDataChart>
  }

    const historyDataPane = {
    menuItem: 'History Table',
    render: () => <HistoryDataTable deviceData={deviceData}></HistoryDataTable>
  }

  return (<Tab menu={{ pointing: true }} panes={[ChartDataPane, historyDataPane]} />)
}


export default memo(HistoryData);