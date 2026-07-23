import "./Evaluation.css";

function ToolButton({
    icon,
    label,
    onClick,
    variant = "default"
}) {

    return (

        <button
            className={`tool-button ${variant}`}
            title={label}
            onClick={onClick}
        >

            {icon}

        </button>

    );

}

export default ToolButton;