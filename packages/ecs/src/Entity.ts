import { ComponentBase } from './Component';

export interface EntityProps {
  name: string;
  onDestroy?: () => void;
}

export interface EntityBase extends EntityProps {
  components: Map<new (props: any) => ComponentBase, ComponentBase>;
  addComponent: <T extends ComponentBase>(instance: T) => EntityBase;
  addComponents: <T extends ComponentBase>(components: T[]) => EntityBase;
  removeComponent: <T extends ComponentBase>(
    Constructor: new () => T
  ) => EntityBase;
  getComponent: <T extends ComponentBase>(
    Constructor: new (...props: any[]) => T
  ) => T | undefined;
  hasComponent: <T extends ComponentBase>(Constructor: new () => T) => boolean;
  ensureHasComponent: <T extends ComponentBase>(Constructor: new () => T) => T;

  serialize: () => Record<string, Record<string, any>>;
  destroy?: () => void;
  onDestroy?: () => void;
}

export class Entity implements EntityBase {
  name: string;
  onDestroy?: () => void;

  components: Map<new (props: any) => ComponentBase, ComponentBase> = new Map();

  constructor(props: EntityProps) {
    this.name = props.name;
    this.onDestroy = props.onDestroy;
  }

  addComponent<T extends ComponentBase>(instance: T) {
    const Constructor = instance.constructor as new (props: any) => T;
    this.components.set(Constructor, instance);


    // TODO: check whether the component is registered
    // @ts-ignore
    // if (!AllComponents.includes(Constructor)) {
    //   throw new Error(`Component "${Constructor.name}" is not registered.`);
    // }

    return this;
  }

  addComponents<T extends ComponentBase>(components: T[]) {
    components.forEach((component) => {
      this.addComponent(component);
    });

    return this;
  }

  removeComponent<T extends ComponentBase>(Constructor: new () => T) {
    this.getComponent(Constructor)?.destroy?.();
    this.components.delete(Constructor);

    return this;
  }

  getComponent<T extends ComponentBase>(
    Constructor: new () => T
  ): T | undefined {
    return this.components.get(Constructor) as T | undefined;
  }

  hasComponent<T extends ComponentBase>(
    Constructor: new (...arg: any) => T
  ): boolean {
    return this.components.has(Constructor);
  }

  ensureHasComponent<T extends ComponentBase>(Constructor: new () => T): T {
    if (!this.hasComponent(Constructor)) {
      this.addComponent(new Constructor());
    }

    return this.components.get(Constructor) as T;
  }

  serialize() {
    const cmpSerialization = {};

    for (const [key, value] of this.components.entries()) {
      if (!value.hasToSerialize) {
        continue;
      }

      // @ts-ignore
      cmpSerialization[key.name] = value.serialize();
    }

    return {
      [this.name]: cmpSerialization,
    };
  }
  destroy() {
    this.onDestroy?.();

    for (const component of this.components.values()) {
      component.destroy?.();
    }
  }
}
