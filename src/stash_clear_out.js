(params) => {

  // only used to clear out stash for development
  stash.listKeys().forEach((k) => {
    if (k.indexOf('2019/10/18/' > -1)) {
      stash.put(k, null);
    }
  });
}