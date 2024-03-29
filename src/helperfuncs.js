import { useState, useEffect } from 'react';


function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}


let host_string = "ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001";
// let host_string = "localhost:5001";

const initialize_modal_table_dict = () => {
    let modal_table_dict = {
        get: function (sensorname, field) {
            if (this === undefined || this[sensorname] === undefined) {
                return field === "on_click" ? () => { } : "";
            }
            return this[sensorname][field]
        }
    }
    return modal_table_dict;
}

const create_modal_table = (
    system_name,
    sensor_data_table,
    set_current_modal,
    set_current_modal_data
) => {
    const modal_table_dict = initialize_modal_table_dict();
    sensor_data_table.forEach(row => {
        modal_table_dict[row["internal_data_name"]] = {
            internal_data_name: row["internal_data_name"],
            human_readible_name: row["human_readible_name"],
            description: row["description"],
            abbreviated_name: row["abbreviated_name"],
            current_value: undefined,
            units: row["units"],
            is_selected_display: false,
            is_selected_download: false,
            on_click: async () => {
                set_current_modal(row["human_readible_name"]);
                try {
                    set_current_modal_data(prev => ({
                        ...prev,
                        loading: true
                    }));

                    let response = await fetch(`http://${host_string}/bluerock/adaptive_all_history/${row["internal_data_name"]}/${new Date('1980')}/${new Date('2100')}`);
                    let current = await fetch(`http://${host_string}/${system_name}/sensor_most_recent/${row["internal_data_name"]}`);
                    let response_json = await response.json();
                    let current_json = await current.json();

                    if (row["units"] === "boolean") {
                        response_json = await response_json.map((tup) => [tup[0], tup[1] ? 1 : 0]);
                    }

                    set_current_modal_data((prev) => ({
                        ...prev,
                        loading: false,
                        time_series_data: response_json,
                        current_data: current_json,
                        description: row["description"],
                        units: row["units"]
                    }));
                } catch (e) {
                    console.error(e);
                }
            }
        };
    });
    return modal_table_dict;
}

function ChartHolder({
    chart,
    on_x = () => { }
}) {
    return <div style={{
        background: "white",
        padding: "2px",
        display: "flex",
        alignItems: "center",
        border: "grey 2px solid",
        borderRadius: "3px",
        margin: "3px"
    }}>
        <div style={{
            color: "black",
            fontSize: "3rem",
            fontWeight: "bold",
            padding: "20px",
            cursor: "pointer"
        }}
            onClick={on_x}
        >
            ×
        </div>
        <div style={{
        }}>
            {chart}
        </div>
    </div>
}


function update_selected_sensor(
    set_modal_table_dict,
    sensor_internal_name,
    is_selected,
    select_type // display || download
) {
    if (select_type == "display") {
        set_modal_table_dict((prev) => ({
            ...prev,
            [sensor_internal_name]: {
                ...prev[sensor_internal_name],
                is_selected_display: is_selected
            }
        }));
    } else if (select_type == "download") {
        set_modal_table_dict((prev) => ({
            ...prev,
            [sensor_internal_name]: {
                ...prev[sensor_internal_name],
                is_selected_download: is_selected
            }
        }));
    }
}

function get_selected_sensors(
    modal_table_dict,
    select_type, // display || download
) {
    return Object.keys(modal_table_dict).filter((key) => {
        try {
            if (select_type === "display") {
                return modal_table_dict[key]["is_selected_display"];
            } else if (select_type === "download") {
                return modal_table_dict[key]["is_selected_download"];
            }
        } catch (e) { return false; }
    })
}

