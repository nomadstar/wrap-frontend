import React from "react";
import "./background.css";

const AnimatedBackground: React.FC = () => (
    <div className="animated-bg">
        {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`square square${(i % 5) + 1}`} />
        ))}
    </div>
);

export default AnimatedBackground;