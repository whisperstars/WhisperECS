import { Entity, EntityBase } from './Entity';
import { SystemBase } from './System.types';
import { ComponentBase } from './Component';
import { Query } from './Query';

export class World {
  hasToRun = false;
  entities: EntityBase[] = [];
  systems: {
    instance: SystemBase;
    queries: Record<string, (new () => ComponentBase)[][]>;
  }[] = [];
  query = new Query(new Set());

  // eslint-disable-next-line
  components: Record<string, new (props: any) => ComponentBase> = {};
  // eslint-disable-next-line
  private events: any;

  constructor() {}

  // eslint-disable-next-line
  setEvents(events: any) {
    this.events = events;
  }

  assertUniqueName(name: string) {
    return this.entities.find((entity) => entity.name === name);
  }

  registerEntity(entity: EntityBase) {
    // if (this.assertUniqueName(entity.name)) {
    //   throw new Error(`Entity name "${entity.name}" is not unique.`);
    // }

    this.entities.push(entity);

    // @ts-ignore
    this.query = new Query(new Set(this.entities));

    return this;
  }

  removeEntity(entity: EntityBase) {
    if (!this.entities.includes(entity)) {
      return;
    }

    this.entities = this.entities.filter((e) => e !== entity);
    // @ts-ignore
    this.query = new Query(new Set(this.entities));
    setTimeout(() => {
      entity?.destroy?.();
    }, 0);
  }

  // eslint-disable-next-line
  registerComponent(Component: new (props: any) => ComponentBase) {
    this.components[Component.name] = Component;
    return this;
  }

  // eslint-disable-next-line
  registerComponents(Components: (new (props: any) => ComponentBase)[]) {
    Components.forEach((Component) => {
      this.registerComponent(Component);
    });

    return this;
  }

  registerSystem<T extends SystemBase>(instance: T) {
    const queries = instance.queries();

    this.systems.push({ queries, instance });

    return this;
  }

  addSystem<T extends new (p: { world: World }) => SystemBase>(Constructor: T) {
    const system = new Constructor({ world: this });

    this.registerSystem(system);

    return this;
  }

  startSystems() {
    for (const system of this.systems) {
      system.instance.init?.();
    }
  }

  diff(arr1 = [], arr2 = []) {
    const entered = arr2.filter((item) => !arr1.includes(item));
    const left = arr1.filter((item) => !arr2.includes(item));
    return { entered, left };
  }

  // @ts-ignore
  run(time, delta) {
    if (!this.hasToRun) {
      return;
    }

    for (const system of this.systems) {
      const diff = { entered: [], left: [] };

      Object.entries(system.queries).forEach(([queryName, queryComponents]) => {
        // @ts-ignore
        system.instance[queryName].updated = this.query.run(queryComponents);

        const { entered, left } = this.diff(
          // @ts-ignore
          system.instance[queryName].__prev,
          // @ts-ignore
          system.instance[queryName].updated,
        );

        diff.entered = [...diff.entered, ...entered];
        diff.left = [...diff.left, ...entered];

        // @ts-ignore
        system.instance[queryName].entered = entered;
        // @ts-ignore
        system.instance[queryName].left = left;

        Promise.resolve().then(() => {
          // @ts-ignore
          system.instance[queryName].__prev =
            // @ts-ignore
            system.instance[queryName].updated;
        });
      });

      if (diff.entered.length > 0) {
        system.instance.onEnter?.(time, delta);
      }

      system.instance.update?.(time, delta);

      if (diff.left.length > 0) {
        system.instance.onLeave?.(time, delta);
      }
    }
  }

  start() {
    this.hasToRun = true;
  }

  stop() {
    this.hasToRun = false;
  }

  getEntityByName(name: string) {
    return this.entities.find((entity) => entity.name === name);
  }

  serialize() {
    return this.entities.map((entity) => entity.serialize());
  }

  // @ts-ignore
  restore(data) {
    // @ts-ignore
    data.forEach((entityData) => {
      // @ts-ignore
      const [name, value] = Object.entries(entityData)[0];

      let entity = this.getEntityByName(name);

      if (!entity) {
        entity = new Entity({ name });
        this.registerEntity(entity);
      }

      Object.entries(value || {}).forEach(([cmpName, props]) => {
        const Cmp = this.components[cmpName];
        // @ts-ignore
        const cmp = new Cmp(props[cmpName]);
        // @ts-ignore
        entity.addComponent(cmp);
      });
      // remove components that are not in the data
      // remove entities that are not in the data
    });

    this.entities.forEach((entity) => {
      // @ts-ignore
      if (data.find((e) => e[entity.name])) {
        return;
      }
      this.removeEntity(entity);
    });
  }
}
