declare module 'ffmetadata' {
    export function read(filePath: string): Promise<{
      duration: { seconds: number };
    }>;
  }
