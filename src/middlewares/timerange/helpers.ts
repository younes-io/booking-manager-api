import prisma from '../../database';

export const getTimeslots = async (businessDay: string) =>
    await prisma.timeSlot.findMany({
        where: { businessDay },
    });
