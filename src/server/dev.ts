import { startLocalServer } from './app';

const port = Number(process.env.PORT ?? 8787);
startLocalServer(port);
console.log(`Student Journeys API running on http://0.0.0.0:${port}`);
