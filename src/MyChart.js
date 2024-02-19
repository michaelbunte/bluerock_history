import React from 'react';
import { useState, useEffect } from 'react';

const NAVBAR_HEIGHT = 50;
const NAVBAR_RESOLUTION = 200;
const MAIN_CHART_RESOLUTION = 4000;
const DATE_SPACING_1_HEIGHT = 25;
const DATE_SPACING_2_HEIGHT = 30;
const NAVBAR_DATE_SPACING_WIDTH = 80;
const MAIN_CHART_DATE_SPACING_WIDTH = 80;


function mapRange(value, fromMin, fromMax, toMin, toMax, clamped=false) {
    // Ensure the input value is within the source range
    const clampedValue = clamped ? Math.min(Math.max(value, fromMin), fromMax)
                            : value;

    // Calculate the percentage of the input value within the source range
    const percentage = (clampedValue - fromMin) / (fromMax - fromMin);

    // Map the percentage to the target range and return the result
    const mappedValue = toMin + percentage * (toMax - toMin);
    return mappedValue;
}

function print_date(date, range_start, range_end) {
    const date_obj = new Date(date);
    const range_size = Math.abs(range_start - range_end);

    if (range_size < 1000 * 30) {
        const formattedDate = date_obj.toLocaleString("en-GB", {
            minute: "2-digit",
            second: "2-digit"
        });
        return formattedDate;
    }

    if (range_size < 1000 * 60 * 30) {
        const formattedDate = date_obj.toLocaleString("en-GB", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit"
        });
        return formattedDate;
    }

    if (range_size < 1000 * 60 * 60 * 12) {
        const formattedDate = date_obj.toLocaleString("en-GB", {
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
        return formattedDate;
    }

    if (range_size < 1000 * 60 * 60 * 24 * 10) {
        const formattedDate = date_obj.toLocaleString("en-GB", {
            month: "short",
            day: "numeric",
            hour: "numeric",
        });
        return formattedDate;
    }

    const formattedDate = date_obj.toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
    });
    return formattedDate;
}

