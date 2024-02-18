import { SystemBase } from './System.types';
import type { World } from './World';

export class System implements SystemBase {
  world: World;

  queries() {
    return {};
  }

  // @ts-ignore
  constructor(props) {
    this.world = props.world;
  }
}
