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
