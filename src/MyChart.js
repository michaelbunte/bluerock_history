import React from 'react';
import { useState, useEffect } from 'react';

const NAVBAR_HEIGHT = 50;
const NAVBAR_RESOLUTION = 200;
const MAIN_CHART_RESOLUTION = 1000;


function mapRange(value, fromMin, fromMax, toMin, toMax) {
    // Ensure the input value is within the source range
    const clampedValue = Math.min(Math.max(value, fromMin), fromMax);

    // Calculate the percentage of the input value within the source range
    const percentage = (clampedValue - fromMin) / (fromMax - fromMin);

    // Map the percentage to the target range and return the result
    const mappedValue = toMin + percentage * (toMax - toMin);
    return mappedValue;
}

function find_target_time_index(target_time, data) {
    if(data.length === 0) {
        return -1;
    }

    let lower = 0;
    let upper = data.length - 1;

    if(target_time < data[lower]) { return lower; }
    if(target_time > data[upper]) { return upper; }

    while(upper - lower > 1) {
        let middle = Math.floor((upper + lower)/2);
        let middle_value = data[middle][0];
        if (target_time > middle_value) {
            lower = middle;
        } else if (target_time < middle_value) {
            upper = middle;
        } else {
            return middle;
        }
    }
    return lower;
}


const Brush = ({
    x_pos,
    y_pos
}) => {
    return <g>
        <line
            strokeLinecap="round"
            x1={x_pos}
            y1={y_pos}
            x2={x_pos}
            y2={y_pos + NAVBAR_HEIGHT}
            strokeWidth="4"
            stroke="black" />
        <rect
            x={x_pos - 5}
            y={y_pos + NAVBAR_HEIGHT / 4}
            width={10}
            height={NAVBAR_HEIGHT / 2}
            rx={5}
            fill="white"
            stroke="black"
            strokeWidth="4"
        />
    </g>
}


const MyChart = ({
    height,
    width,
    data
}) => {
    


    const time_to_navbar_x = (time) => {
        return mapRange(time, start_time, end_time, 0, width);
    }
    const navbar_x_to_time = (time) => {
        return mapRange(time, 0, width, start_time, end_time);
    }

    //========================================================================
    // Brush 1
    const [dragging_brush_1, set_dragging_brush_1] = useState(false);
    const [x_origin_brush_1, set_x_origin_brush_1] = useState(0);
    const [x_pos_brush_1, set_x_pos_brush_1] = useState(100);
    useEffect(() => {
        const handle_mouse_move = function (e) {
            e.stopPropagation();
            if (dragging_brush_1) {
                set_x_pos_brush_1(Math.max(Math.min(e.clientX - x_origin_brush_1, width), 0));
            }
        }
        const handle_mouse_up = function (e) {
            e.stopPropagation()
            set_dragging_brush_1(false);
        }
        window.addEventListener('mousemove', handle_mouse_move);
        window.addEventListener('mouseup', handle_mouse_up);

        return () => {
            window.removeEventListener('mousemove', handle_mouse_move);
            window.removeEventListener('mouseup', handle_mouse_up);
        };
    }, [x_pos_brush_1, dragging_brush_1, x_origin_brush_1]);

    //========================================================================
    // Brush 2
    const [dragging_brush_2, set_dragging_brush_2] = useState(false);
    const [x_origin_brush_2, set_x_origin_brush_2] = useState(0);
    const [x_pos_brush_2, set_x_pos_brush_2] = useState(200);
    useEffect(() => {
        const handle_mouse_move = function (e) {
            e.stopPropagation();
            if (dragging_brush_2) {
                set_x_pos_brush_2(Math.max(Math.min(e.clientX - x_origin_brush_2, width), 0));
            }
        }
        const handle_mouse_up = function (e) {
            e.stopPropagation()
            set_dragging_brush_2(false);
        }
        window.addEventListener('mousemove', handle_mouse_move);
        window.addEventListener('mouseup', handle_mouse_up);

        return () => {
            window.removeEventListener('mousemove', handle_mouse_move);
            window.removeEventListener('mouseup', handle_mouse_up);
        };
    }, [x_pos_brush_2, dragging_brush_2, x_origin_brush_2]);


    //========================================================================
    // Navbar polyline
    const start_time = data[0][0];
    const end_time = data[data.length - 1][0];
    const navbar_step_size = data.length / NAVBAR_RESOLUTION;

    let max = 0;
    for (let i = 0; i < data.length; i += navbar_step_size) {
        max = Math.max(data[Math.floor(i)][1], max);
    }

    let navbar_points = `0,${NAVBAR_HEIGHT} `;
    for (let i = 0; i < data.length; i += navbar_step_size) {
        let x_pos = time_to_navbar_x(data[Math.floor(i)][0]);
        let y_pos = mapRange(data[Math.floor(i)][1], 0, max, 0, NAVBAR_HEIGHT);
        navbar_points += `${x_pos},${y_pos} `
    }
    navbar_points += `${width},${NAVBAR_HEIGHT}`;
    

    //========================================================================
    // Main Chart Polyline
    let brush_1_time = navbar_x_to_time(x_pos_brush_1);
    let brush_2_time = navbar_x_to_time(x_pos_brush_2);
    
    let first_index = find_target_time_index(brush_1_time, data);
    let last_index = find_target_time_index(brush_2_time, data);
    const main_chart_step_size = data.length / MAIN_CHART_RESOLUTION;

    let main_chart_line_points = ``;
    for(let i = first_index; i <= last_index + Math.max(main_chart_step_size, 2); i+=main_chart_step_size) {
        try {
            let x_pos = mapRange(data[Math.floor(i)][0], brush_1_time, brush_2_time, 0, width);
            let y_pos = mapRange(data[Math.floor(i)][1], 0, max, 0, height - NAVBAR_HEIGHT);
            main_chart_line_points += `${x_pos},${y_pos} `
        } catch(e) {}
    }


    return (
        <div>
            <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    stroke="none"
                    fill="lightgreen" />

                <g transform={`translate(0, ${height - NAVBAR_HEIGHT})`}>
                    <polyline
                        points={navbar_points}
                        fill="lightblue"
                        stroke="black" />
                </g>

                <polyline 
                    points={main_chart_line_points}
                    stroke="black"
                    fill="none"
                />

                <rect
                    onMouseDown={(e) => {
                        e.stopPropagation();

                        set_x_origin_brush_1(e.clientX - x_pos_brush_1);
                        set_dragging_brush_1(true);
                        set_x_origin_brush_2(e.clientX - x_pos_brush_2);
                        set_dragging_brush_2(true);
                    }}

                    x={Math.min(x_pos_brush_1, x_pos_brush_2)}
                    y={height - NAVBAR_HEIGHT}
                    height={NAVBAR_HEIGHT}
                    width={Math.abs(x_pos_brush_2 - x_pos_brush_1)}
                    fill="rgba(0,0,0,0.2)"
                    stroke="none"
                />

                <g
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        set_x_origin_brush_1(e.clientX - x_pos_brush_1);
                        set_dragging_brush_1(true);
                    }}
                >
                    <Brush
                        x_pos={x_pos_brush_1}
                        y_pos={height - NAVBAR_HEIGHT}
                    />
                </g>

                <g
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        set_x_origin_brush_2(e.clientX - x_pos_brush_2);
                        set_dragging_brush_2(true);
                    }}
                >
                    <Brush
                        x_pos={x_pos_brush_2}
                        y_pos={height - NAVBAR_HEIGHT}
                    />
                </g>
            </svg>
        </div>
    );
};

export default MyChart;