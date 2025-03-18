"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Fuse from 'fuse.js';
import { ChatIntent, chatIntents } from './chatIntents';

export interface Message {
    type: 'user' | 'bot';
    text: string;
}

interface ChatContextProps {
    messages: Message[];
    chatIntents: ChatIntent[];
    addMessage: (msg: Message) => void;
    selectIntent: (intent: ChatIntent) => void;
    handleUserQuery: (query: string) => void;
    getFilteredIntents: (query: string) => ChatIntent[];
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const intents = chatIntents;

    const fuse = new Fuse(intents, {
        keys: ['title', 'description', 'examples', 'response'],
        threshold: 0.4,
        ignoreLocation: true,
        includeMatches: true,
        minMatchCharLength: 3
    });

    const addMessage = (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
    };

    // Simula efecto "Escribiendo…" antes de mostrar la respuesta
    const selectIntent = (intent: ChatIntent) => {
        addMessage({ type: 'user', text: intent.title });
        addMessage({ type: 'bot', text: "..." });
        setTimeout(() => {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { type: 'bot', text: intent.response };
                return newMessages;
            });
        }, 2000); // 2 segundos de delay
    };

    const handleUserQuery = (query: string) => {
        addMessage({ type: 'user', text: query });
        const result = fuse.search(query);
        if (result.length > 0) {
            selectIntent(result[0].item);
        } else {
            addMessage({
                type: 'bot',
                text: "No encontré información exacta. Por favor, verifica tu consulta o consulta con un entrenador."
            });
        }
    };

    const getFilteredIntents = (query: string): ChatIntent[] => {
        if (query.trim() === "") {
            return intents;
        }
        const result = fuse.search(query);
        return result.map(r => r.item);
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                chatIntents: intents,
                addMessage,
                selectIntent,
                handleUserQuery,
                getFilteredIntents,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChatStore = (): ChatContextProps => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatStore must be used within a ChatProvider");
    }
    return context;
};
