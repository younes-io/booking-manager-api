// import fc from 'fast-check';
import fc from 'fast-check';
import supertest from 'supertest';
import app from '../src/app';
import { prismaMock } from './mocks/prisma.mock';

// Hack to make iconv load the encodings module, otherwise jest crashes. Compare
// https://github.com/sidorares/node-mysql2/issues/489
// If the below is removed, calls to POST /api/v1/reservation return 415
import * as iconv from 'iconv-lite';
iconv.encodingExists('utf8');

const request = supertest(app.callback());

afterAll(async () => {
    await prismaMock.$disconnect();
});

const reservationAPI = async ({ businessDay, timeSlot, tableName }) => {
    // console.log(`${businessDay}${timeSlot}${tableName}`);
    const res = await request.post('/api/v1/reservation').type('json').send({
        businessDay,
        timeSlot,
        tableName,
    });
    return JSON.stringify(res);
};

describe.only('WIP: Booking reservations : race conditions', () => {
    it('works', async () => {
        fc.assert(
            fc
                .asyncProperty(fc.scheduler(), async (s) => {
                    // Arrange
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
                        booked: false,
                    };
                    prismaMock.reservation.findFirst.mockResolvedValue(
                        reservation,
                    );
                    prismaMock.reservation.update.mockImplementation(
                        s.scheduleFunction(async () => {
                            return {
                                ...reservation,
                                booked: true,
                            };
                        }) as any,
                    );

                    const scheduledRes = s.scheduleFunction(reservationAPI);

                    scheduledRes({ businessDay, timeSlot, tableName });

                    await s.waitOne();
                    // Assert
                    expect(s.report()).toBe(5);
                    expect(s.count()).toBe(0);
                })
                // .afterEach(async () => {
                //     await prismaMock.reservation.deleteMany();
                //     jest.resetAllMocks();
                //     jest.resetModules();
                // })
                .beforeEach(async () => {
                    await prismaMock.reservation.deleteMany();
                    jest.resetAllMocks();
                    jest.resetModules();
                }),

            { verbose: 2, numRuns: 1 },
        );
    });
});
