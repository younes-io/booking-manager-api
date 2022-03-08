import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { oas } from 'koa-oas3';
import path from 'path';
import {
    bookReservationMiddleware,
    cancelReservationMiddleware,
    editReservationMiddleware,
    generateReservationsMiddleware,
    getBookedReservationsMiddleware,
} from '../middlewares/reservations';
import addTablesMiddleware from '../middlewares/tables';
import addTimeRangeMiddleware from '../middlewares/timerange';

const app = new Koa();

app.use(logger());
app.use(bodyParser());

const pathfile = path.resolve('./openapi.yaml');

oas({
    file: pathfile,
    endpoint: '/openapi.json',
    uiEndpoint: '/api/v1/docs',
}).then((oasMW) => {
    app.use(oasMW);
});

const router = new Router({
    prefix: '/api/v1',
});

router
    .post('/tables', addTablesMiddleware)
    .post('/timerange', addTimeRangeMiddleware)
    .post('/reservation/generate', generateReservationsMiddleware)
    .get('/reservation/:businessDay', getBookedReservationsMiddleware)
    .post('/reservation', bookReservationMiddleware)
    .put('/reservation', editReservationMiddleware)
    .delete(
        '/reservation/:businessDay/:timeSlot/:tableName',
        cancelReservationMiddleware,
    );

app.use(router.routes()).use(router.allowedMethods());

export default app;
