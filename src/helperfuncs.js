let host_string = "ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001";

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
                    let current = await fetch(
                        `http://${host_string}/${system_name}/sensor_most_recent/${row["internal_data_name"]}`);
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
    if(select_type == "display") {
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
    return Object.keys(modal_table_dict).filter((key)=>{
        try {
            if(select_type === "display") {
                return modal_table_dict[key]["is_selected_display"];
            } else if (select_type === "download") {
                return modal_table_dict[key]["is_selected_display"];
            }
        } catch(e) {return false; }
    })
}

export {
    create_modal_table,
    initialize_modal_table_dict,
    ChartHolder,
    update_selected_sensor,
    get_selected_sensors
};