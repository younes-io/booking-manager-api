import AsyncLock from 'async-lock';

/**
 * This LockService provides a layer of security / safety
 * against concurrent requests that target reservations
 * (businessDay, timeSlot, tableName)
 * keys regex : businessDay|timeSlot|tableName
 */
const LockService = new AsyncLock();

export const getLockKey = ({ businessDay, timeSlot, tableName }) => {
    return `${businessDay}|${timeSlot}|${tableName}`;
};

export default LockService;
