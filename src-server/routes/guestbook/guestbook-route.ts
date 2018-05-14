import { Express } from "express-serve-static-core";
import { Request, Response, NextFunction } from "express";

export const guestbookRoute = function(app: Express) {
    let version = 0;
    let guests: Array<Guest> = [{
        sign: 'nZo',
        message: 'learn to swim...',
        date: new Date().valueOf()
    }];

    app.get('/api/guestbook/version', function(request: Request, result: Response, next: NextFunction) {
        result.setHeader('Content-Type', 'application/json');
        result.send(JSON.stringify(version));
    });

    app.get('/api/guestbook/guests', function(request: Request, result: Response, next: NextFunction) {
        result.setHeader('Content-Type', 'application/json');
        result.send(JSON.stringify(guests));
    });

    app.put('/api/guestbook/sign', function(request: Request, result: Response, next: NextFunction) {
        result.setHeader('Content-Type', 'application/json');
        if (request.body && request.body.length) {
            guests.push(request.body[0]);
            version++;
            result.send(JSON.stringify(version));
        } else {
            result.send(JSON.stringify(-1));
        }
    });

    app.delete('/api/guestbook/clear', function(request: Request, result: Response, next: NextFunction) {
        guests = [];
        version++;
        result.setHeader('Content-Type', 'application/json');
        result.send(JSON.stringify(version));
    });
};

interface Guest {
    sign: string;
    message: string;
    date: number;
}