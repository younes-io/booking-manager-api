import { Middleware } from '@koa/router';
import prisma from '../../database';

export const generateReservationsMiddleware: Middleware = async (ctx) => {
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
};

export const getBookedReservationsMiddleware: Middleware = async (ctx) => {
    console.log(`params => ${ctx.params.businessDay}`);
    const reservations = await prisma.reservation.findMany({
        where: { businessDay: ctx.params.businessDay, booked: true },
    });
    ctx.body = reservations;
};

export const bookReservationMiddleware: Middleware = async (ctx) => {
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
};

export const editReservationMiddleware: Middleware = async (ctx) => {
    console.log(`params => ${JSON.stringify(ctx.request.body)}`);
    const {
        businessDay,
        currentTimeSlot,
        targetTimeSlot,
        currentTableName,
        targetTableName,
    } = ctx.request.body;

    const currentReservation = await prisma.reservation.findFirst({
        where: {
            businessDay,
            slotStartHour: currentTimeSlot,
            tableName: currentTableName,
            booked: true,
        },
    });

    if (currentReservation) {
        const targetReservation = await prisma.reservation.findFirst({
            where: {
                businessDay,
                slotStartHour: targetTimeSlot,
                tableName: targetTableName,
                booked: false,
            },
        });

        if (targetReservation) {
            const confirmedTargetReservation = await prisma.reservation.update({
                where: { id: targetReservation.id },
                data: {
                    booked: true,
                },
            });
            await prisma.reservation.update({
                where: { id: currentReservation.id },
                data: {
                    booked: false,
                },
            });
            ctx.body = confirmedTargetReservation;
        } else {
            ctx.throw(
                `The table ${targetTableName} is not available at ${targetTimeSlot}. Please pick another timeslot.`,
                404,
            );
        }
    } else {
        ctx.throw(`The reservation you want to edit does not exist.`, 404);
    }
};

export const cancelReservationMiddleware: Middleware = async (ctx) => {
    console.log(`params => ${ctx.params}`);
    const { businessDay, timeSlot, tableName } = ctx.params;
    const reservationToCancel = await prisma.reservation.findFirst({
        where: {
            businessDay,
            slotStartHour: timeSlot,
            tableName,
            booked: true,
        },
    });
    if (reservationToCancel) {
        const cancelledReservation = await prisma.reservation.update({
            where: { id: reservationToCancel.id },
            data: {
                booked: false,
            },
        });
        ctx.body = cancelledReservation;
    } else {
        ctx.throw('The reservation you want to cancel does not exist', 404);
    }
};
