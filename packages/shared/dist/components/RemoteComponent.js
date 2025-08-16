import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// File: packages/shared/src/components/RemoteComponent.tsx
import { useEffect, useState } from 'react';
const RemoteComponent = ({ url, scope, module, fallback = _jsx("div", { children: "Loading remote component..." }), props = {} }) => {
    const [Component, setComponent] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!url || !scope || !module) {
            setError(new Error('Missing required parameters to load remote component'));
            return;
        }
        // Initialize the shared scope
        // @ts-ignore
        if (!window.__FEDERATION__) {
            // @ts-ignore
            window.__FEDERATION__ = { shared: {} };
        }
        const scriptId = `remote-${scope}-${module.replace(/[/.]/g, '-')}`;
        // Check if component is already loaded in global registry
        // @ts-ignore
        if (window[scope]) {
            try {
                // @ts-ignore
                const container = window[scope];
                // Handle both formats - with or without ./ prefix
                const moduleName = module.replace(/^\.\//, '');
                const factory = container.get(moduleName);
                if (factory) {
                    const Component = factory();
                    setComponent(() => Component.default || Component);
                    return;
                }
            }
            catch (err) {
                console.error(`Error accessing existing remote component ${scope}/${module}:`, err);
            }
        }
        // Load the remote entry if not already loaded
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.src = url;
            script.id = scriptId;
            script.type = 'text/javascript';
            script.async = true;
            script.onload = () => {
                try {
                    // @ts-ignore
                    if (window[scope]) {
                        // Initialize the container properly
                        // @ts-ignore
                        if (typeof window[scope].init === 'function') {
                            // @ts-ignore
                            window[scope].init(window.__FEDERATION__.shared);
                        }
                        // Get the component factory
                        // @ts-ignore
                        const container = window[scope];
                        const moduleName = module.replace(/^\.\//, '');
                        const factory = container.get(moduleName);
                        if (factory) {
                            const Component = factory();
                            setComponent(() => Component.default || Component);
                        }
                        else {
                            throw new Error(`Module "${moduleName}" not found in remote "${scope}"`);
                        }
                    }
                    else {
                        throw new Error(`Remote container "${scope}" not found after loading script`);
                    }
                }
                catch (err) {
                    console.error(`Error loading remote component ${scope}/${module}:`, err);
                    setError(err instanceof Error ? err : new Error(String(err)));
                }
            };
            script.onerror = (err) => {
                console.error(`Error loading remote entry from ${url}:`, err);
                setError(new Error(`Failed to load script from ${url}`));
            };
            document.head.appendChild(script);
            return () => {
                if (document.getElementById(scriptId)) {
                    document.head.removeChild(script);
                }
            };
        }
    }, [url, scope, module]);
    if (error) {
        console.error('Remote component error:', error);
        return (_jsxs("div", { style: { padding: '16px', color: '#f44336', border: '1px solid #f44336', borderRadius: '4px', margin: '8px 0' }, children: [_jsx("strong", { children: "Error loading component:" }), " ", error.message] }));
    }
    return Component ? _jsx(Component, { ...props }) : _jsx(_Fragment, { children: fallback });
};
export default RemoteComponent;
