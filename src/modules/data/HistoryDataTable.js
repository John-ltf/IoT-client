import {Tab, Table, Button, Icon} from 'semantic-ui-react';
import React, {useState, memo } from 'react';
import IotUtils from '../../common/IoTutils';
import apiAgents from '../../api/apiAgents';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HistoryDataTable = ({deviceData}) =>{
  const [rows, setRows] = useState(50);

  const removeTableRow = event => {
    event.preventDefault();
    const deviceId = deviceData.deviceId;
    const telemetryid = event.target.getAttribute("telemetryid");
    const pos = event.target.getAttribute("pos");

    apiAgents.History.delete(deviceId, telemetryid, {'user':'john'}).then(response => {
      deviceData.historyData[pos]["disabled"] = true;

      let el = event.target;
      while(! (el instanceof HTMLTableRowElement))
        el = el.parentElement;
      el.classList.add("disabled");

    }).catch(error =>{
      toast.error(error);
    });
  }
  const loadMore = () => {
    setRows(rows+50)
  }

  const historyTableHeader = () =>(
    <Table.Header>
          <Table.Row>
            <Table.HeaderCell key='time'></Table.HeaderCell>
            {
              Object.keys(deviceData.deviceUnits).map((key, index) =>
                {
                  return (
                    deviceData.deviceUnits[key] === "percentage"?
                      <Table.HeaderCell key={key}>{key} - (%)</Table.HeaderCell>
                    :
                      <Table.HeaderCell key={key}>{key} - ({deviceData.deviceUnits[key]})</Table.HeaderCell>
                  )
                }
              )
            }
            <Table.HeaderCell key='action'></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
  )

  return (
    <Tab.Pane attached={false} >
      <Table striped size='small'>
        {historyTableHeader()}

        <Table.Body>
          {deviceData.historyData.slice(0, rows).filter(data => !("disabled" in data)).map((data,i) =>
            {
              return (
                <Table.Row id={data.id} key={data.id}>
                  <Table.Cell key="{data.id}_time" >{IotUtils.getDateTime(data["telemetry"]["time"])}</Table.Cell>
                  {
                    Object.keys(deviceData.deviceUnits).map((key, index) =>
                      {
                        const cell_key = `${data.id}_${index}`
                        return (<Table.Cell key={cell_key} >{Math.round(data["telemetry"][key]* 100) / 100}</Table.Cell>)
                      }
                    )
                  }
                  <Table.Cell key="{data.id}_delete">
                    <Button onClick={removeTableRow} telemetryid={data.id} pos={i} icon>
                      <Icon telemetryid={data.id} pos={i} name='delete' color="red"/>
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )
            }
          )}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="100%">
            <Button basic color='blue' fluid onClick={loadMore} >Load More</Button>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>

      </Table>
    </Tab.Pane>
  )
}

export default memo(HistoryDataTable);