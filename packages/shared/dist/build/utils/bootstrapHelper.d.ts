/**
 * MFE bootstrap status
 */
export interface BootstrapResult {
    success: boolean;
    config?: any;
    error?: any;
}
/**
 * Get shell service URL from globals
 */
export declare function getShellServiceUrl(): string | undefined;
/**
 * Bootstrap MFE by loading configuration from the shell service
 * and configuring required services. This should be called by each MFE on mount.
 *
 * @param mfeId Identifier for the MFE (for logging)
 * @returns Promise with bootstrap result
 */
export declare function bootstrapConfig(mfeId: string): Promise<BootstrapResult>;
