/**
 * /packages/shared/src/config/defaults.ts
 * Defines default values for configuration structures.
 * NOTE: This default object might not be directly used by the application,
 * as the configuration is primarily fetched from the shell_service.
 * However, it needs to conform to the ShellConfigurationResponse type
 * for type checking during the build process.
 */
import { ShellConfigurationResponse } from '../types/shell';
export declare const defaultShellConfiguration: ShellConfigurationResponse;
