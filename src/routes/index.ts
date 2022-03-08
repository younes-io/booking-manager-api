import Router from '@koa/router';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { oas } from 'koa-oas3';
import moment from 'moment';
import path from 'path';
import addTable from '../controllers/tables';
import addTimeRange from '../controllers/timerange';
import prisma from '../database';

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
    .post('/tables', async (ctx, _next) => {
        console.debug(`[/tables] Body = ${JSON.stringify(ctx.request.body)}`);
        const tableName = ctx.request.body?.name;
        ctx.body = await addTable(tableName);
        console.log(`[/tables] table ${tableName} has been added`);
    })
    .post('/timerange', async (ctx, _next) => {
        console.debug(
            `[/timerange] Body = ${JSON.stringify(ctx.request.body)}`,
        );

        const { format, openHour, closeHour, slotInterval, businessDay } =
            ctx.request.body;

        await addTimeRange(
            format,
            openHour,
            closeHour,
            slotInterval,
            businessDay,
        );

        const businessDayFormat = 'DD-MM-YYYY';
        const startHour = moment(openHour, format);
        const endHour = moment(closeHour, format);

        const generatedSlots: Array<any> = [];
        while (startHour < endHour) {
            generatedSlots.push(startHour.format(format));
            startHour.add(slotInterval, 'minutes');
        }

        console.log(
            `Restaurant setup to open at ${openHour} and to close at ${closeHour} on ${moment(
                businessDay,
                businessDayFormat,
            ).format(businessDayFormat)}`,
        );

        ctx.body = {
            openingHours: { openHour, closeHour },
            businessDay,
            generatedSlots,
        };

        const timeSlots: Array<any> = generatedSlots.map((slot) => {
            return { businessDay, slot };
        });

        await prisma.timeSlot.deleteMany({
            where: { businessDay },
        });
        await prisma.timeSlot.createMany({
            data: timeSlots,
        });

        console.log(
            `Timeslots have been set up for the business day ${businessDay}.`,
        );
    })
    .post('/reservation/generate', async (ctx, _next) => {
        const { businessDay } = ctx.request.body;

        await prisma.reservation.deleteMany({
            where: { businessDay },
        });

        const allTables = await prisma.table.findMany();
        const timeSlotsOfBusinessDay = await prisma.timeSlot.findMany({
            where: { businessDay },
        });

        const reservations = allTables.flatMap((table) => {
            return timeSlotsOfBusinessDay.map((timeslot) => {
                return {
                    slotId: timeslot.id,
                    tableId: table.id,
                    tableName: table.name,
                    slotStartHour: timeslot.slot,
                    businessDay,
                };
            });
        });

        if (reservations?.length > 0) {
            ctx.body = reservations;
            await prisma.reservation.createMany({
                data: reservations,
            });
            console.log(
                `${reservations.length} reservation slots have been generated for ${businessDay}`,
            );
        } else {
            ctx.throw(
                `Could not generate reservations for ${businessDay}. Please add a time range for ${businessDay} first.`,
                404,
            );
        }
    })
    .get('/reservation/:businessDay', async (ctx, _next) => {
        console.log(`params => ${ctx.params.businessDay}`);
        const reservations = await prisma.reservation.findMany({
            where: { businessDay: ctx.params.businessDay, booked: true },
        });
        ctx.body = reservations;
    })
    .post('/reservation', async (ctx, _next) => {
        console.log(`params => ${JSON.stringify(ctx.request.body)}`);
        const { businessDay, timeSlot, tableName } = ctx.request.body;
        const reservation = await prisma.reservation.findFirst({
            where: {
                businessDay,
                slotStartHour: timeSlot,
                tableName,
                booked: false,
            },
        });
        if (reservation) {
            const booking = await prisma.reservation.update({
                where: { id: reservation.id },
                data: { booked: true },
            });
            ctx.body = booking;
        } else {
            ctx.throw(
                `The table ${tableName} is not available on ${businessDay} at ${timeSlot}`,
                404,
            );
        }
    })
    .put('/reservation', async (ctx, _next) => {
        console.log(`params => ${JSON.stringify(ctx.request.body)}`);
        const { businessDay, timeSlot, tableName } = ctx.request.body;
        const reservation = await prisma.reservation.findFirst({
            where: {
                businessDay,
                slotStartHour: timeSlot,
                tableName,
                booked: false,
            },
        });
        if (reservation) {
            const booking = await prisma.reservation.update({
                where: { id: reservation.id },
                data: { booked: true },
            });
            ctx.body = booking;
        } else {
            ctx.throw(
                `The table ${tableName} is not available on ${businessDay} at ${timeSlot}`,
                404,
            );
        }
    });

app.use(router.routes()).use(router.allowedMethods());

export default app;
