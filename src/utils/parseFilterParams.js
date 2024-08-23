const parseType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;

  const isType = (type) => ['work', 'home', 'personal'].includes(type);

  if (isType(type)) return type;
};

const parseBoolean = (boolean) => {
  const isString = typeof boolean === 'string';
  if (!isString) return undefined;
  if (boolean.toLowerCase() === 'true') return true;
  if (boolean.toLowerCase() === 'false') return false;

  return undefined;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  return {
    type: parseType(type),
    isFavourite: parseBoolean(isFavourite),
  };
};
