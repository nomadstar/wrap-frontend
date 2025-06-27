"use client";

import AnimatedBackground from "./background";
import { ReactNode, useEffect, useState } from "react";

type BackgroundProps = {
    children: ReactNode;
};

function Background({ children }: BackgroundProps) {
    return (
        <div>
            <AnimatedBackground />
            {children}
        </div>
    );
}

type RegisterFormProps = {
    isMobile: boolean;
};

function RegisterForm({ isMobile }: RegisterFormProps) {
    // form implementation
    return (
        <div>
            {/* Register form goes here. isMobile: {isMobile ? "Yes" : "No"} */}
            <p>Is mobile: {isMobile ? "Yes" : "No"}</p>
        </div>
    );
}

export default function RegisterPage() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    return (
        <Background>
            <RegisterForm isMobile={isMobile} />
        </Background>
    );
}
