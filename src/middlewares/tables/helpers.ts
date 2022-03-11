import prisma from '../../database';

export const getAllTables = async () => await prisma.table.findMany();
