import { Express } from "express-serve-static-core";
import { Request, Response, NextFunction } from "express";

export const timeRoute = function(app: Express) {
    app.get('/api/time/now', function(request: Request, result: Response, next: NextFunction) {
        result.setHeader('Content-Type', 'application/json');
        result.send(JSON.stringify({ now: new Date().toISOString() }));
    });
};
