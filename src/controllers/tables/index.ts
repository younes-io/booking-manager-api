import prisma from '../../database';

const addTable = async (name: string) => {
    console.log(`Adding the table ${name}`);
    const newTable = await prisma.table.create({
        data: {
            name,
        },
    });
    console.log(`New table = ${JSON.stringify(newTable)}`);
    return { result: 'OK', table: name };
};

export default addTable;
