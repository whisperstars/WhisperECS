import { ComponentBase } from './Component';
import type { World } from './World';

export interface SystemBase {
  world: World;
  init?: () => void;
  // @ts-ignore
  onEnter?: (time, delta) => void;
  // @ts-ignore
  update?: (time, delta) => void;
  // @ts-ignore
  onLeave?: (time, delta) => void;
  queries: () => Record<string, (new () => ComponentBase)[][]>;
}
