import { systemConfig } from './system.env';
import { userConfig } from './user.env';

/**
 * A simple deep merge function.
 */
function mergeDeep(target: any, source: any) {
	const output = { ...target };
	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach((key) => {
			if (isObject(source[key])) {
				if (!(key in target)) {
					Object.assign(output, { [key]: source[key] });
				} else {
					output[key] = mergeDeep(target[key], source[key]);
				}
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		});
	}
	return output;
}

function isObject(item: any) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Centralized Application Configuration
 *
 * This file merges the system's default configuration (`system.env.ts`)
 * with user-specific overrides (`user.env.ts`).
 *
 * User settings will take precedence over system settings.
 */

// Deep merge the system and user configurations.
const mergedConfig = mergeDeep(systemConfig, userConfig);

export const config = mergedConfig; 