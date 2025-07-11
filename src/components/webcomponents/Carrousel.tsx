import React, { useState, useRef } from "react";
import "./Carrousel.css";

const Carrousel: React.FC = () => {
    const images = [
        { src: "/assets/cover.jpg", alt: "TCG Card Collection 1" },
        { src: "/assets/hero-bg.webp", alt: "Trading Card Game 2" },
        { src: "/assets/Simbol.png", alt: "WrapSell Platform 3" },
        { src: "/assets/cover.jpg", alt: "Crypto Trading 4" }
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
        <div data-slot="carousel" style={{
            width: 600,
            height: 350,
            margin: "40px auto",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}>
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
                        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                >
                    {images.map((image, idx) => (
                        <div
                            data-slot="carousel-item"
                            key={idx}
                            style={{
                                width: `${100 / images.length}%`,
                                height: "100%",
                                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2rem",
                                color: "#64748b",
                                position: "relative"
                            }}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "cover",
                                    borderRadius: "8px"
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div style={{
                                position: "absolute",
                                bottom: "16px",
                                left: "16px",
                                right: "16px",
                                background: "rgba(0, 0, 0, 0.7)",
                                color: "white",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}>
                                {image.alt}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button
                data-slot="carousel-previous"
                onClick={prevSlide}
                aria-label="Previous Slide"
                style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    cursor: "pointer",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(4px)"
                }}
                onMouseOver={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(0, 0, 0, 0.8)";
                    (e.target as HTMLElement).style.transform = "translateY(-50%) scale(1.1)";
                }}
                onMouseOut={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(0, 0, 0, 0.5)";
                    (e.target as HTMLElement).style.transform = "translateY(-50%) scale(1)";
                }}
            >
                &#8592;
            </button>
            <button
                data-slot="carousel-next"
                onClick={nextSlide}
                aria-label="Next Slide"
                style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    cursor: "pointer",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(4px)"
                }}
                onMouseOver={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(0, 0, 0, 0.8)";
                    (e.target as HTMLElement).style.transform = "translateY(-50%) scale(1.1)";
                }}
                onMouseOut={(e) => {
                    (e.target as HTMLElement).style.background = "rgba(0, 0, 0, 0.5)";
                    (e.target as HTMLElement).style.transform = "translateY(-50%) scale(1)";
                }}
            >
                &#8594;
            </button>
            <div style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "8px",
                background: "rgba(0, 0, 0, 0.3)",
                padding: "8px 12px",
                borderRadius: "20px",
                backdropFilter: "blur(4px)"
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
                            transition: "all 0.3s ease",
                            transform: idx === current ? "scale(1.2)" : "scale(1)"
                        }}
                        onClick={() => goTo(idx)}
                        onMouseOver={(e) => {
                            if (idx !== current) {
                                (e.target as HTMLElement).style.background = "rgba(255,255,255,0.8)";
                            }
                        }}
                        onMouseOut={(e) => {
                            if (idx !== current) {
                                (e.target as HTMLElement).style.background = "rgba(255,255,255,0.5)";
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carrousel;
