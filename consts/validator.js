export function validateSetupArray(value) {
  if (!Array.isArray(value) || value.length !== 5) {
    return false;
  }

  return value.every(element => {
    return typeof element === 'number';
  });
}