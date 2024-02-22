import logo from './logo.svg';
import './App.css';
import MyChart from './MyChart';

import { useState, useEffect } from 'react';

let host_string = "ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001";

function get_cache_size(brush_1, brush_2) {
  let brush_1_date = new Date(brush_1);
  let brush_2_date = new Date(brush_2);
  let width = brush_2_date.getTime() - brush_1_date.getTime();
  let middle_time = brush_1_date.getTime() / 2 + brush_2_date.getTime() / 2;
  return { start: new Date(middle_time - width), end: new Date(middle_time + width) };
}

function App() {
  const [data, set_data] = useState([[1613404800000, 0], [1613404801000, 0], [1613404802000, 0]]);
  const [time_brush_1, set_time_brush_1] = useState(1611296444000);
  const [time_brush_2, set_time_brush_2] = useState(1613974844000);
  const [last_received_time, set_last_received_time] = useState(0);
  const [cache_dimensions, set_cache_dimensions] = useState({ start: new Date(), end: new Date() });
  const [time_brush_image, set_time_brush_image] = useState({ start: new Date(), end: new Date() });
  const [ticking, setTicking] = useState(true);
  const [is_loading, set_is_loading] = useState(false);


  // initial load
  useEffect(() => {
    async function fetch_data() {
      let start_date = new Date('2021-01-03');
      let end_date = new Date('2021-01-05');
      set_is_loading(true);
      let cache_size = get_cache_size(start_date, end_date);
      set_cache_dimensions(cache_size);
      set_time_brush_image({start: start_date, end: end_date});
      let fetch_string = `http://${host_string}/bluerock/adaptive_all_history/permeateflow/${cache_size["start"].toISOString()}/${cache_size["end"].toISOString()}`;
      let response = await fetch(fetch_string);
      let response_json = await response.json();
      set_data(response_json);
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
      
      if(time_brush_2 > (time_brush_image["end"].getTime() + cache_dimensions["end"].getTime())/2) {
        const update = async () => {
          let cache_size = get_cache_size(time_brush_1, time_brush_2);
          set_cache_dimensions(cache_size);
          set_time_brush_image({start: new Date(time_brush_1), end: new Date(time_brush_2)});
          let fetch_string = `http://${host_string}/bluerock/adaptive_all_history/permeateflow/${cache_size["start"].toISOString()}/${cache_size["end"].toISOString()}`;
          let response = await fetch(fetch_string);
          let response_json = await response.json();

          // Only update the cache if we haven't received a time that's later
          if(cache_size["end"].getTime() > last_received_time ) {
            set_last_received_time(cache_size["end"].getTime());
            set_data(response_json);
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
    let fetch_string = `http://${host_string}/bluerock/adaptive_all_history/permeateflow/${cache_size["start"].toISOString()}/${cache_size["end"].toISOString()}`;
    let response = await fetch(fetch_string);
    let response_json = await response.json();
    set_data(response_json);
    set_is_loading(false);
  }

  return (
    <div style={{ padding: "100px" }}>

      <MyChart
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
            <MyChart
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
            <MyChart
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
            <MyChart
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
            <MyChart
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
    </div>

  );
}

export default App;
