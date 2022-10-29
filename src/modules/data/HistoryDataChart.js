import React, {useState, useEffect, useRef, memo } from 'react';
import {Segment, Button} from 'semantic-ui-react';
import IotUtils from '../../common/IoTutils';
import { toast } from 'react-toastify';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

const HistoryDataChart = ({deviceData}) =>{
  const chartRef = useRef();
  const [metricType, setMetricType] = useState(null);
  const [labels, setLabels] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(50);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    if(deviceId !== deviceData.deviceId){ //different device
      setDeviceId(deviceData.deviceId)
      setMetricType(null)
      setLabels([])
      setMetrics([])
      setStartIndex(0)
      setEndIndex(50)
    }
    else if(startIndex === 0){ // monitoring latest data, refresh chart including new data
      setStartIndex(0)
      setEndIndex(endIndex+1)
    }
  }, [deviceData]);

  useEffect(() => {
    /* The array contains the data/timestamps in desc order, so treat them this way*/
    if(deviceData.historyData.length === 0)
      return

    if(startIndex<0){
      setStartIndex(0)
      return;
    }
    if(endIndex>deviceData.historyData.length-1){
      setEndIndex(deviceData.historyData.length-1)
      return;
    }

    const startTimestamp = new Date(deviceData.historyData[startIndex]["telemetry"]["time"]).getTime();
    const endTimestamp = new Date(deviceData.historyData[endIndex]["telemetry"]["time"]).getTime();
    var datetimeFormatHandler = IotUtils.getDateTime

    if((endTimestamp-startTimestamp)/1000 > 60*60*24*30) //data beyond a month
      datetimeFormatHandler = IotUtils.getMonth
    else if((endTimestamp-startTimestamp)/1000 <= 60*60*24){ //data in day
      if(IotUtils.isCurrentDay(endTimestamp))
        datetimeFormatHandler = IotUtils.getTime
      else
        datetimeFormatHandler = IotUtils.getDateTime
    }
    else if((endTimestamp-startTimestamp)/1000 <= 60*60*24*30) //data in month
      datetimeFormatHandler = IotUtils.getDate

    let timeLabels = []
    timeLabels = deviceData.historyData.slice(startIndex, endIndex).filter(data => !("disabled" in data)).map((data,i) =>
    {
      return datetimeFormatHandler(data["telemetry"]["time"])
    });
    timeLabels.reverse()
    setLabels(timeLabels);

    if(metricType !== null){
      const m = getMetrics(metricType)
      setMetrics(m);
    }

  }, [deviceId, startIndex, endIndex]);

  const getMetrics = (t) =>{
    let metricsArr = []
    metricsArr = deviceData.historyData.slice(startIndex, endIndex).filter(data => !("disabled" in data)).map((data,i) =>
    {
      return data["telemetry"][t]
    });
    metricsArr.reverse();
    return metricsArr;
  }

  ChartJS.register(
    CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
  );

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: '',
      },
      legend: {
        display: false
      }
    },
    elements: {
      point:{
          radius: 0
      }
    },
    scales: {
      y: {
        type: 'linear' ,
        display: true,
        position: 'left',
        grid: {
          display: false
        }
      },
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10
        },
        grid: {
          display: false
        }
      }
    },
  };

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        borderColor: 'purple',
        backgroundColor: 'rgb(214, 106, 247)',
        yAxisID: 'y',
        xAxisID: 'x',
        data: metrics
      }
    ],
  };

  const handleMetricSelect = event => {
    const t = event.target.getAttribute('value')
    setMetricType(t)
    const m = getMetrics(t)
    setMetrics(m);
  }

  /*Interacting with chart - event handlers*/
  var mouseDownIndex;
  var timer;
  let preventZoomInStart = false;
  let preventZoomInEnd = false;
  const onZoomInStart = (event) => {
    timer = setTimeout(function() {
      if(!preventZoomInStart){
        mouseDownIndex = -1;
        const points = chartRef.current.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: false }, true);
        if (points.length)
          mouseDownIndex = points[0].index
      }
      preventZoomInStart = false;
    }, 250);
  }
  const onZoomInEnd = (event) => {
    timer = setTimeout(function() {
      if(!preventZoomInEnd){
        var mouseUpIndex=-1;
        const points = chartRef.current.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: false }, true);
        if (points.length)
          mouseUpIndex = points[0].index

        if(mouseDownIndex < 0 || mouseDownIndex < 0){
          toast.error("failed to zoom in");
          return;
        }

        var diffEnd   = (mouseDownIndex<mouseUpIndex)? mouseUpIndex  : mouseDownIndex;
        var diffStart = (mouseDownIndex<mouseUpIndex)? mouseDownIndex : mouseUpIndex;
        if(diffEnd === diffStart) //is double click, case when 2 instant double clicks happen
          return;

        setStartIndex(endIndex-diffEnd-1)
        setEndIndex(endIndex-diffStart)
      }
      preventZoomInEnd = false;
    }, 250);

  }
  const onZoumOut = () => {
    clearTimeout(timer);
    preventZoomInStart = true;
    preventZoomInEnd = true;

    setStartIndex(startIndex-20)
    setEndIndex(endIndex+20)
  }


  return (
    <div>
      <Segment color='purple'>
        <Line
          ref={chartRef}
          onTouchStart={onZoomInStart}
          onTouchEnd={onZoomInEnd}
          onMouseDown={onZoomInStart}
          onMouseUp={onZoomInEnd}
          onDoubleClick={onZoumOut}
          options={options}
          data={data}
        />
        <Segment inverted>
        {
          Object.keys(deviceData.deviceUnits).map((key, index) =>
            {
              return (
                <Button inverted onClick={handleMetricSelect} value={key} key={key} color='purple'>{key}</Button>
              )
            }
          )
        }
        </Segment>
      </Segment>
    </div>
  )

}

export default memo(HistoryDataChart);