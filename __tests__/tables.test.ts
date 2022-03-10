import { addTable } from '../src/middlewares/tables';
import { prismaMock } from './mocks/prisma.mock';
import * as fc from 'fast-check';

// jest.setTimeout(2000);

describe('Adding tables to the restaurant', () => {
    afterAll(async () => {
        await prismaMock.$disconnect();
    });

    test('should add a table', async () => {
        fc.assert(
            fc.asyncProperty(
                fc.bigUint(),
                fc.string(),
                async (tableId, tableName) => {
                    const table = { id: tableId.toString(), name: tableName };
                    prismaMock.table.create.mockResolvedValue(table);
                    // Act
                    const returnTable = await addTable(tableName);
                    // Assert
                    expect(returnTable.result).toEqual('OK');
                    expect(returnTable.table).toEqual(tableName);
                },
            ),
        );
    });
});
