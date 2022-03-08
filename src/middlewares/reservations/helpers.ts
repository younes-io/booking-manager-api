import prisma from '../../database';

export const deleteReservations = async (businessDay: string) =>
    await prisma.reservation.deleteMany({
        where: { businessDay },
    });

export const createReservations = async (reservations: Array<any>) =>
    await prisma.reservation.createMany({
        data: reservations,
    });

export const getBookedReservations = async (businessDay: string) =>
    await prisma.reservation.findMany({
        where: { businessDay, booked: true },
    });

export const getAvailableReservations = async (
    businessDay: string,
    timeSlot: string,
    tableName: string,
) =>
    await prisma.reservation.findFirst({
        where: {
            businessDay,
            slotStartHour: timeSlot,
            tableName,
            booked: false,
        },
    });

export const bookReservation = async (reservationId: string) =>
    await prisma.reservation.update({
        where: { id: reservationId },
        data: { booked: true },
    });
