(params) => {
stash.listKeys().forEach((k) =>{
  stash.put(k,null);
});
}
