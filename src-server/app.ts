import * as express from 'express';
import { routes } from './routes';
import { first } from './lesson2/first';
import { Vip } from './lesson2/second';
import { GotCharacter } from './lesson2/third';

export const app = express();

app.set("port", process.env.PORT || 3000);

// loading api controllers
for (const route of routes) {
    route(app);
}

// static file service for client app
app.use('/', express.static(__dirname + '/static'));

// error handling
app.use(function (req, res, next) {
    res.status(404);
    
    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

export const server = app.listen(app.get('port'), () => {
    console.log(('  App is running at http://localhost:%d in %s mode \nPress CTRL-C to stop\n'), app.get('port'), app.get('env'));
});
