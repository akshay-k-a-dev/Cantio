// Type definitions for Vercel serverless functions
// This ensures VS Code IntelliSense works properly

declare module '@vercel/node' {
  import type { IncomingMessage, ServerResponse } from 'http';

  export interface VercelRequest extends IncomingMessage {
    query: { [key: string]: string | string[] };
    cookies: { [key: string]: string };
    body: any;
  }

  export interface VercelResponse {
    status(statusCode: number): VercelResponse;
    json(body: any): VercelResponse;
    send(body: any): VercelResponse;
    setHeader(name: string, value: string | string[]): VercelResponse;
    end(): VercelResponse;
  }
}
