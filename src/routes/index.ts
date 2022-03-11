import Router from '@koa/router';
import {
    bookReservationMiddleware,
    cancelReservationMiddleware,
    editReservationMiddleware,
    generateReservationsMiddleware,
    getBookedReservationsMiddleware,
} from '../middlewares/reservations';
import addTablesMiddleware from '../middlewares/tables';
import addTimeRangeMiddleware from '../middlewares/timerange';

const router = new Router({
    prefix: '/api/v1',
});

router
    .get('/ping', (ctx) => {
        ctx.body = {
            result: 'pong',
        };
    })
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

export default router;
