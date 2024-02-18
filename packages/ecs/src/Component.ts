export interface ComponentBase {
  hasToSerialize: boolean;
  serialize(): { [key: string]: { [key: string]: any } };
  destroy?(): void;
}

export class Component implements ComponentBase {
  hasToSerialize = true;
  // static serializableProps: string[] = [];

  serialize() {
    // Get the class name
    const className = this.constructor.name;

    // Get the own properties
    const properties: { [key: string]: any } = {};
    for (const key of Object.keys(this)) {
      // @ts-ignore
      if (this.hasOwnProperty(key) && typeof this[key] !== 'function') {
        // @ts-ignore
        properties[key] = this[key];
      }
    }

    // Create and return the serialized object
    const serializedObject: { [key: string]: { [key: string]: any } } = {};
    serializedObject[className] = properties;
    return serializedObject;
  }

  // serialize(): { [key: string]: { [key: string]: any } } {
  //   const className = this.constructor.name;
  //
  //   const properties: { [key: string]: any } = {};
  //   for (const key of (this.constructor as typeof Component)
  //     .serializableProps) {
  //     if (this.hasOwnProperty(key) && typeof this[key] !== 'function') {
  //       properties[key] = this[key];
  //     }
  //   }
  //
  //   // Create and return the serialized object
  //   const serializedObject: { [key: string]: { [key: string]: any } } = {};
  //   serializedObject[className] = properties;
  //   return serializedObject;
  // }
}
