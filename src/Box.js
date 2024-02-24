function Box({
    contents,
    topColor="#54b8ff"
}) {
    return <div style={{
        borderTop: `4px ${topColor} solid`,
        padding: "10px",
        margin: "10px",
        background: "white",
        borderRadius: "5px",
        boxShadow: "0px 0px 17px 1px rgba(0,0,0,0.32)"
    }}>
        {contents}
    </div>
}

export default Box;