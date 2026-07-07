/**
 * Recursively freezes all nested objects/arrays so static data
 * cannot be mutated at runtime. In strict mode, any attempted
 * mutation throws a TypeError immediately.
 */
const deepFreeze = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) deepFreeze(obj[key]);
  });
  return Object.freeze(obj);
};

export default deepFreeze;
