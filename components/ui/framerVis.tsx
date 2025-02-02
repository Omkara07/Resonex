"use client";
import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

export default function Framer({ children, iniX = 0, duration }: { children: React.ReactNode, iniX?: number, duration: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ x: iniX, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: iniX, opacity: 0 }}
            transition={{
                duration: duration,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
}