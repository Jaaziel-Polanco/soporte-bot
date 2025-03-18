"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Paper, Box, TextField, IconButton, Typography, Button } from '@mui/material';
import { Send } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import IntentsModal from './IntentsModal'; // Ajusta la ruta según tu estructura
import Image from 'next/image';

const ChatWidget: React.FC = () => {
    const { messages, addMessage, handleUserQuery, selectIntent, getFilteredIntents } = useChatStore();
    const [input, setInput] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messages.length === 0) {
            addMessage({ type: 'bot', text: "¡Bienvenido al Chat de Soporte! ¿En qué puedo ayudarte hoy?" });
        }
    }, [messages, addMessage]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const filteredIntents = getFilteredIntents(input);
    const intentsToShow = filteredIntents.slice(0, 4);

    const handleSend = () => {
        if (input.trim() === '') return;
        handleUserQuery(input);
        setInput('');
    };

    return (
        <div className="flex flex-col items-center">
            {/* Encabezado superior con logo y título */}
            <Box className="mb-6 flex items-center gap-4">
                <Image
                    src="/image.png"
                    alt="Logo Claro"
                    className="w-12 h-12 object-contain"
                />
                <Typography variant="h4" className="text-[#E60000] font-extrabold drop-shadow-lg">
                    Centro de Operaciones y Aprovisionamiento
                </Typography>
            </Box>

            <Paper elevation={3} className="w-full max-w-md rounded-lg overflow-hidden">
                {/* Header del Chat con Claro red */}
                <Box className="bg-[#E60000] p-4 flex items-center gap-2">
                    <Image
                        src="/image.png"
                        alt="Logo Claro"
                        className="w-8 h-8 object-contain"
                    />
                    <Typography variant="h6" className="text-white font-semibold">
                        Chat Soporte
                    </Typography>
                </Box>

                {/* Área de mensajes */}
                <Box className="p-4 h-80 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}
                        >
                            <Box
                                className={`inline-block px-4 py-2 rounded-lg ${msg.type === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800'
                                    }`}
                            >
                                <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                    {msg.text}
                                </Typography>
                            </Box>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Área de intents filtrados y entrada */}
                <Box className="p-4 border-t border-gray-300">
                    <Box className="mb-2 flex flex-wrap gap-2">
                        {intentsToShow.map((intent, idx) => (
                            <Button key={idx} variant="outlined" size="small" onClick={() => selectIntent(intent)}>
                                {intent.title}
                            </Button>
                        ))}
                        {filteredIntents.length > 4 && (
                            <Button variant="outlined" size="small" onClick={() => setModalOpen(true)}>
                                Ver más
                            </Button>
                        )}
                    </Box>
                    <Box className="flex">
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Describe tu problema o elige una opción"
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                if (e.target.value === "") setModalOpen(false);
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                        />
                        <IconButton color="primary" onClick={handleSend}>
                            <Send />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>

            {/* Modal para ver todos los intents */}
            <IntentsModal
                open={modalOpen}
                intents={filteredIntents}
                onSelect={(intent) => selectIntent(intent)}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
};

export default ChatWidget;
