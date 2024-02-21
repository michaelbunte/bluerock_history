import React from 'react';
import { useState, useEffect } from 'react';

const NAVBAR_HEIGHT = 50;
const NAVBAR_RESOLUTION = 200;
const MAIN_CHART_RESOLUTION = 4000;
const DATE_SPACING_1_HEIGHT = 25;
const DATE_SPACING_2_HEIGHT = 30;
const NAVBAR_DATE_SPACING_WIDTH = 80;
const MAIN_CHART_DATE_SPACING_WIDTH = 80;
const MAIN_CHART_VALUE_SPACING_HEIGHT = 50;
const MAIN_CHART_TOP = 20;


function mapRange(value, fromMin, fromMax, toMin, toMax, clamped = false) {
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
    y_pos,
    screenWidth
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
            x={Math.min(Math.max(x_pos - 5, 0), screenWidth - 11)}
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
    height = 300,
    width = 700,
    data,
    title = "",
    loading = false,
    x_pos_brush_1,
    x_pos_brush_2,
    set_x_pos_brush_1,
    set_x_pos_brush_2,
    hide_closest_point = false,
    on_final_window_resize = () => { }
}) => {
    const eleSvg = document.querySelector('svg');
    const NAVBAR_BOTTOM = height - DATE_SPACING_2_HEIGHT;
    const NAVBAR_TOP = height - DATE_SPACING_2_HEIGHT - NAVBAR_HEIGHT;
    const MAIN_CHART_BOTTOM = height - DATE_SPACING_2_HEIGHT - NAVBAR_HEIGHT - DATE_SPACING_1_HEIGHT;

    const start_time = data[0][0];
    const end_time = data[data.length - 1][0];
    const time_to_navbar_x = (time) => {
        return mapRange(time, start_time, end_time, 0, width);
    }
    const navbar_x_to_time = (time) => {
        return mapRange(time, 0, width, start_time, end_time);
    }

    // https://dev.to/netsi1964/screen-coordinates-to-svg-coordinates-3k0l
    const convert_world_to_svg_coord = (client_x_pos) => {
        let point = eleSvg.createSVGPoint();
        point.x = client_x_pos;
        point = point.matrixTransform(eleSvg.getScreenCTM().inverse());
        return point.x;
    }

    //========================================================================
    // Brush 1
    const [dragging_brush_1, set_dragging_brush_1] = useState(false);
    const [x_origin_brush_1, set_x_origin_brush_1] = useState(0);

    useEffect(() => {
        const handle_mouse_move = function (e) {
            e.stopPropagation();
            if (dragging_brush_1 && e.clientX - x_origin_brush_1 < x_pos_brush_2) {
                set_x_pos_brush_1(e.clientX - x_origin_brush_1);
            }
        }
        const handle_mouse_up = function (e) {
            e.stopPropagation()
            set_dragging_brush_1(false);
            on_final_window_resize();
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

    useEffect(() => {
        const handle_mouse_move = function (e) {
            e.stopPropagation();
            if (dragging_brush_2 && e.clientX - x_origin_brush_2 > x_pos_brush_1) {
                set_x_pos_brush_2(e.clientX - x_origin_brush_2);
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
    const navbar_step_size = data.length / NAVBAR_RESOLUTION;

    let navbar_max = 0;
    for (let i = 0; i < data.length; i += navbar_step_size) {
        navbar_max = Math.max(data[Math.floor(i)][1], navbar_max);
    }

    let navbar_points = `0,${NAVBAR_HEIGHT} `;
    for (let i = 0; i < data.length; i += navbar_step_size) {
        let x_pos = time_to_navbar_x(data[Math.floor(i)][0]);
        let y_pos = mapRange(data[Math.floor(i)][1], 0, navbar_max, NAVBAR_HEIGHT, 0);
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

    let local_chart_max = data[first_index][1];
    for (let i = first_index; i <= last_index + Math.max(main_chart_step_size, 2); i += main_chart_step_size) {
        try {
            local_chart_max = Math.max(data[Math.floor(i)][1], local_chart_max)
        } catch (e) { }
    }


    const time_to_main_chart_x = (time) => {
        return mapRange(time, brush_1_time, brush_2_time, 0, width);
    }
    const main_chart_x_to_time = (x) => {
        return mapRange(x, 0, width, brush_1_time, brush_2_time);
    }
    const main_chart_y_to_value = (y) => {
        return mapRange(y, MAIN_CHART_BOTTOM, MAIN_CHART_TOP, 0, local_chart_max * 1.1);
    }

    const main_chart_value_to_y = (value) => {
        return mapRange(value, 0, local_chart_max * 1.1, MAIN_CHART_BOTTOM, MAIN_CHART_TOP);
    }


    let main_chart_line_points = `${time_to_main_chart_x(data[0][0])},${NAVBAR_BOTTOM} `;
    let b = 0;
    for (let i = first_index; i <= last_index + Math.max(main_chart_step_size, 2); i += main_chart_step_size) {
        try {
            let x_pos = time_to_main_chart_x(data[Math.floor(i)][0]);
            let y_pos = main_chart_value_to_y(data[Math.floor(i)][1]);
            main_chart_line_points += `${x_pos},${y_pos} `
        } catch (e) { }
    }

    main_chart_line_points += `${time_to_main_chart_x(data[data.length - 1][0])},${NAVBAR_BOTTOM} `;

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
                    userSelect="none"
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
                userSelect="none"
                fill="black">{
                    print_date(i, brush_1_time, brush_2_time)
                }</text>
        </g>)
    }

    //========================================================================
    // Scrollbar

    let scroll_width = Math.max(Math.abs(x_pos_brush_1 - x_pos_brush_2) + 10, 20);
    let scroll_x = Math.min(x_pos_brush_1, x_pos_brush_2) + Math.abs(x_pos_brush_1 - x_pos_brush_2) / 2 - scroll_width / 2;

    //========================================================================
    // Horizontal Chart Lines
    let horizontal_lines = [];
    for (let i = MAIN_CHART_BOTTOM; i > MAIN_CHART_TOP; i -= MAIN_CHART_VALUE_SPACING_HEIGHT) {
        horizontal_lines.push(<g
            transform={`translate(${0},${i})`}
        >
            <line
                x1="0"
                y1="0"
                x2={width}
                y2="0"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1px"
            />
            <text
                paintOrder="stroke"
                strokeWidth="2px"
                stroke="white"
                x="3"
                y="-1"
                fontFamily="Arial"
                fontSize="10"
                textAnchor="left"
                userSelect="none"
                fill="black">{
                    main_chart_y_to_value(i).toPrecision(3)
                }</text>
        </g>)
    }

    //========================================================================
    // Vertical Line
    let [show_vertical_line, set_show_vertical_line] = useState(true);
    let vertical_line = show_vertical_line && <g>
        <line
            y1={MAIN_CHART_TOP + 5}
            y2={MAIN_CHART_BOTTOM}
            x1={width / 2}
            x2={width / 2}
            stroke="white"
            strokeWidth="5px"
        />
        <line
            y1={MAIN_CHART_TOP + 5}
            y2={MAIN_CHART_BOTTOM}
            x1={width / 2}
            x2={width / 2}
            stroke="red"
            strokeWidth="2px"
        />
    </g>

    let vertical_line_time = new Date(main_chart_x_to_time(width / 2)).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    });

    //========================================================================
    // Selectable Chart Logic

    const [dragging_box, set_dragging_box] = useState(false);
    const [x_pos_box_curr, set_x_pos_box_curr] = useState(100);
    const [x_pos_box_start, set_x_pos_box_start] = useState(100);
    const [hovered_point_pos, set_hovered_point_pos] = useState([-100, -100]);

    useEffect(() => {
        const handle_mouse_move = function (e) {
            e.stopPropagation();
            if (dragging_box) {
                set_x_pos_box_curr(convert_world_to_svg_coord(e.clientX));
            }

        }
        const handle_mouse_up = function (e) {
            e.stopPropagation();
            if (dragging_box) {
                if (x_pos_box_start === x_pos_box_curr) {
                    set_dragging_box(false);
                    return;
                }

                let min_pos = Math.min(x_pos_box_curr, x_pos_box_start);
                let max_pos = Math.max(x_pos_box_curr, x_pos_box_start);

                let min_pos_time = main_chart_x_to_time(min_pos);
                let max_pos_time = main_chart_x_to_time(max_pos);
                set_hovered_point_pos([-100, -100]);
                set_x_pos_brush_1(time_to_navbar_x(min_pos_time));
                set_x_pos_brush_2(time_to_navbar_x(max_pos_time));
                set_dragging_box(false);
            }
        }
        window.addEventListener('mousemove', handle_mouse_move);
        window.addEventListener('mouseup', handle_mouse_up);

        return () => {
            window.removeEventListener('mousemove', handle_mouse_move);
            window.removeEventListener('mouseup', handle_mouse_up);
        };
    }, [dragging_box, x_pos_box_curr, hovered_point_pos])

    const on_center_rect_click = (e) => {
        e.stopPropagation();
        let client_x_pos = convert_world_to_svg_coord(e.clientX);
        set_dragging_box(true);
        set_x_pos_box_curr(client_x_pos);
        set_x_pos_box_start(client_x_pos);
    };

    let highlight_rect = dragging_box && <rect
        x={Math.min(x_pos_box_start, x_pos_box_curr)}
        y={MAIN_CHART_TOP}
        height={MAIN_CHART_BOTTOM - MAIN_CHART_TOP}
        width={Math.abs(x_pos_box_curr - x_pos_box_start)}
        fill="rgba(0,0,0,0.2)"
    />

    //========================================================================
    // Highlight closest point

    const [hovered_point_text, set_hovered_point_text] = useState("");

    const on_center_rect_hover = (e) => {
        try {
            let client_x_pos = convert_world_to_svg_coord(e.clientX);

            let hovered_time = main_chart_x_to_time(client_x_pos);
            let chosen_index = find_target_time_index(hovered_time, data)
            let new_x_pos_1 = time_to_main_chart_x(data[chosen_index][0]);
            let new_y_pos_1 = main_chart_value_to_y(data[chosen_index][1]);

            let new_x_pos_2 = time_to_main_chart_x(data[chosen_index + 1][0]);
            let new_y_pos_2 = main_chart_value_to_y(data[chosen_index + 1][1]);


            if (Math.abs(new_x_pos_1 - e.clientX) < Math.abs(new_x_pos_2 - client_x_pos)) {
                set_hovered_point_pos([new_x_pos_1, new_y_pos_1]);
                set_hovered_point_text(data[chosen_index][1]);
            } else {
                set_hovered_point_pos([new_x_pos_2, new_y_pos_2]);
                set_hovered_point_text(data[chosen_index + 1][1]);
            }
        } catch (e) { }
    }


    const hovered_point = hide_closest_point ? null :
        <g transform={`translate(${hovered_point_pos[0]},${hovered_point_pos[1]})`}>
            <circle cx={0} cy={0} r="3" />
            <text
                paintOrder="stroke"
                strokeWidth="2px"
                stroke="white"
                x="0"
                y="-5"
                fontFamily="Arial"
                fontSize="10"
                textAnchor="middle"
                pointerEvents="none"
                userSelect="none"
                fill="black">{hovered_point_text}</text>
        </g>

    let clickable_rect = <rect
        onMouseDown={on_center_rect_click}
        onMouseMove={on_center_rect_hover}
        onMouseLeave={() => set_hovered_point_pos([-100, -100])}
        x="0"
        y={MAIN_CHART_TOP}
        width={width}
        height={MAIN_CHART_BOTTOM - MAIN_CHART_TOP}
        fill="rgba(0,0,0,0.0)"
    />


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

                <rect
                    x={0}
                    y={MAIN_CHART_BOTTOM}
                    height={NAVBAR_BOTTOM - MAIN_CHART_BOTTOM}
                    width={width}
                    stroke="none"
                    fill="#faedfc"
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
                        screenWidth={width}
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
                        screenWidth={width}
                    />
                </g>
                {navbar_dates}
                {main_chart_dates}
                <text
                    x="15"
                    y="17"
                    fontFamily="Arial"
                    fontSize="10"
                    textAnchor="start"
                    pointerEvents="none"
                    userSelect="none"
                    fill="black">{vertical_line_time}</text>
                <rect
                    onClick={() => { set_show_vertical_line(prev => !prev); }}
                    x={width - 90}
                    rx="3"
                    y="7"
                    width="90"
                    height="13"
                    fill="rgba(0,0,0,.1)"
                />
                <text
                    x={width - 44}
                    y="17"
                    fontFamily="Arial"
                    fontSize="10"
                    textAnchor="middle"
                    pointerEvents="none"
                    userSelect="none"
                    fill="black"> {show_vertical_line ? "hide center line" : "show center line"}</text>
                <rect
                    onClick={() => { set_x_pos_brush_1(0); set_x_pos_brush_2(width); }}
                    x={width - 150}
                    rx="3"
                    y="7"
                    width="50"
                    height="13"
                    fill="rgba(0,0,0,.1)"
                />
                <text
                    x={width - 125}
                    y="17"
                    fontFamily="Arial"
                    fontSize="10"
                    textAnchor="middle"
                    pointerEvents="none"
                    userSelect="none"
                    fill="black">reset</text>

                {horizontal_lines}
                {vertical_line}
                <line
                    x1="0"
                    x2={width}
                    y1={MAIN_CHART_BOTTOM}
                    y2={MAIN_CHART_BOTTOM}
                    stroke="black"
                />
                <text
                    x={width / 2}
                    y="17"
                    fontFamily="Arial"
                    fontSize="13"
                    textAnchor="middle"
                    pointerEvents="none"
                    userSelect="none"
                    fill="black">{title}</text>
                {hovered_point}
                {clickable_rect}
                {highlight_rect}
                {loading && <g>
                    <rect
                        x="0"
                        y="0"
                        width={width}
                        height={height}
                        fill="rgba(0,0,0,0.2)"
                    />
                    <text
                        x={width / 2}
                        y={height / 2}
                        textAnchor="middle"
                        fontWeight="bold"
                        fontSize="2rem"
                        fill="rgba(0,0,0,0.6)"
                    >
                        LOADING
                    </text>
                </g>}
            </svg>
        </div>
    );
};

export default MyChart;