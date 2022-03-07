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

export default addTimeRange;
