export enum Type {
    Process = 0,
    Source,
    Output,
    //Process = '#555',
    //Source = '#0af',
    //Output = '#fa0'
}

export namespace Type {
    export function keys() {
      return Object.keys(Type).filter(
        (type) => isNaN(<any>type) && type !== 'keys'
      );
    }
  }