import 'jest-extended';
import fc from 'fast-check';
import supertest from 'supertest';
import app from '../src/app';
import { prismaMock } from './mocks/prisma.mock';

const request = supertest(app.callback());

afterAll(async () => {
    await prismaMock.$disconnect();
});

describe('Booking reservations PBT', () => {
    it('should book a reservation if it is available', async () => {
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
            customerName: 'Adam',
        };

        await fc.assert(
            fc.asyncProperty(fc.scheduler(), async (s) => {
                prismaMock.reservation.findFirst.mockImplementation(
                    s.scheduleFunction(async function findFirst() {
                        return reservation;
                    }) as any,
                );
                prismaMock.reservation.update.mockImplementation(
                    s.scheduleFunction(async function update() {
                        return { ...reservation, booked: true };
                    }) as any,
                );

                const bookedReservation1 = await s.waitFor(
                    request
                        .post('/api/v1/reservation')
                        .set('Content-Type', 'application/json')
                        .set('Accept', 'application/json')
                        .send({
                            businessDay,
                            timeSlot,
                            tableName,
                        }),
                );

                expect(bookedReservation1.status).toBe(200);
                expect(bookedReservation1.body.booked).toEqual(true);
                expect(bookedReservation1.body.slotStartHour).toEqual(timeSlot);
                expect(bookedReservation1.body.tableName).toEqual(tableName);
                expect(bookedReservation1.body.customerName).toEqual(
                    customerName,
                );
            }),
        );
    });
    it('should not book a reservation if it is unavailable', async () => {
        const businessDay = '16-03-2022';
        const timeSlot = '20:00';
        const tableName = 'Milano';

        const reservation = {
            id: 'randomId',
            slotId: 'randomId',
            slotStartHour: timeSlot,
            tableId: 'randomId',
            tableName,
            businessDay,
            booked: true,
            customerName: 'Adam',
        };

        await fc.assert(
            fc.asyncProperty(fc.scheduler(), async (s) => {
                prismaMock.reservation.findFirst.mockImplementation(
                    s.scheduleFunction(async function findFirst() {
                        return reservation;
                    }) as any,
                );
                prismaMock.reservation.update.mockImplementation(
                    s.scheduleFunction(async function update() {
                        return { ...reservation, booked: true };
                    }) as any,
                );

                const bookedReservation1 = await s.waitFor(
                    request
                        .post('/api/v1/reservation')
                        .set('Content-Type', 'application/json')
                        .set('Accept', 'application/json')
                        .send({
                            businessDay,
                            timeSlot,
                            tableName,
                        }),
                );

                expect(bookedReservation1.status).toBe(404);
                expect(bookedReservation1.body.booked).toBeUndefined();
                expect(bookedReservation1.body.slotStartHour).toBeUndefined();
                expect(bookedReservation1.body.tableName).toBeUndefined();
                expect(bookedReservation1.body.customerName).toBeUndefined();
            }),
        );
    });
});
