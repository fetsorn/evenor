
function paramsToQueries(searchParams: URLSearchParams) {
  return Array.from(searchParams).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {}
  );
}

function queriesToParams(params: any) {
  const searchParams = new URLSearchParams();

  Object.keys(params).map((key) =>
    params[key] !== "" ? searchParams.set(key, params[key]) : null
  );

  return searchParams;
}

  const [queries, setQueries]: any[] = useState({});

  const navigate = useNavigate();

  const location = useLocation();

  const [selected, setSelected] = useState("");

  const [searched, setSearched] = useState("");

  const schema = useMemo(
    () =>
      rawSchema
        ? Object.keys(rawSchema).reduce(
            (acc, key) => [...acc, { ...rawSchema[key], name: key }],
            []
          )
        : [],
    [rawSchema]
  );

  const notAddedFields = useMemo(
    () =>
      schema.filter(
        (item: any) =>
          !Object.prototype.hasOwnProperty.call(queries, item.name) &&
          item.type !== "array"
      ),
    [schema, queries]
  );

  async function onQueryAdd() {
    if (searched) {
      const queriesNew = { ...queries, [selected]: searched };

      const searchString = setQueriesLocation(queriesNew);

      await onChangeQuery(searchString);

      setSearched("");
    }
  }

  async function onQueryRemove(removed: string) {
    const queriesNew: any = { ...queries };

    delete queriesNew[removed];

    const searchString = setQueriesLocation(queriesNew);

    await onChangeQuery(searchString);

    setSearched("");
  }

  function onChangeSelected(selectedNew: string) {
    setSelected(selectedNew);
  }

  function onChangeSearched(searchedNew: string) {
    setSearched(searchedNew);
  }

  function setQueriesLocation(queriesNew: any) {
    console.log("AAAAAAAAAAAAAAAAAAA");
    const searchParams = queriesToParams(queriesNew);

    const search = "?" + searchParams.toString();

    /* navigate({
     *   pathname: location.pathname,
     *   search,
     * }); */

    return search;
  }

  function onLocation() {
    const searchParams = new URLSearchParams(location.search);

    const queriesNew = paramsToQueries(searchParams);

    const queriesNewFiltered = Object.fromEntries(
      Object.entries(queriesNew).filter(
        ([key]) => key !== "groupBy" && key !== "overviewType"
      )
    );

    setQueries(queriesNewFiltered);
  }

  function onQueries() {
    setSelected(notAddedFields?.[0]?.name);
  }

  useEffect(() => {
    onQueries();
  }, [schema, queries]);

  useEffect(() => {
    onLocation();
  }, [location]);
