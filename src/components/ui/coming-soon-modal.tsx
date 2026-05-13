"use client";

import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ComingSoonModal = ({ isOpen, onClose }: ComingSoonModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-background border border-border rounded-lg shadow-2xl max-w-md w-full p-6 relative">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 rounded-full hover:bg-foreground/5 transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>

                            {/* Content */}
                            <div className="text-center space-y-4">
                                <div className="text-6xl">🚧</div>
                                <h2 className="text-2xl font-semibold text-foreground">
                                    Coming Soon!
                                </h2>
                                <p className="text-muted-foreground">
                                    This section is currently under construction. Check back soon for updates!
                                </p>
                                <button
                                    onClick={onClose}
                                    className="mt-4 px-6 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
