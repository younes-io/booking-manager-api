import { addTable } from '../src/middlewares/tables';
import { prismaMock } from './mocks/prisma.mock';
import * as fc from 'fast-check';

describe('Adding tables to the restaurant', () => {
    afterAll(async () => {
        await prismaMock.$disconnect();
    });

    it('should add a table', async () => {
        fc.assert(
            fc.asyncProperty(
                fc.nat(),
                fc.unicodeString(),
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
