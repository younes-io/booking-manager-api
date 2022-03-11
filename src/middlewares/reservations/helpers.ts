import prisma from '../../database';

export const deleteReservations = async (businessDay: string) =>
    await prisma.reservation.deleteMany({
        where: { businessDay },
    });

export const createReservations = async (reservations: Array<any>) =>
    await prisma.reservation.createMany({
        data: reservations,
    });

export const getReservation = async (
    businessDay: string,
    timeSlot: string,
    tableName: string,
    booked: boolean,
) =>
    await prisma.reservation.findFirst({
        where: {
            businessDay,
            slotStartHour: timeSlot,
            tableName,
            booked,
        },
    });

export const getAvailableReservation = async (
    businessDay: string,
    timeSlot: string,
    tableName: string,
) => await getReservation(businessDay, timeSlot, tableName, false);

export const getBookedReservation = async (
    businessDay: string,
    timeSlot: string,
    tableName: string,
) => await getReservation(businessDay, timeSlot, tableName, true);

export const getAllBookedReservations = async (businessDay: string) =>
    await prisma.reservation.findMany({
        where: { businessDay, booked: true },
    });

export const updateReservation = async (
    reservationId: string,
    booked: boolean,
) =>
    await prisma.reservation.update({
        where: { id: reservationId },
        data: { booked },
    });

export const bookReservation = async (reservationId: string) =>
    await updateReservation(reservationId, true);

export const cancelReservation = async (reservationId: string) =>
    await updateReservation(reservationId, false);
