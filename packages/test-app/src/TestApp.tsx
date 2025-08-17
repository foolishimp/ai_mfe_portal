/**
 * /packages/test-app/src/TestApp.tsx
 * --- ADDED LOGGING for Event Bus Debugging ---
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Box, Typography, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { eventBus as localEventBus } from 'shared'; // Import local instance

// Define expected structure for props if mount passes them
interface TestAppProps {
    name?: string;
    domElement?: HTMLElement;
    eventBus?: typeof localEventBus; // Allow passing bus via props (though likely unused now)
}

// *** FIX START: Augment the global Window interface ***
declare global {
    interface Window {
        // Declare the custom property and its expected type
        __C4H_EVENT_BUS__?: typeof localEventBus;
    }
}
// *** FIX END ***

// Dark theme for test app to match portal
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { 
            main: '#667eea',
        },
        background: { 
            default: 'transparent',
            paper: 'rgba(255, 255, 255, 0.08)'
        },
        text: {
            primary: 'rgba(255, 255, 255, 0.95)',
            secondary: 'rgba(255, 255, 255, 0.7)'
        }
    }
});

const TestApp: React.FC<TestAppProps> = (props) => {
    const [messageCount, setMessageCount] = useState(0);

    // --- Determine which bus instance to use ---
    // Prioritize window global, fall back to local import
    // Accessing window.__C4H_EVENT_BUS__ is now type-safe
    const bus = window.__C4H_EVENT_BUS__ || localEventBus;
    const busSource = window.__C4H_EVENT_BUS__ ? 'window.__C4H_EVENT_BUS__' : 'localEventBus import';
    // Log which bus instance is selected on initial render
    console.log(`[TestApp] Initializing. Using event bus instance from: ${busSource}`);
    // --- End Bus Instance Determination ---

    // Keep stable reference to lastMessage using ref instead of state
    const lastMessageRef = React.useRef<any>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);

    // Stable callback to handle received messages
    const handleTestMessage = useCallback((detail: any) => {
        console.log('[TestApp] handleTestMessage received:', detail);
        lastMessageRef.current = detail;
        setLastMessage(detail);
        setMessageCount(prev => {
            const newCount = prev + 1;
            console.log(`[TestApp] Updating messageCount from ${prev} to ${newCount}`);
            return newCount;
        });
    }, []); // No dependencies needed

    // Effect for subscribing and unsubscribing
    useEffect(() => {
        console.log(`[TestApp] useEffect running. Subscribing using bus from: ${busSource}`);
        bus.publish('test:mounted', {
            source: 'test-app',
            payload: { timestamp: Date.now(), message: 'TestApp mounted' }
        });
        const unsubscribe = bus.subscribe('test:ping', handleTestMessage);
        setTimeout(() => {
            console.log('[TestApp] Sending initial self-ping test message');
            bus.publish('test:ping', {
                source: 'test-app',
                payload: { timestamp: Date.now(), text: 'Self-ping on mount' }
            });
        }, 500);
        return () => {
            console.log(`[TestApp] useEffect cleanup. Unsubscribing using bus from: ${busSource}`);
            unsubscribe();
            bus.publish('test:unmounted', { source: 'test-app', payload: { timestamp: Date.now() } });
        };
    }, [bus, handleTestMessage, busSource]); // Dependencies are correct

    const handleSendMessage = () => {
        const message = { timestamp: Date.now(), text: 'Ping from TestApp' };
         console.log(`[TestApp] Sending 'test:ping' using bus from: ${busSource}`, message);
        bus.publish('test:ping', { source: 'test-app', payload: message });
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ 
                border: '2px dashed #667eea', 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2, 
                m: 1,
                color: 'white'
            }}>
                <Typography variant="h6" color="primary">Test App</Typography>
                <Typography color="text.primary">Loaded successfully!</Typography>
                <Typography color="text.primary">Messages Received: {messageCount}</Typography>
                <Typography color="text.primary">
                    Last Message:
                    {lastMessage ? '' : ' (None yet - try clicking the button below)'}
                </Typography>
                <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-all', 
                    background: 'rgba(0, 0, 0, 0.4)', 
                    color: '#e0e0e0',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    fontSize: '0.85em',
                    marginTop: '8px',
                    marginBottom: '8px'
                }}>
                    {JSON.stringify(lastMessage, null, 2)}
                </pre>
                <Button 
                    variant="contained" 
                    onClick={handleSendMessage} 
                    sx={{ 
                        mt: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b399f 100%)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                        }
                    }}
                >
                    Send Test Message (Ping)
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                    Using Event Bus from: {busSource}
                </Typography>
            </Box>
        </ThemeProvider>
    );
};

export default TestApp;