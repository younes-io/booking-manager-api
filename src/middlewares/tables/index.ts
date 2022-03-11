import prisma from '../../database';
import { Middleware } from '@koa/router';

export const addTable = async (name: string) => {
    console.log(`Adding the table ${name}`);
    const newTable = await prisma.table.create({
        data: {
            name,
        },
    });
    console.log(`New table = ${JSON.stringify(newTable)}`);
    return { result: 'OK', table: newTable.name };
};

const addTablesMiddleware: Middleware = async (ctx) => {
    console.debug(`[/tables] Body = ${JSON.stringify(ctx.request.body)}`);
    const tableName = ctx.request.body?.name;
    ctx.body = await addTable(tableName);
    console.log(`[/tables] table ${tableName} has been added`);
};

export default addTablesMiddleware;
