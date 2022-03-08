import { Middleware } from '@koa/router';
import moment from 'moment';
import prisma from '../../database';

const addTimeRange = async (
    format: string,
    openHour: string,
    closeHour: string,
    slotInterval: number,
    businessDay: string,
) => {
    const timeRange = await prisma.timeRange.upsert({
        where: {
            businessDay,
        },
        update: {
            format,
            openHour,
            closeHour,
            slotInterval,
        },
        create: {
            format,
            openHour,
            closeHour,
            slotInterval,
            businessDay,
        },
    });
    console.log(
        `Setting up the time range:\n${JSON.stringify(
            timeRange,
        )} for business day ${businessDay}`,
    );
    return { result: 'OK', timeRange };
};

const addTimeRangeMiddleware: Middleware = async (ctx) => {
    console.debug(`[/timerange] Body = ${JSON.stringify(ctx.request.body)}`);

    const { format, openHour, closeHour, slotInterval, businessDay } =
        ctx.request.body;

    await addTimeRange(format, openHour, closeHour, slotInterval, businessDay);

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
};

export default addTimeRangeMiddleware;