function find_target_time_index(target_time, data) {
    if (data.length === 0) {
        return -1;
    }

    let lower = 0;
    let upper = data.length - 1;

    if (target_time < data[lower]) { return lower; }
    if (target_time > data[upper]) { return upper; }

    while (upper - lower > 1) {
        let middle = Math.floor((upper + lower) / 2);
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

    const NAVBAR_BOTTOM = height - DATE_SPACING_2_HEIGHT;
    const NAVBAR_TOP = height - DATE_SPACING_2_HEIGHT - NAVBAR_HEIGHT;
    const MAIN_CHART_BOTTOM = height - DATE_SPACING_2_HEIGHT - NAVBAR_HEIGHT - DATE_SPACING_1_HEIGHT;

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

    const time_to_main_chart_x = (time) => {
        return mapRange(time, brush_1_time, brush_2_time, 0, width);
    }

    const main_chart_x_to_time = (x) => {
        return mapRange(x, 0, width, brush_1_time, brush_2_time);
    }

    let first_index = find_target_time_index(brush_1_time, data);
    let last_index = find_target_time_index(brush_2_time, data);
    const main_chart_step_size = data.length / MAIN_CHART_RESOLUTION;

    let main_chart_line_points = `${-1},${NAVBAR_BOTTOM} `;
    for (let i = first_index; i <= last_index + Math.max(main_chart_step_size, 2); i += main_chart_step_size) {
        try {
            let x_pos = time_to_main_chart_x(data[Math.floor(i)][0]);
            let y_pos = mapRange(data[Math.floor(i)][1], 0, max, 0, MAIN_CHART_BOTTOM);
            main_chart_line_points += `${x_pos},${y_pos} `
        } catch (e) { }
    }
    main_chart_line_points += `${width + 1},${NAVBAR_BOTTOM} `;

    //========================================================================
    // Navbar Dates

    let navbar_dates = [];
    for (let i = NAVBAR_DATE_SPACING_WIDTH / 2; i < width; i += NAVBAR_DATE_SPACING_WIDTH) {
        let current_time = navbar_x_to_time(i);

        try {
            navbar_dates.push(<g
                transform={`translate(${i}, ${0})`}
            >
                <line
                    x1="0"
                    x2="0"
                    y1={NAVBAR_BOTTOM}
                    y2={NAVBAR_BOTTOM + 6}
                    stroke="black"
                    strokeWidth="1"
                />
                <text
                    x="0"
                    y={NAVBAR_BOTTOM + 17}
                    fontFamily="Arial"
                    fontSize="10"
                    textAnchor="middle"
                    pointerEvents="none"
                    fill="black">{
                        print_date(current_time, start_time, end_time)
                    }</text>
            </g>);
        } catch (e) { };
    }

    //========================================================================
    // Main Chart Dates

    let time_step_size = main_chart_x_to_time(MAIN_CHART_DATE_SPACING_WIDTH) - main_chart_x_to_time(0);
    let start_time_difference = brush_1_time - start_time;
    let first_date_start_time = start_time + Math.floor(start_time_difference / time_step_size) * time_step_size;

    let main_chart_dates = [];
    for (let i = first_date_start_time; i < brush_2_time + time_step_size; i += time_step_size) {
        main_chart_dates.push(<g
            transform={`translate(${time_to_main_chart_x(i)}, ${0})`}
        >
            <line
                x1="0"
                x2="0"
                y1={MAIN_CHART_BOTTOM}
                y2={MAIN_CHART_BOTTOM + 6}
                stroke="black"
                strokeWidth="1"
            />
            <text
                x="0"
                y={MAIN_CHART_BOTTOM + 17}
                fontFamily="Arial"
                fontSize="10"
                textAnchor="middle"
                pointerEvents="none"
                fill="black">{
                    print_date(i, brush_1_time, brush_2_time)
                }</text>
        </g>)
    }

    //========================================================================
    // Scrollbar

    let scroll_width = Math.max(Math.abs(x_pos_brush_1 - x_pos_brush_2), 10);
    let scroll_x = Math.min(x_pos_brush_1, x_pos_brush_2) + Math.abs(x_pos_brush_1 - x_pos_brush_2) / 2 - scroll_width / 2;

    return (
        <div>
            <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    stroke="none"
                    fill="white" />

                <polyline
                    points={main_chart_line_points}
                    stroke="black"
                    fill="lightgreen"
                />

                <g transform={`translate(0, ${NAVBAR_TOP})`}>
                    <polyline
                        points={navbar_points}
                        fill="lightblue"
                        stroke="black" />
                </g>


                <g
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        set_x_origin_brush_1(e.clientX - x_pos_brush_1);
                        set_dragging_brush_1(true);
                        set_x_origin_brush_2(e.clientX - x_pos_brush_2);
                        set_dragging_brush_2(true);
                    }}
                >
                    <rect
                        x={scroll_x}
                        y={NAVBAR_BOTTOM + 20}
                        height={10}
                        width={scroll_width}
                        fill="rgba(0,0,0,0.2)"
                        stroke="none"
                        rx="5"
                    />
                    <rect
                        x={Math.min(x_pos_brush_1, x_pos_brush_2)}
                        y={NAVBAR_TOP}
                        height={NAVBAR_HEIGHT}
                        width={Math.abs(x_pos_brush_2 - x_pos_brush_1)}
                        fill="rgba(0,0,0,0.2)"
                        stroke="none"
                    />
                </g>

                <g
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        set_x_origin_brush_1(e.clientX - x_pos_brush_1);
                        set_dragging_brush_1(true);
                    }}
                >
                    <Brush
                        x_pos={x_pos_brush_1}
                        y_pos={NAVBAR_TOP}
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
                        y_pos={NAVBAR_TOP}
                    />
                </g>
                {navbar_dates}
                {main_chart_dates}
                <line
                    x1="0"
                    x2={width}
                    y1={MAIN_CHART_BOTTOM}
                    y2={MAIN_CHART_BOTTOM}
                    stroke="black"
                />
            </svg>
        </div>
    );
};

export default MyChart;