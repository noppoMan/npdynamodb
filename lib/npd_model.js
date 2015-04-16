resultFormatter: function(data){
  if(data.Items) {
    return new QueryResult.Collection(data.Items);
  }

  if(data.Count) {
    return data.Count;
  }

  return data;
}
