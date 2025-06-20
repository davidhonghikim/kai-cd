/**
 * User-specific Configuration Overrides
 *
 * Create a copy of this file named `user.env.ts` to override the default
 * settings from `system.env.ts`.
 *
 * This file is ignored by Git, so your local settings and secrets are safe.
 * You only need to include the settings you want to change.
 *
 * Example:
 */
export const userConfig = {
    networking: {
        localIp: '192.168.1.159',   // Your local development machine's IP
        remoteIp: '192.168.1.180',  // The IP of a remote server
    },
    // You can also override other settings, for example:
    // services: {
    //     defaultOllamaModel: 'llama3:latest'
    // }
}; 