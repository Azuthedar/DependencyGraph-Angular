export enum Status {
  Complete = 0,
  InProgress,
  Failed,
  Invalid,
  Default
  // Complete = '#0a0',
  // InProgress = '#808',
  // Failed = '#a00',
  // Invalid = '#faa',
  // Default = ""
}

export namespace Status {
  export function keys() {
    return Object.keys(Status).filter(
      (type) => isNaN(<any>type) && type !== 'keys' && type !== 'Default'
    );
  }
}