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
  const [data, set_data] = useState([[1613404800000, 93], [1613404801000, 75], [1613404802000, 69], [1613404803000, 66], [1613404804000, 1], [1613404805000, 52], [1613404806000, 82], [1613404807000, 24], [1613404808000, 29], [1613404809000, 74], [1613404810000, 92], [1613404811000, 63], [1613404812000, 47], [1613404813000, 78], [1613404814000, 82], [1613404815000, 87], [1613404816000, 56], [1613404817000, 56], [1613404818000, 48], [1613404819000, 16], [1613404820000, 22], [1613404821000, 16], [1613404822000, 93], [1613404823000, 15], [1613404824000, 14], [1613404825000, 17], [1613404826000, 62], [1613404827000, 61], [1613404828000, 70], [1613404829000, 99], [1613404830000, 94], [1613404831000, 73], [1613404832000, 41], [1613404833000, 16], [1613404834000, 74], [1613404835000, 86], [1613404836000, 70], [1613404837000, 21], [1613404838000, 7], [1613404839000, 69], [1613404840000, 21], [1613404841000, 39], [1613404842000, 77], [1613404843000, 70], [1613404844000, 60], [1613404845000, 72], [1613404846000, 20], [1613404847000, 32], [1613404848000, 5], [1613404849000, 30], [1613404850000, 8], [1613404851000, 55], [1613404852000, 47], [1613404853000, 13], [1613404854000, 79], [1613404855000, 98], [1613404856000, 94], [1613404857000, 100], [1613404858000, 73], [1613404859000, 96], [1613404860000, 97], [1613404861000, 55], [1613404862000, 85], [1613404863000, 5], [1613404864000, 23], [1613404865000, 32], [1613404866000, 43], [1613404867000, 2], [1613404868000, 18], [1613404869000, 33], [1613404870000, 11], [1613404871000, 30], [1613404872000, 95], [1613404873000, 35], [1613404874000, 3], [1613404875000, 33], [1613404876000, 30], [1613404877000, 73], [1613404878000, 80], [1613404879000, 41], [1613404880000, 16], [1613404881000, 43], [1613404882000, 88], [1613404883000, 84], [1613404884000, 61], [1613404885000, 1], [1613404886000, 100], [1613404887000, 64], [1613404888000, 72], [1613404889000, 95], [1613404890000, 37], [1613404891000, 83], [1613404892000, 48], [1613404893000, 80], [1613404894000, 31], [1613404895000, 83], [1613404896000, 91], [1613404897000, 20], [1613404898000, 12], [1613404899000, 97], [1613404900000, 44], [1613404901000, 44], [1613404902000, 100], [1613404903000, 65], [1613404904000, 17], [1613404905000, 70], [1613404906000, 75], [1613404907000, 24], [1613404908000, 78], [1613404909000, 9], [1613404910000, 89], [1613404911000, 55], [1613404912000, 26], [1613404913000, 93], [1613404914000, 24], [1613404915000, 3], [1613404916000, 18], [1613404917000, 38], [1613404918000, 69], [1613404919000, 42], [1613404920000, 4], [1613404921000, 47], [1613404922000, 72], [1613404923000, 40], [1613404924000, 51], [1613404925000, 59], [1613404926000, 50], [1613404927000, 77], [1613404928000, 49], [1613404929000, 4], [1613404930000, 61], [1613404931000, 59], [1613404932000, 0], [1613404933000, 81], [1613404934000, 10], [1613404935000, 69], [1613404936000, 77], [1613404937000, 79], [1613404938000, 69], [1613404939000, 1], [1613404940000, 28], [1613404941000, 71], [1613404942000, 40], [1613404943000, 16], [1613404944000, 78], [1613404945000, 27], [1613404946000, 46], [1613404947000, 96], [1613404948000, 60], [1613404949000, 2], [1613404950000, 27], [1613404951000, 10], [1613404952000, 82], [1613404953000, 30], [1613404954000, 70], [1613404955000, 0], [1613404956000, 37], [1613404957000, 67], [1613404958000, 26], [1613404959000, 24], [1613404960000, 42], [1613404961000, 0], [1613404962000, 84], [1613404963000, 62], [1613404964000, 90], [1613404965000, 90], [1613404966000, 44], [1613404967000, 10], [1613404968000, 26], [1613404969000, 8], [1613404970000, 53], [1613404971000, 89], [1613404972000, 24], [1613404973000, 9], [1613404974000, 90], [1613404975000, 54], [1613404976000, 3], [1613404977000, 88], [1613404978000, 97], [1613404979000, 80], [1613404980000, 65], [1613404981000, 84], [1613404982000, 21], [1613404983000, 72], [1613404984000, 44], [1613404985000, 31], [1613404986000, 17], [1613404987000, 4], [1613404988000, 43], [1613404989000, 38], [1613404990000, 87], [1613404991000, 17], [1613404992000, 50], [1613404993000, 66], [1613404994000, 23], [1613404995000, 69], [1613404996000, 34], [1613404997000, 47], [1613404998000, 62], [1613404999000, 19], [1613405000000, 40], [1613405001000, 22], [1613405002000, 83], [1613405003000, 80], [1613405004000, 11], [1613405005000, 9], [1613405006000, 93], [1613405007000, 61], [1613405008000, 6], [1613405009000, 38], [1613405010000, 47], [1613405011000, 43], [1613405012000, 77], [1613405013000, 19], [1613405014000, 54], [1613405015000, 64], [1613405016000, 37], [1613405017000, 55], [1613405018000, 65], [1613405019000, 66], [1613405020000, 90], [1613405021000, 70], [1613405022000, 66], [1613405023000, 11], [1613405024000, 16], [1613405025000, 27], [1613405026000, 70], [1613405027000, 18], [1613405028000, 54], [1613405029000, 25], [1613405030000, 31], [1613405031000, 74], [1613405032000, 12], [1613405033000, 36], [1613405034000, 85], [1613405035000, 38], [1613405036000, 62], [1613405037000, 61], [1613405038000, 4], [1613405039000, 58], [1613405040000, 49], [1613405041000, 62], [1613405042000, 69], [1613405043000, 2], [1613405044000, 40], [1613405045000, 87], [1613405046000, 36], [1613405047000, 86], [1613405048000, 6], [1613405049000, 65], [1613405050000, 12], [1613405051000, 38], [1613405052000, 70], [1613405053000, 60], [1613405054000, 9], [1613405055000, 84], [1613405056000, 45], [1613405057000, 53], [1613405058000, 95], [1613405059000, 69], [1613405060000, 68], [1613405061000, 82], [1613405062000, 35], [1613405063000, 24], [1613405064000, 98], [1613405065000, 8], [1613405066000, 39], [1613405067000, 10], [1613405068000, 5], [1613405069000, 92], [1613405070000, 45], [1613405071000, 62], [1613405072000, 63], [1613405073000, 94], [1613405074000, 35], [1613405075000, 26], [1613405076000, 69], [1613405077000, 50], [1613405078000, 83], [1613405079000, 47], [1613405080000, 70], [1613405081000, 50], [1613405082000, 23], [1613405083000, 91], [1613405084000, 31], [1613405085000, 24], [1613405086000, 79], [1613405087000, 88], [1613405088000, 52], [1613405089000, 44], [1613405090000, 12], [1613405091000, 88], [1613405092000, 15], [1613405093000, 6], [1613405094000, 91], [1613405095000, 11], [1613405096000, 61], [1613405097000, 97], [1613405098000, 99], [1613405099000, 61], [1613405100000, 30], [1613405101000, 12], [1613405102000, 52], [1613405103000, 96], [1613405104000, 50], [1613405105000, 20], [1613405106000, 96], [1613405107000, 47], [1613405108000, 25], [1613405109000, 26], [1613405110000, 20], [1613405111000, 57], [1613405112000, 21], [1613405113000, 45], [1613405114000, 24], [1613405115000, 19], [1613405116000, 28], [1613405117000, 47], [1613405118000, 40], [1613405119000, 4], [1613405120000, 27], [1613405121000, 81], [1613405122000, 98], [1613405123000, 94], [1613405124000, 11], [1613405125000, 73], [1613405126000, 57], [1613405127000, 2], [1613405128000, 57], [1613405129000, 80], [1613405130000, 70], [1613405131000, 23], [1613405132000, 77], [1613405133000, 76], [1613405134000, 84], [1613405135000, 36], [1613405136000, 23], [1613405137000, 28], [1613405138000, 3], [1613405139000, 30], [1613405140000, 33], [1613405141000, 60], [1613405142000, 40], [1613405143000, 72], [1613405144000, 89], [1613405145000, 67], [1613405146000, 22], [1613405147000, 74], [1613405148000, 79], [1613405149000, 52], [1613405150000, 17], [1613405151000, 97], [1613405152000, 19], [1613405153000, 37], [1613405154000, 14], [1613405155000, 18], [1613405156000, 6], [1613405157000, 38], [1613405158000, 18], [1613405159000, 50], [1613405160000, 88], [1613405161000, 92], [1613405162000, 18], [1613405163000, 15], [1613405164000, 23], [1613405165000, 90], [1613405166000, 13], [1613405167000, 11], [1613405168000, 36], [1613405169000, 65], [1613405170000, 98], [1613405171000, 87], [1613405172000, 79], [1613405173000, 27], [1613405174000, 85], [1613405175000, 49], [1613405176000, 96], [1613405177000, 9], [1613405178000, 94], [1613405179000, 72], [1613405180000, 50], [1613405181000, 60], [1613405182000, 47], [1613405183000, 47], [1613405184000, 16], [1613405185000, 62], [1613405186000, 35], [1613405187000, 97], [1613405188000, 53], [1613405189000, 82], [1613405190000, 97], [1613405191000, 89], [1613405192000, 38], [1613405193000, 59], [1613405194000, 14], [1613405195000, 85], [1613405196000, 7], [1613405197000, 60], [1613405198000, 41], [1613405199000, 62], [1613405200000, 85], [1613405201000, 93], [1613405202000, 0], [1613405203000, 70], [1613405204000, 49], [1613405205000, 61], [1613405206000, 60], [1613405207000, 57], [1613405208000, 37], [1613405209000, 74], [1613405210000, 1], [1613405211000, 93], [1613405212000, 84], [1613405213000, 69], [1613405214000, 94], [1613405215000, 83], [1613405216000, 91], [1613405217000, 42], [1613405218000, 78], [1613405219000, 37], [1613405220000, 48], [1613405221000, 18], [1613405222000, 99], [1613405223000, 79], [1613405224000, 64], [1613405225000, 63], [1613405226000, 98], [1613405227000, 71], [1613405228000, 6], [1613405229000, 74], [1613405230000, 8], [1613405231000, 37], [1613405232000, 81], [1613405233000, 48], [1613405234000, 72], [1613405235000, 92], [1613405236000, 60], [1613405237000, 90], [1613405238000, 31], [1613405239000, 4], [1613405240000, 70], [1613405241000, 65], [1613405242000, 87], [1613405243000, 21], [1613405244000, 2], [1613405245000, 90], [1613405246000, 58], [1613405247000, 2], [1613405248000, 77], [1613405249000, 97], [1613405250000, 30], [1613405251000, 39], [1613405252000, 85], [1613405253000, 25], [1613405254000, 27]]);
  const [time_brush_1, set_time_brush_1] = useState(1611296444000);
  const [time_brush_2, set_time_brush_2] = useState(1613974844000);
  const [cache_dimensions, set_cache_dimensions] = useState({ start: new Date(), end: new Date() });
  const [time_brush_image, set_time_brush_image] = useState({ start: new Date(), end: new Date() });
  const [ticking, setTicking] = useState(true);
  const [is_loading, set_is_loading] = useState(false);


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


  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("ticking")
      if (!ticking || is_loading) { return; }
      set_time_brush_1(prev => prev + 5000000);
      set_time_brush_2(prev => prev + 5000000);
      
      if(time_brush_2 > (time_brush_image["end"].getTime() + cache_dimensions["end"].getTime())/2) {
        const update = async () => {
          let cache_size = get_cache_size(time_brush_1, time_brush_2);
          set_cache_dimensions(cache_size);
          set_time_brush_image({start: new Date(time_brush_1), end: new Date(time_brush_2)});
          let fetch_string = `http://${host_string}/bluerock/adaptive_all_history/permeateflow/${cache_size["start"].toISOString()}/${cache_size["end"].toISOString()}`;
          let response = await fetch(fetch_string);
          let response_json = await response.json();
          set_data(response_json);
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
    </div>

  );
}

export default App;
