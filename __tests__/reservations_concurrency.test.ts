// import fc from 'fast-check';
import fc from 'fast-check';
import supertest from 'supertest';
import app from '../src/app';
import { prismaMock } from './mocks/prisma.mock';

const request = supertest(app.callback());

afterAll(async () => {
    await prismaMock.$disconnect();
});

describe.only('WIP: Booking reservations : race conditions', () => {
    it('works', async () => {
        await fc.assert(
            fc.asyncProperty(fc.scheduler(), async (s) => {
                //  Arrange
                const businessDay = '16-03-2022';
                const timeSlot = '20:00';
                const tableName = 'Milano';
                const customerName = 'Adam';

                const reservation = {
                    id: 'randomId',
                    slotId: 'randomId',
                    slotStartHour: timeSlot,
                    tableId: 'randomId',
                    tableName,
                    businessDay,
                    booked: false,
                    customerName,
                };

                prismaMock.reservation.findFirst.mockResolvedValue(reservation);
                prismaMock.reservation.update.mockImplementation(
                    s.scheduleFunction(async function update() {
                        reservation.booked = true;
                        return reservation;
                    }) as any,
                );
                /* prismaMock.reservation.findFirst.mockReturnValue(
                    s.schedule(
                        Promise.resolve(reservation),
                        'findFirst',
                    ) as any,
                );
                prismaMock.reservation.update.mockReturnValue(
                    s.schedule(
                        Promise.resolve({ ...reservation, booked: true }),
                        'update',
                    ) as any,
                ); */

                const bookedReservationPromise = request
                    .post('/api/v1/reservation')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .send({
                        businessDay,
                        timeSlot,
                        tableName,
                        customerName,
                    });

                // Act
                // s.schedule(
                //     Promise.resolve(await bookedReservationPromise),
                //     'inc1',
                // );
                // s.schedule(bookedReservationPromise)

                await s.waitAll();

                const bookedReservation = await bookedReservationPromise;
                // const bookedReservation2 = await bookedReservationPromise;
                //  Assert
                // expect(s.report()).toEqual(200);
                expect(bookedReservation.status).toEqual(200);
                // expect(bookedReservation.body.booked).toEqual(true);
                // expect(bookedReservation.body.slotStartHour).toEqual(timeSlot);
                // expect(bookedReservation.body.tableName).toEqual(tableName);

                // expect(bookedReservation2.status).toEqual(200);
                // expect(bookedReservation2.body.booked).toEqual(true);
                // expect(bookedReservation2.body.slotStartHour).toEqual(timeSlot);
                // expect(bookedReservation2.body.tableName).toEqual(tableName);
            }),
            { verbose: 2, timeout: 2000 },
        );
    });
});
