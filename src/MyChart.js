import React from 'react';
import { useState, useEffect } from 'react';


function mapRange(value, fromMin, fromMax, toMin, toMax) {
    // Ensure the input value is within the source range
    const clampedValue = Math.min(Math.max(value, fromMin), fromMax);

    // Calculate the percentage of the input value within the source range
    const percentage = (clampedValue - fromMin) / (fromMax - fromMin);

    // Map the percentage to the target range and return the result
    const mappedValue = toMin + percentage * (toMax - toMin);
    return mappedValue;
}

const Label = ({ center, adjustment }) => {
    const [dragging, setDragging] = useState(false);
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [origin, setOrigin] = useState({ x: 0, y: 0 });

    // Add our new coordinates to the X and Y position values.
    const labelX = center[0] + adjustment[0] + coordinates.x;
    const labelY = center[1] + adjustment[1] + coordinates.y;

    return (
        <g
            style={{ userSelect: 'none' }}
            transform={`translate(${labelX}, ${labelY})`}
            onMouseDown={e => {
                // Record our starting point.
                setOrigin({ x: e.clientX, y: e.clientY });
                setDragging(true);
            }}
            onMouseMove={e => {
                if (dragging) {
                    // Set state for the change in coordinates.
                    setCoordinates({
                        x: e.clientX - origin.x,
                        y: e.clientY - origin.y,
                    });
                }
            }}
            onMouseUp={() => {
                setDragging(false);
            }}
        >
            <text>
                hello
            </text>
        </g>
    );
};

const Brush = ({ 
    start_x=0, 
    start_y 
}) => {
    const [dragging, set_dragging] = useState(false);
    const [x_origin, set_x_origin] = useState(0);
    const [x_pos, set_x_pos] = useState(start_x);
    useEffect(() => {

        const handle_mouse_move = function (e) {
            e.stopPropagation();
            if (dragging) {
                console.log("====")
                console.log(`e.clientX: ${e.clientX}`);
                console.log(`x_origin: ${x_origin}`);
                set_x_pos(e.clientX - x_origin)
            }
        }
        const handle_mouse_up = function (e) {
            console.log("xxxxxxxxxxxx")
            e.stopPropagation()
            set_dragging(false);
        }
        window.addEventListener('mousemove', handle_mouse_move);
        window.addEventListener('mouseup', handle_mouse_up);

        return () => {
            window.removeEventListener('mousemove', handle_mouse_move);
            window.removeEventListener('mouseup', handle_mouse_up);
        };
    }, [x_pos, dragging, x_origin]);

    return <circle
        onMouseDown={(e) => {
            e.stopPropagation();
            set_x_origin(e.clientX - x_pos);
            set_dragging(true);
        }}
        cx={x_pos}
        cy={start_y}
        r={50}
    />
}


const MyChart = ({
    height,
    width,
    data
}) => {
    const NAVBAR_HEIGHT = 50;
    const NAVBAR_RESOLUTION = 200;

    const start_time = data[0][0];
    const end_time = data[data.length - 1][0];
    const navbar_step_size = data.length / NAVBAR_RESOLUTION;

    const [brush_1, set_brush_1] = useState(data[10][0]);
    const [brush_2, set_brush_2] = useState(data[20][0]);

    const time_to_navbar_x = (time) => {
        return mapRange(time, start_time, end_time, 0, width);
    }

    let navbar_points = `0,${NAVBAR_HEIGHT} `;
    for (let i = 0; i < data.length; i += navbar_step_size) {
        let x_pos = time_to_navbar_x(data[Math.floor(i)][0]);
        let y_pos = mapRange(data[Math.floor(i)][1], 0, 100, 0, NAVBAR_HEIGHT);
        navbar_points += `${x_pos},${y_pos} `
    }
    navbar_points += `${width},${NAVBAR_HEIGHT}`;


    const start_brush_x = time_to_navbar_x(Math.min(brush_1, brush_2));
    const end_brush_x = time_to_navbar_x(Math.max(brush_1, brush_2));
    const brush_width = end_brush_x - start_brush_x;
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
                {/* <rect
                    x="0"
                    stroke="none"
                    y={height - NAVBAR_HEIGHT}
                    width="100%" height={NAVBAR_HEIGHT}
                    fill="white" /> */}
                <g transform={`translate(0, ${height - NAVBAR_HEIGHT})`}>
                    <polyline
                        points={navbar_points}
                        fill="lightblue"
                        stroke="black" />
                </g>

                <rect
                    x={start_brush_x}
                    y={height - NAVBAR_HEIGHT}
                    height={NAVBAR_HEIGHT}
                    width={brush_width}
                    stroke="none"
                    fill="rgba(100,100,100,0.5)"
                />

                <line
                    strokeLinecap="round"
                    x1={start_brush_x}
                    y1={height - NAVBAR_HEIGHT}
                    x2={start_brush_x}
                    y2={height}
                    strokeWidth="4"
                    stroke="black" />

                <line
                    strokeLinecap="round"
                    x1={end_brush_x}
                    y1={height - NAVBAR_HEIGHT}
                    x2={end_brush_x}
                    y2={height}
                    strokeWidth="4"
                    stroke="black" />
                <Brush />
            </svg>
        </div>
    );
};

export default MyChart;