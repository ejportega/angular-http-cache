getData(http: HttpClient) {
 return this.http.get('/api/data', {
   context: new HttpContext().set(CACHE_REQUEST , {
     cached: true,
     ttl: 1000000 // 10 minutes
   })
 })
}
