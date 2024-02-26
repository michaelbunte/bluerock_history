import logo from './logo.svg';
import './App.css';
import MyChart from './MyChart';
import Box from './Box';
import { SmartTable } from 'adminlte-2-react';

import { useState, useEffect } from 'react';
import {
  initialize_modal_table_dict,
  create_modal_table,
  update_selected_sensor,
  ChartHolder,
  get_selected_sensors,
  query_selected_sensors
} from './helperfuncs';

let host_string = "ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001";
// let host_string = "localhost:5001";

function get_cache_size(brush_1, brush_2) {
  let brush_1_date = new Date(brush_1);
  let brush_2_date = new Date(brush_2);
  let width = brush_2_date.getTime() - brush_1_date.getTime();
  let middle_time = brush_1_date.getTime() / 2 + brush_2_date.getTime() / 2;
  return { start: new Date(middle_time - width), end: new Date(middle_time + width) };
}

function App() {
  const [modal_table_dict, set_modal_table_dict] = useState(initialize_modal_table_dict());
  const [current_modal_data, set_current_modal_data] = useState([]);
  const [data, set_data] = useState([[]]);
  const [time_brush_1, set_time_brush_1] = useState(1611296444000);
  const [time_brush_2, set_time_brush_2] = useState(1613974844000);
  const [last_received_time, set_last_received_time] = useState(0);
  const [cache_dimensions, set_cache_dimensions] = useState({ start: new Date(), end: new Date() });
  const [time_brush_image, set_time_brush_image] = useState({ start: new Date(), end: new Date() });
  const [current_modal_string, set_current_modal_string] = useState("");
  const [ticking, setTicking] = useState(true);
  const [is_loading, set_is_loading] = useState(false);
  const [selected_sensor_data, set_selected_sensor_data] = useState({});

  // initial load
  useEffect(() => {
    async function fetch_data() {
      let start_date = new Date('2021-01-03');
      let end_date = new Date('2021-01-05');
      set_is_loading(true);
      // set up the modal table dict
      let sensor_table_string = `http://${host_string}/bluerock/sensor_info_table`;
      let sensor_table_response = await fetch(sensor_table_string);
      let sensor_table_json = await sensor_table_response.json();
      let created_dict = create_modal_table(
        "bluerock",
        sensor_table_json,
        set_current_modal_string,
        set_current_modal_data
      );
      set_modal_table_dict(created_dict);
      let cache_size = get_cache_size(start_date, end_date);
      set_cache_dimensions(cache_size);
      set_time_brush_image({ start: start_date, end: end_date });
      await query_selected_sensors(modal_table_dict, cache_size, set_selected_sensor_data);
      set_time_brush_1(start_date.getTime());
      set_time_brush_2(end_date.getTime())
      set_is_loading(false);
    }
    fetch_data();
  }, [])


  // move forward in time
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ticking || is_loading) { return; }
      set_time_brush_1(prev => prev + 100000);
      set_time_brush_2(prev => prev + 100000);

      if (time_brush_2 > (time_brush_image["end"].getTime() + cache_dimensions["end"].getTime()) / 2) {
        const update = async () => {
          let cache_size = get_cache_size(time_brush_1, time_brush_2);
          set_cache_dimensions(cache_size);
          set_time_brush_image({ start: new Date(time_brush_1), end: new Date(time_brush_2) });

          // Only update the cache if we haven't received a time that's later
          if (cache_size["end"].getTime() > last_received_time) {
            set_last_received_time(cache_size["end"].getTime());
            await query_selected_sensors(modal_table_dict, cache_size, set_selected_sensor_data);
          }

        }
        update();
      }
    }, 0.333e3)
    return () => clearTimeout(timer)
  }, [time_brush_1, time_brush_2, ticking, is_loading]);

  const on_window_resize = async () => {
    set_is_loading(true);
    let cache_size = get_cache_size(time_brush_1, time_brush_2);
    set_cache_dimensions(cache_size);
    await query_selected_sensors(modal_table_dict, cache_size, set_selected_sensor_data);
    set_is_loading(false);
  }

  const mychart1 = <MyChart
    data={data}
    width={700}
    height={300}
    loading={is_loading}
    hide_closest_point={false}
    title="this is an example title"
    time_brush_1={time_brush_1}
    set_time_brush_1={set_time_brush_1}
    time_brush_2={time_brush_2}
    set_time_brush_2={set_time_brush_2}
    on_final_window_resize={on_window_resize}
  />

  let charts = get_selected_sensors(modal_table_dict, "display").map((key) => {
    return <MyChart
      data={selected_sensor_data[key]}
      width={700}
      height={300}
      loading={is_loading || !selected_sensor_data.hasOwnProperty(key)}
      hide_closest_point={false}
      title={modal_table_dict[key]["human_readible_name"]}
      time_brush_1={time_brush_1}
      set_time_brush_1={set_time_brush_1}
      time_brush_2={time_brush_2}
      set_time_brush_2={set_time_brush_2}
      on_final_window_resize={on_window_resize}
    />
  })

  console.log(selected_sensor_data)

  const tableColumns = [
    { title: 'Sensor', data: 'sensor' },
    { title: 'Display', data: 'selectbox_display' },
    { title: 'Download', data: 'selectbox_download' },
  ];

  let sensor_table_data = Object.keys(modal_table_dict)
    .map(key => ({
      "sensor": modal_table_dict[key]["human_readible_name"],
      "selectbox_display": <input
        type="checkbox"
        onChange={(e) => {
          if (e.target.checked && get_selected_sensors(modal_table_dict, "display").length >= 5) {
            window.confirm("Only 5 charts at a time can be displayed");
            return;
          }

          update_selected_sensor(
            set_modal_table_dict,
            key,
            e.target.checked,
            "display"
            );
          const update_sensors = async () => {
            let cache_size = get_cache_size(time_brush_1, time_brush_2);
            set_is_loading(true);
            
            let updated_modal_table_dict = {
              ...modal_table_dict,
              [key]: {
                ...modal_table_dict[key],
                is_selected_display: e.target.checked
              }
            };
            await query_selected_sensors(updated_modal_table_dict, cache_size, set_selected_sensor_data);
            set_is_loading(false);
          };
          update_sensors();
        }}
        checked={modal_table_dict[key]["is_selected"]}
      />
    }))
    .filter(a => a["sensor"] !== undefined && a["sensor"] !== "")
    .sort((a, b) => a["sensor"].localeCompare(b["sensor"]));

  const sensor_table = <SmartTable
    data={sensor_table_data}
    columns={tableColumns}
    striped={true}
    condensed={true}
    pageSize={10}
    selectedRows={[]}
  />
  return (
    <div>
      <Box contents={charts} />
      <Box contents={sensor_table} />
    </div>
  );
}

/*
    int_chart_map={
      [
        ["0", "stopped", "red"],
        ["1", "stopped", "red"],
        ["2", "production", "green"],
        ["3", "standby", "yellow"],
        ["4", "feed flush", "blue"],
        ["5", "permeate flush", "purple"],
        ["6", "permeate flush", "purple"],
        ["7", "permeate flush", "purple"],
        ["8", "permeate flush", "purple"],
      ]
    }
*/

export default App;
