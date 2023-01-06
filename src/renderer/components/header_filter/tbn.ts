export const paramsToObject = (searchParams: URLSearchParams) =>
  Array.from(searchParams).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {}
  );

export const objectToParams = (params: any) => {
  const searchParams = new URLSearchParams();

  Object.keys(params).map((key) =>
    params[key] !== "" ? searchParams.set(key, params[key]) : null
  );

  return searchParams;
};

export default { paramsToObject, objectToParams };
