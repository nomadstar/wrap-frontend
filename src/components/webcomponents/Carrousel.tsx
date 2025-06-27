import React, { useState, useRef } from "react";
import "./Carrousel.css";

const Carrousel: React.FC = () => {
    const images = [
        { src: "/ruta/imagen1.jpg", alt: "Descripción 1" },
        { src: "/ruta/imagen2.jpg", alt: "Descripción 2" },
        { src: "/ruta/imagen3.jpg", alt: "Descripción 3" },
        { src: "/ruta/imagen4.jpg", alt: "Descripción 4" }
    ];

    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const timeout = useRef<NodeJS.Timeout | null>(null);

    const goTo = (idx: number) => {
        setAnimating(true);
        setCurrent(idx);
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => setAnimating(false), 600);
    };

    const prevSlide = () => goTo(current === 0 ? images.length - 1 : current - 1);
    const nextSlide = () => goTo(current === images.length - 1 ? 0 : current + 1);

    return (
        <div data-slot="carousel" style={{ width: 600, height: 350, margin: "40px auto" }}>
            <div
                data-slot="carousel-content"
                className={animating ? "is-animating" : ""}
                style={{ width: "100%", height: "100%" }}
            >
                <div
                    style={{
                        display: "flex",
                        width: `${images.length * 100}%`,
                        transform: `translateX(-${current * (100 / images.length)}%)`,
                        height: "100%",
                    }}
                >
                    {images.map((image, idx) => (
                        <div
                            data-slot="carousel-item"
                            key={idx}
                            style={{
                                width: `${100 / images.length}%`,
                                height: "100%",
                                background: "#e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2rem",
                                color: "#888"
                            }}
                        >
                            <img src={image.src} alt={image.alt} style={{maxWidth: "100%", maxHeight: "100%"}} />
                        </div>
                    ))}
                </div>
            </div>
            <button data-slot="carousel-previous" onClick={prevSlide} aria-label="Previous Slide">
                &#8592;
            </button>
            <button data-slot="carousel-next" onClick={nextSlide} aria-label="Next Slide">
                &#8594;
            </button>
            <div style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "8px"
            }}>
                {images.map((_, idx) => (
                    <span
                        key={idx}
                        style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: idx === current ? "#fff" : "rgba(255,255,255,0.5)",
                            border: "2px solid #fff",
                            display: "inline-block",
                            cursor: "pointer",
                            transition: "background 0.3s"
                        }}
                        onClick={() => goTo(idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carrousel;
