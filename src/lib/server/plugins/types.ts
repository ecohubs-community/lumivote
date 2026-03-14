import type { EventName, EventHandler } from '../events';

// ─── Plugin types ───────────────────────────────────────────────────────────

/**
 * A partial mapping from event names to handlers.
 * Plugins only subscribe to the events they care about.
 */
export type PluginHandlers = {
	[E in EventName]?: EventHandler<E>;
};

/**
 * A plugin registers a name and a set of event handlers.
 *
 * Plugins may read system data, store plugin-specific data,
 * trigger external APIs, or emit additional events.
 * Plugins must NOT modify core governance rules.
 */
export interface Plugin {
	/** Unique identifier for logging and debugging */
	name: string;
	/** Map of event names to handler functions */
	handlers: PluginHandlers;
}
