import { Middleware } from '@koa/router';
import { getAllTables } from '../tables/helpers';
import { getTimeslots } from '../timerange/helpers';
import {
    bookReservation,
    cancelReservation,
    createReservations,
    deleteReservations,
    getAllBookedReservations,
    getAvailableReservation,
    getBookedReservation,
} from './helpers';

export const generateReservationsMiddleware: Middleware = async (ctx) => {
    const { businessDay } = ctx.request.body;

    await deleteReservations(businessDay);

    const allTables = await getAllTables();
    const timeSlotsOfBusinessDay = await getTimeslots(businessDay);

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
        await createReservations(reservations);
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
    const reservations = await getAllBookedReservations(ctx.params.businessDay);
    ctx.body = reservations;
};

export const bookReservationMiddleware: Middleware = async (ctx) => {
    console.log(`params => ${JSON.stringify(ctx.request.body)}`);
    const { businessDay, timeSlot, tableName } = ctx.request.body;
    const reservation = await getAvailableReservation(
        businessDay,
        timeSlot,
        tableName,
    );

    if (reservation) {
        const booking = await bookReservation(reservation.id);
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

    const currentReservation = await getBookedReservation(
        businessDay,
        currentTimeSlot,
        currentTableName,
    );

    if (currentReservation) {
        const targetReservation = await getAvailableReservation(
            businessDay,
            targetTimeSlot,
            targetTableName,
        );

        if (targetReservation) {
            const confirmedTargetReservation = await bookReservation(
                targetReservation.id,
            );
            await cancelReservation(currentReservation.id);
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
    const reservationToCancel = await getBookedReservation(
        businessDay,
        timeSlot,
        tableName,
    );
    if (reservationToCancel) {
        const cancelledReservation = await cancelReservation(
            reservationToCancel.id,
        );
        ctx.body = cancelledReservation;
    } else {
        ctx.throw('The reservation you want to cancel does not exist', 404);
    }
};
