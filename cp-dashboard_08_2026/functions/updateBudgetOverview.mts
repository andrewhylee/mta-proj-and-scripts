import type { Config, Context } from '@netlify/functions';
import { updateStaticFile } from './updateDataHelpers/updateStaticFile';

async function handler(req: Request, context: Context) {
  await updateStaticFile('budget-overview');
  return; // Netlify Scheduled Functions do not support returning a HTTP Response object
}

export const config: Config = {
  schedule: '0 0 * * 0', // weekly (every Sunday midnight UTC)
};

export default handler;
