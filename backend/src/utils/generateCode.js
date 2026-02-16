const prisma = require('../prisma');

/**
 * @param {string} tableName 
 * @param {string} columnName 
 * @param {string} prefix  
 * @param {number} padLength 
 * @returns {Promise<string>}
 */
const generateCode = async (tableName, columnName, prefix, padLength = 3) => {
    const lastRecord = await prisma[tableName].findFirst({
        orderBy: { [columnName.replace('_code', '_id')]: 'desc' },
        select: { [columnName]: true }
    });

    let lastNumber = 0;
    if (lastRecord?.[columnName]) {
        const parts = lastRecord[columnName].split('-');
        lastNumber = parseInt(parts[1], 10);
    }

    const nextNumber = (lastNumber + 1).toString().padStart(padLength, '0');
    return `${prefix}-${nextNumber}`;
};

module.exports = generateCode;
