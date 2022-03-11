import fc from 'fast-check';
import supertest from 'supertest';
import app from '../src/app';
// import { createMockContext } from '@shopify/jest-koa-mocks';
import {
    bookReservation,
    getAvailableReservation,
} from '../src/middlewares/reservations/helpers';
// import { prismaMock } from './mocks/prisma.mock';

const request = supertest(app.callback());

jest.mock('../src/middlewares/reservations/helpers');
const mockedBookReservation = jest.fn() as jest.MockedFunction<
    typeof bookReservation
>;
const mockedGetAvailableReservation = jest.fn() as jest.MockedFunction<
    typeof getAvailableReservation
>;

describe('Booking reservations : race conditions', () => {
    it('should NOT book the same reservation (table+timeslot) for two customers', async () => {
        fc.assert(
            fc
                .asyncProperty(
                    fc.scheduler(),
                    fc.uuid(),
                    async (s, reservationId) => {
                        // Arrange
                        // prismaMock.reservation.findFirst.mockResolvedValue(
                        //     reservation,
                        // );
                        const reservation = {
                            id: reservationId,
                            slotId: 'randomId',
                            slotStartHour: '20:00',
                            tableId: 'randomId',
                            tableName: 'Milano',
                            businessDay: '16-03-2022',
                            booked: false,
                        };
                        mockedGetAvailableReservation.mockResolvedValue(
                            reservation,
                        );
                        // prismaMock.reservation.update.mockResolvedValue({
                        //     ...reservation,
                        //     booked: true,
                        // });
                        mockedBookReservation.mockImplementation(
                            s.scheduleFunction(async (reservationId) => {
                                return { ...reservation, id: reservationId };
                            }),
                        );

                        const res = await request
                            .post('/api/v1/reservation')
                            .set(
                                'Content-Type',
                                '"application/json; charset=utf-8"',
                            )
                            .set('Accept', 'application/json')
                            .send({
                                timeSlot: '20:00',
                                tableName: 'Milano',
                                businessDay: '16-03-2022',
                            });
                        await s.waitOne();
                        expect(res).toBe(true);

                        expect(1 + 1).toBe(2);
                        // expect(res).toBe(2);
                        // expect(1 + 1).toBe(2);
                    },
                )
                .beforeEach(async () => {
                    jest.resetAllMocks();
                }),
            { verbose: 2 },
        );
    });
});
