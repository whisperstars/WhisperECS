import { Entity } from './Entity';
import { ComponentBase } from './Component';

export class Query {
  private entities: Set<Entity> = new Set();

  constructor(entities: Set<Entity>) {
    this.entities = entities;
  }

  run(componentArrays: (new () => ComponentBase)[][]): Entity[] {
    const result: Entity[] = [];
    for (const entity of this.entities) {
      for (const componentArray of componentArrays) {
        if (componentArray.every((C) => entity.hasComponent(C))) {
          result.push(entity);
          break;
        }
      }
    }

    return result;
  }
}

// @ts-ignore
export function and(...args) {
  if (args.length === 0) return [];
  if (args.length === 1) return [args[0]];

  const [first, ...rest] = args;
  // @ts-ignore
  const restResult = and(...rest);

  const result = [];
  for (const item of arrayize(first)) {
    // @ts-ignore
    for (const restItem of restResult) {
      // @ts-ignore
      result.push([...arrayize(item), ...arrayize(restItem)]);
    }
  }
  return result;
}

// @ts-ignore
export function or(...args) {
  return args.flatMap((arg) => arrayize(arg));
}

// @ts-ignore
export function arrayize(arg) {
  return Array.isArray(arg) ? arg : [arg];
}
