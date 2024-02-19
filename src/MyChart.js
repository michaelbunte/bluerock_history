import React from 'react';
import { useState, useEffect } from 'react';

const NAVBAR_HEIGHT = 50;
const NAVBAR_RESOLUTION = 200;

function mapRange(value, fromMin, fromMax, toMin, toMax) {
    // Ensure the input value is within the source range
    const clampedValue = Math.min(Math.max(value, fromMin), fromMax);

    // Calculate the percentage of the input value within the source range
    const percentage = (clampedValue - fromMin) / (fromMax - fromMin);

    // Map the percentage to the target range and return the result
    const mappedValue = toMin + percentage * (toMax - toMin);
    return mappedValue;
}


const Brush = ({
    x_pos,
    y_pos
}) => {
    return <g
    // onMouseDown={(e) => {
    //     e.stopPropagation();
    //     set_x_origin(e.clientX - x_pos);
    //     set_dragging(true);
    // }}
    >
        <rect
            x={x_pos - 5}
            y={y_pos + NAVBAR_HEIGHT / 4}
            width={10}
            height={NAVBAR_HEIGHT / 2}
        />
        <line
            strokeLinecap="round"
            x1={x_pos}
            y1={y_pos}
            x2={x_pos}
            y2={y_pos + NAVBAR_HEIGHT}
            strokeWidth="4"
            stroke="black" />
    </g>
}


const MyChart = ({
    height,
    width,
    data
}) => {

    const start_time = data[0][0];
    const end_time = data[data.length - 1][0];
    const navbar_step_size = data.length / NAVBAR_RESOLUTION;

    const [brush_1, set_brush_1] = useState(data[10][0]);
    const [brush_2, set_brush_2] = useState(data[20][0]);

    const time_to_navbar_x = (time) => {
        return mapRange(time, start_time, end_time, 0, width);
    }


    const [dragging_brush_1, set_dragging_brush_1] = useState(false);
    const [x_origin_brush_1, set_x_origin_brush_1] = useState(0);
    const [x_pos_brush_1, set_x_pos_brush_1] = useState(100);
    useEffect(() => {
        const handle_mouse_move = function (e) {
            e.stopPropagation();
            if (dragging_brush_1) {
                set_x_pos_brush_1(e.clientX - x_origin_brush_1)
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


    const [dragging_brush_2, set_dragging_brush_2] = useState(false);
    const [x_origin_brush_2, set_x_origin_brush_2] = useState(0);
    const [x_pos_brush_2, set_x_pos_brush_2] = useState(200);
    useEffect(() => {
        const handle_mouse_move = function (e) {
            e.stopPropagation();
            if (dragging_brush_2) {
                set_x_pos_brush_2(e.clientX - x_origin_brush_2)
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