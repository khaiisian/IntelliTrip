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

    // Ensure generated code is unique. In rare race conditions another record
    // may be inserted with the same sequential number so check and increment
    // until we find a free code (with a safety limit).
    let attempt = 0;
    const maxAttempts = 1000;
    let candidateNumber = parseInt(nextNumber, 10);

    while (attempt < maxAttempts) {
        const candidate = `${prefix}-${candidateNumber.toString().padStart(padLength, '0')}`;
        const exists = await prisma[tableName].findFirst({ where: { [columnName]: candidate } });
        if (!exists) return candidate;
        candidateNumber += 1;
        attempt += 1;
    }

    throw new Error('Failed to generate unique code');
};

module.exports = generateCode;
