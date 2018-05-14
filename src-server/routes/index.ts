import { timeRoute } from './time/time-route';
import { guestbookRoute } from './guestbook/guestbook-route';
import { Express } from 'express';

// register here any API controller
export const routes: Array<(app: Express) => void> = [
    timeRoute,
    guestbookRoute,
];
