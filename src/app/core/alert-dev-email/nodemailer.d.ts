declare module 'nodemailer' {
  export type TransportOptions = any;

  export interface Transporter {
    sendMail(options: {
      from: string;
      to: string;
      subject: string;
      text?: string;
      html?: string;
    }): Promise<any>;
  }

  export function createTransport(options: TransportOptions): Transporter;
}
