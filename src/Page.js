import logo from './logo.svg';
import './App.css';
import MyChart from './MyChart';
import Box from './Box';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { SmartTable } from 'adminlte-2-react';
import BluerockSchematic from './components/BluerockSchematic';
import { Button, ButtonGroup } from 'adminlte-2-react';
import DateTimePicker from 'react-datetime-picker'
import { useState, useEffect } from 'react';
import {
  initialize_modal_table_dict,
  create_modal_table,
  update_selected_sensor,
  ChartHolder,
  get_selected_sensors,
  query_selected_sensors,
  binary_search_cache,
  update_current_sensor_values,
  PlaybackSpeed,
  useWindowDimensions,
  get_full_time_string,
  download_selected_sensors
} from './helperfuncs';

// let host_string = "ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001";
let host_string = "localhost:5001";

function get_cache_size(brush_1, brush_2) {
  let brush_1_date = new Date(brush_1);
  let brush_2_date = new Date(brush_2);
  let width = brush_2_date.getTime() - brush_1_date.getTime();
  let middle_time = brush_1_date.getTime() / 2 + brush_2_date.getTime() / 2;
  return { start: new Date(middle_time - width), end: new Date(middle_time + width) };
}

function App() {
  document.body.style = 'background: #d2d6de;';

  const { height, width } = useWindowDimensions();
  const [modal_table_dict, set_modal_table_dict] = useState(initialize_modal_table_dict());
  const [current_modal_data, set_current_modal_data] = useState([]);
  const [data, set_data] = useState([[]]);
  const [time_brush_1, set_time_brush_1] = useState(1611296444000);
  const [time_brush_2, set_time_brush_2] = useState(1613974844000);
  const [last_received_time, set_last_received_time] = useState(0);
  const [cache_dimensions, set_cache_dimensions] = useState({ start: new Date(), end: new Date() });
  const [time_brush_image, set_time_brush_image] = useState({ start: new Date(), end: new Date() });
  const [current_modal_string, set_current_modal_string] = useState("");
  const [ticking, set_ticking] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [selected_sensor_data, set_selected_sensor_data] = useState({});
  // const [paused, set_paused] = useState(true);
  const [playback_speed, set_playback_speed] = useState(new PlaybackSpeed());
  const [all_sensors_cache, set_all_sensors_cache] = useState([]);
  const [start_download_date, set_start_download_date] = useState(new Date('2021-01-03'));
  const [end_download_date, set_end_download_date] = useState(new Date('2021-01-05'));
  const [download_data_loading, set_download_data_loading] = useState(false);

  const current_time = () => (time_brush_1 + time_brush_2) / 2;

  const update_cache_if_needed = async (override) => {
    function need_to_reupdate_cache() {
      if (all_sensors_cache.length == 0) { return true; }
      let start_time_unix = new Date(all_sensors_cache[0]["plctime"]).getTime();
      let end_time_unix = new Date(all_sensors_cache[all_sensors_cache.length - 1]["plctime"]).getTime();
      let threefourthstime = 3 * (end_time_unix - start_time_unix) / 4 + start_time_unix;
      if (current_time() >= threefourthstime || current_time() <= start_time_unix) { return true; }
      return false;
    }
    if (!override && !need_to_reupdate_cache()) { return; }
    set_playback_speed((prev) => { prev.set_loading(); return prev; })
    let query_string = `http://${host_string}/bluerock/adaptive_all_sensors/`
      + `${new Date(current_time() - playback_speed.get_minor_range()).toISOString()}/${new Date(current_time() + playback_speed.get_range()).toISOString()}`;
    let response = await fetch(query_string);
    let response_json = await response.json();
    set_all_sensors_cache(response_json);
    set_playback_speed((prev) => { prev.set_not_loading(); return prev; });
  }

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

      try {
        let target_index = binary_search_cache(
          all_sensors_cache,
          new Date(current_time()).toISOString()
        );
        update_current_sensor_values(
          set_modal_table_dict,
          all_sensors_cache[target_index]
        );
      } catch (e) { };

      set_time_brush_1(prev => prev + playback_speed.get_current_speed());
      set_time_brush_2(prev => prev + playback_speed.get_current_speed());
      update_cache_if_needed();
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
  }, [time_brush_1, time_brush_2, ticking, is_loading, playback_speed]);

  const on_window_resize = async () => {
    set_is_loading(true);
    let cache_size = get_cache_size(time_brush_1, time_brush_2);
    set_cache_dimensions(cache_size);
    await query_selected_sensors(modal_table_dict, cache_size, set_selected_sensor_data);
    update_cache_if_needed(true);
    set_is_loading(false);
  }

  let selected_sensors = get_selected_sensors(modal_table_dict, "display");
  let charts = selected_sensors.length === 0
    ? <div>Select sensors on the charts panel to display them here</div>
    : selected_sensors.map((key) => {
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

  const tableColumns = [
    { title: 'Sensor', data: 'sensor' },
    { title: 'Display', data: 'selectbox_display' },
    { title: 'Download', data: 'selectbox_download' },
  ];

  let sensor_table_data = Object.keys(modal_table_dict)
    .map(key => ({
      "sensor": modal_table_dict.get(key, "human_readible_name")
        + (modal_table_dict.get(key, "abbreviated_name") && " (" + modal_table_dict.get(key, "abbreviated_name") + ")"),
      "selectbox_display": <input
        type="checkbox"
        onClick={(e) => {
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
        checked={modal_table_dict.get(key, "is_selected_display")}
      />,
      "selectbox_download": <input
        type="checkbox"
        onClick={(e) => {
          update_selected_sensor(
            set_modal_table_dict,
            key,
            e.target.checked,
            "download"
          );
        }}
        checked={modal_table_dict.get(key, "is_selected_download")}
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

  // Search bar was causing buggy behavior - it didn't seem like SmartTable
  // supported a prop to remove the search bar, so here's the workaround
  useEffect(() => {
    const headerElement = document.querySelector('.smartTable-header');
    if (headerElement) {
      headerElement.parentNode.removeChild(headerElement);
    }
  }, []);


  const play_button_hit = () => {
    set_ticking(prev => !prev);
    if (!ticking) { return; }

    update_cache_if_needed();
  }

  let currently_displayed_time = undefined;

  try {
    let target_index = binary_search_cache(
      all_sensors_cache,
      new Date(current_time()).toISOString()
    );

    currently_displayed_time = all_sensors_cache[target_index]["plctime"];
  } catch (e) { };

  const playback_buttons = <div>
    <div style={{ display: "flex", alignItems: "center" }}>
      <ButtonGroup>
        <Button
          text={ticking
            ? <div style={{ letterSpacing: "-2px" }}>▮▮</div>
            : <div>▶</div>}
          onClick={play_button_hit}
        />
        <Button
          text={<div style={{ letterSpacing: "-3px" }}>▶▶</div>}
          onClick={() => { set_playback_speed(prev => { prev.next_speed(); return prev; }) }} />
      </ButtonGroup>
      <div style={{ paddingLeft: "20px" }}>
        {/* {!ticking ? "paused" : playback_speed.get_current_speed()} */}
      </div>
      <div style={{ paddingLeft: "20px" }}>
        <div style={{ fontWeight: "bold" }}>Target Time:</div>
        {get_full_time_string(new Date(current_time()))}
      </div>
      {/*<div style={{ paddingLeft: "20px" }}>
        {binary_search_cache(
          all_sensors_cache,
          new Date(current_time()).toISOString())}
        </div>*/}
      <div style={{ padding: "0px 20px" }}>
        <div style={{ fontWeight: "bold" }}>Displayed Time:</div>
        {get_full_time_string(new Date(currently_displayed_time))}
      </div>
    </div>
  </div>

  const download_options = <div style={{
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px"
  }}
  >
    <ButtonGroup>
      <Button
        text={download_data_loading ? "loading" : "Download Data"}
        color="blue"
        onClick={() => {
          if (download_data_loading) { return; }
          const download_data = async () => {
            set_download_data_loading(true);
            await download_selected_sensors(start_download_date, end_download_date, modal_table_dict);
            set_download_data_loading(false);
          }
          download_data();
        }}
      />
    </ButtonGroup>
    <div style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "20px"
    }}
    >
      <div>
        <div>Start Date</div>
        <DateTimePicker
          onChange={set_start_download_date}
          value={start_download_date}
        />
      </div>
      <div>
        <div>End Date</div>
        <DateTimePicker
          onChange={set_end_download_date}
          value={end_download_date}
        />
      </div>
    </div>
  </div>

  return (
    <div>
      <div style={{ textAlign: "center", fontSize: "3rem", fontWeight: "bold", margin: "9px 0px 0px 0px" }}>
        Historical Bluerock Data
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <Box title="Selected Sensors" width={width * 0.4} contents={charts} />
        </div>
        <div >
          <Box width={width * 0.55} contents={<BluerockSchematic md={modal_table_dict} />} />
          <Box width={width * 0.55} contents={playback_buttons} />
          <Box width={width * 0.55} contents={sensor_table} />
          <Box width={width * 0.55} contents={download_options} />
        </div>
      </div>
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
