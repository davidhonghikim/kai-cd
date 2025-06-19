import * as serviceHandlers from './serviceHandlers';
import * as chatHandlers from './chatHandlers';
import * as imageHandlers from './imageHandlers';
import * as promptHandlers from './promptHandlers';
import * as panelHandlers from './panelHandlers';
import * as uiHandlers from './uiHandlers';

/**
 * A registry of all available background request handlers.
 * This pattern allows for easy addition of new handlers and avoids circular dependencies.
 */
export const handlers = {
  ...serviceHandlers,
  ...chatHandlers,
  ...imageHandlers,
  ...promptHandlers,
  ...panelHandlers,
  ...uiHandlers
};

export type Action = keyof typeof handlers;
