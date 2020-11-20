import "./App.css";
import { Component } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import axios from "axios";
import Websocket from "react-websocket";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: "candle",
          data: [],
        },
      ],
      realSeries: [
        {
          name: "candle",
          data: [],
        },
      ],
      options: {
        chart: {
          height: 350,
          type: "candlestick",
          // toolbar: {
          //   show: false,
          // },
        },
        annotations: {
          xaxis: [
            {
              x: "Oct 06 14:00",
              borderColor: "#00E396",
              label: {
                borderColor: "#00E396",
                style: {
                  fontSize: "12px",
                  color: "#fff",
                  background: "#00E396",
                },
                orientation: "horizontal",
                offsetY: 7,
                text: "Annotation Test",
              },
            },
          ],
        },
        tooltip: {
          enabled: true,
        },
        xaxis: {
          type: "category",
          labels: {
            formatter: function (val) {
              return dayjs(val).format("MMM DD HH:mm");
            },
          },
        },
        yaxis: {
          show: true,
          tooltip: {
            enabled: true,
          },
        },
        grid: {
          show: false,
        },
      },
    };
  }

  async componentDidMount() {
    const data = await axios.get(
      `https://www.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1m`
    );
    let array = [];
    for (let i = 0; i < data.data.length; i++) {
      let obj = {};
      let y = [];
      obj.x = new Date(data.data[i][0]);
      y.push(data.data[i][1]);
      y.push(data.data[i][2]);
      y.push(data.data[i][3]);
      y.push(data.data[i][4]);
      obj.y = y;
      array.push(obj);
    }
    let series = [{ name: "candle", data: [...array] }];
    this.setState({
      series: series,
    });
  }

  async handleData(data) {
    let array = [...this.state.realSeries[0].data];
    let obj = {};
    let y = [];
    obj.x = new Date(JSON.parse(data).data.E);
    try {
      if (JSON.parse(data)?.data?.k) {
        y.push(JSON.parse(data).data.k.o);
        y.push(JSON.parse(data).data.k.h);
        y.push(JSON.parse(data).data.k.l);
        y.push(JSON.parse(data).data.k.c);
        obj.y = y;
        array.push(obj);
      }
    } catch (err) {
      console.log(err);
    }
    let realSeries = [{ name: "candle", data: [...array] }];
    await this.setState({
      realSeries: realSeries,
    });
  }

  render() {
    return (
      <div className="App">
        <div id="chart">
          <h2 style={{ color: "white" }}>Historical Data</h2>
          <Chart
            options={this.state.options}
            series={this.state.series}
            type="candlestick"
            height={350}
            toolbar={false}
          />
          <Websocket
            url="wss://stream.binance.com/stream?streams=btcusdt@kline_1m"
            onMessage={this.handleData.bind(this)}
          />
          <h2 style={{ color: "white" }}>Current Data</h2>
          <Chart
            options={this.state.options}
            series={this.state.realSeries}
            type="candlestick"
            height={350}
            toolbar={false}
          />
        </div>
      </div>
    );
  }
}

export default App;
