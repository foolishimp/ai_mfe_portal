import React from 'react';
interface RemoteComponentProps {
    url: string;
    scope: string;
    module: string;
    fallback?: React.ReactNode;
    props?: Record<string, any>;
}
declare const RemoteComponent: React.FC<RemoteComponentProps>;
export default RemoteComponent;
