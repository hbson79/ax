"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedWrapperProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedWrapper({
  children,
  className,
  delay = 0,
}: AnimatedWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
