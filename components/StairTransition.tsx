"use client";

import { usePathname } from "next/navigation"; // Next.js App Router 获取当前路径
import { AnimatePresence, motion } from "framer-motion";

const StairTransition = () => {
    const pathname = usePathname(); // 替代 React Router 的 useLocation
    //   console.log("StairTransition", pathname);

    return (
        <AnimatePresence mode="wait">
            {/* <div key={pathname}> */}
            {/* Stairs 动画 */}
            <div className="h-screen w-screen fixed top-0 left-0 right-0 z-[99] flex flex-row pointer-events-none">
                <Stairs />
            </div>

            {/* 遮罩层淡出 */}
            <motion.div
                key={`overlay-${pathname}`}
                className="h-screen w-screen fixed top-0 pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{
                    opacity: 0,
                    transition: { delay: 1, duration: 0.4, ease: "easeInOut" },
                }}
            />
            {/* </div> */}
        </AnimatePresence>
    );
};

export default StairTransition;


const stairAnimation = {
    initial: {
        top: "0%",
    },
    animate: {
        top: "100%",
    },
    exit: {
        top: ["0%", "100%"],
    },
};
const step = 6;
const reverseIndex = (index: number) => {
    const totalSteps = step;
    return totalSteps - index - 1;
};

const Stairs = () => {
    return (
        <>
            {[...Array(step)].map((_, index) => {
                return (
                    <motion.div
                        key={index}
                        variants={stairAnimation}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                            delay: reverseIndex(index) * 0.1,
                        }}
                        className="h-full w-full bg-brand-orange relative z-10"
                    >
                        {/* <div className="bg-amber-200"></div> */}
                    </motion.div>
                );
            })}
        </>
    );
};
