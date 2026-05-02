const prisma = require('../prisma');

/**
 * @param {string} tableName 
 * @param {string} columnName 
 * @param {string} prefix  
 * @param {number} padLength 
 * @returns {Promise<string>}
 */
const generateCode = async (tableName, columnName, prefix, padLength = 4) => {
    const lastRecord = await prisma[tableName].findFirst({
        orderBy: { [columnName.replace('_code', '_id')]: 'desc' },
        select: { [columnName]: true }
    });

    let lastNumber = 0;

    if (lastRecord?.[columnName]) {
        const match = lastRecord[columnName].match(/\d+$/);
        if (match) {
            const parsed = parseInt(match[0], 10);
            lastNumber = isNaN(parsed) ? 0 : parsed;
        }
    }

    const nextNumber = (lastNumber + 1)
        .toString()
        .padStart(padLength, '0');

    return `${prefix}-${nextNumber}`;
};

module.exports = generateCode;
