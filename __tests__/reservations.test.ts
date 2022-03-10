import { prismaMock } from './mocks/prisma.mock';

import supertest from 'supertest';
import app from '../src/app';
const request = supertest(app.callback());

const bookAReservationWithMocks = async ({
    businessDay,
    timeSlot,
    tableName,
}) => {
    const reservation = {
        id: 'randomId',
        slotId: 'randomId',
        slotStartHour: timeSlot,
        tableId: 'randomId',
        tableName,
        businessDay,
        booked: false,
    };
    prismaMock.reservation.findFirst.mockResolvedValue(reservation);
    prismaMock.reservation.update.mockResolvedValue({
        ...reservation,
        booked: true,
    });
    return await request
        .post('/api/v1/reservation')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
            businessDay,
            timeSlot,
            tableName,
        });
};

describe('Booking reservations', () => {
    afterAll(async () => {
        await prismaMock.$disconnect();
    });

    it('should book a reservation', async () => {
        const businessDay = '16-03-2022';
        const timeSlot = '20:00';
        const tableName = 'Milano';
        const requestBody = {
            businessDay,
            timeSlot,
            tableName,
        };

        const bookedReservation = await bookAReservationWithMocks(requestBody);

        expect(bookedReservation.status).toEqual(200);
        expect(bookedReservation.body.booked).toEqual(true);
        expect(bookedReservation.body.slotStartHour).toEqual(timeSlot);
        expect(bookedReservation.body.tableName).toEqual(tableName);
    });
});
