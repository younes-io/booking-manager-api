import supertest from 'supertest';
import app from '../src/app';
import prisma from '../src/database';

const request = supertest(app.callback());

describe.skip('WIP: Booking reservations : race conditions', () => {
    beforeAll(async () => {
        // Add tables to the restaurant
        await prisma.reservation.createMany({
            data: [
                {
                    slotId: '622b760b41fe0ccd54121cc5',

                    tableId: '622b75fd41fe0ccd54121cc3',
                    tableName: 'MilanoTest',
                    slotStartHour: '19:00',
                    businessDay: '17-03-2022',
                    booked: false,
                },
                {
                    slotId: '622b760b41fe0ccd54121cc6',
                    tableId: '622b75fd41fe0ccd54121cc3',
                    tableName: 'MilanoTest',
                    slotStartHour: '20:00',
                    businessDay: '17-03-2022',
                    booked: false,
                },
                {
                    slotId: '622b760b41fe0ccd54121cc7',
                    tableId: '622b75fd41fe0ccd54121cc3',
                    tableName: 'MilanoTest',
                    slotStartHour: '21:00',
                    businessDay: '17-03-2022',
                    booked: false,
                },
                {
                    slotId: '622b760b41fe0ccd54121cc8',
                    tableId: '622b75fd41fe0ccd54121cc3',
                    tableName: 'MilanoTest',
                    slotStartHour: '22:00',
                    businessDay: '17-03-2022',
                    booked: false,
                },
            ],
        });
    });

    it('should NOT book the same reservation (table+timeslot) for two customers', async () => {
        const res = await request
            .post('/api/v1/reservation')
            .set('Content-Type', '"application/json; charset=utf-8"')
            .set('Accept', 'application/json')
            .send({
                timeSlot: '20:00',
                tableName: 'MilanoTest',
                businessDay: '17-03-2022',
            });

        expect(res).toBe(true);
        expect(1 + 1).toBe(2);
    });

    afterAll(async () => {
        await prisma.reservation.deleteMany();
        await prisma.$disconnect();
    });
});