async function query_selected_sensors(
    modal_table_dict,
    cache_size,
    set_selected_sensor_data
) {
    const selected_sensors = get_selected_sensors(modal_table_dict, "display");
    const fetches = selected_sensors.map(selected_sensor => {
        return fetch(`http://${host_string}/bluerock/adaptive_all_history/${selected_sensor}/${cache_size["start"].toISOString()}/${cache_size["end"].toISOString()}`);
    });

    const responses = await Promise.all(fetches);

    const new_selected_sensor_data = {};
    for (let ind = 0; ind < responses.length; ind++) {
        const selected_sensor = selected_sensors[ind];
        const response = responses[ind];
        new_selected_sensor_data[selected_sensor] = await response.json();
    }
    set_selected_sensor_data(new_selected_sensor_data);
}

const get_value_unit_string = (sensor_name, modal_table_dict) => {
    const current_value = modal_table_dict.get(sensor_name, "current_value");
    return `${current_value === undefined ? "" : current_value} `
        + `${modal_table_dict.get(sensor_name, "units")}`
}

function binary_search_cache(
    cache,
    target_date // should be an ISO string
) {

    if (cache.length === 0) { return -1; }

    let start_i = 0;
    let end_i = cache.length - 1;
    let target_date_obj = new Date(target_date);
    while (Math.abs(start_i - end_i) > 1) {
        let middle_i = Math.floor((start_i + end_i) / 2);
        let middle_i_date = new Date(cache[middle_i]["timezone"]);

        if (middle_i_date <= target_date_obj) {
            start_i = middle_i;
        } else {
            end_i = middle_i;
        }
    }
    return start_i < 2 || start_i > cache.length - 3 ? -1 : start_i;
}

class PlaybackSpeed {
    constructor() {
        this.paused = true;

        this.speed_index = 2;
        this.sensor_speeds = [
            1000,
            10000,
            100000,
            1000000,
        ]

        this.is_loading = false;
    }
    
    next_speed() {
        this.speed_index = (this.speed_index + 1) % this.sensor_speeds.length; 
    }

    get_current_speed() { return this.sensor_speeds[this.speed_index]; }
    toggle_paused() { this.paused = !this.paused;}
    get_paused() { return this.paused; }

    set_loading() { this.loading = true; }
    set_not_loading() { this.loading = false; }

    get_loading() { return this.loading; }

    get_range() {
        return this.get_current_speed() * 100;
    }

    get_minor_range() {
        return this.get_current_speed() * 10;
    }
}

function update_current_sensor_values(
    set_modal_table_dict,
    current_data
) {
    if(set_modal_table_dict == null || current_data == null) { return; }
    set_modal_table_dict(prev=>{
        Object.keys(current_data).map(
            key => {
                try {
                    prev[key]["current_value"] = current_data[key]
                } catch (e) {}
                return 0;
            })
        return prev;
    })
}

function get_full_time_string(date) {
    return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    });
}

const convertToCSV = (data) => {
    // Extract column headers
    const headers = Object.keys(data[0]);
  
    // Create CSV content
    const csvContent = [
      headers.join(','), // CSV header
      ...data.map(item => headers.map(header => item[header]).join(',')) // CSV rows
    ].join('\n');
  
    return csvContent;
  };

async function download_selected_sensors(
    start_date,
    end_date,
    modal_table_dict
) {
    const selected_sensors = get_selected_sensors(
        modal_table_dict,
        "download"
    );
    if(selected_sensors.length === 0) {
        window.confirm("Please select sensors to download");
        return;
    }
    if(end_date <= start_date) {
        window.confirm("Invalid date selection");
        return;
    }

    let response = await fetch(`http://${host_string}/bluerock/specific_sensors_range/${selected_sensors}/${start_date}/${end_date}`);
    let response_json = await response.json();

    const csv = convertToCSV(response_json);
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.csv';
    link.click();
}

export {
    create_modal_table,
    initialize_modal_table_dict,
    ChartHolder,
    update_selected_sensor,
    get_selected_sensors,
    query_selected_sensors,
    get_value_unit_string,
    binary_search_cache,
    update_current_sensor_values,
    PlaybackSpeed,
    useWindowDimensions,
    get_full_time_string,
    download_selected_sensors
};