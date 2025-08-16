/**
 * /packages/shared/src/utils/mountHelper.ts
 * Standardized mount helper for microfrontends
 * Ensures proper context providers and event bus integration
 */
import React from 'react';
interface MountHelperProps {
    configType?: string;
    onNavigateTo?: (id: string) => void;
    onNavigateBack?: () => void;
}
export interface MountOptions<P = Record<string, any>> {
    domElement: HTMLElement;
    Component: React.ComponentType<P>;
    props?: P & MountHelperProps & Record<string, any>;
    appId?: string;
    onUnmount?: () => void;
}
/**
 * Creates a standardized mounter function for MFEs
 * Ensures consistent provider wrapping and event handling
 */
/**
 * Creates a standardized mounter function for MFEs
 * Ensures consistent provider wrapping and event handling
 */
export declare function createMounter<P = Record<string, any>>(options: MountOptions<P>): {
    unmount: () => void;
};
export {};
