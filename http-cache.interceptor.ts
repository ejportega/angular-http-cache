import { HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CACHE_REQUEST, HttpCacheService } from '@core/services/http-cache.service';
import { Observable, of, tap } from 'rxjs';

/**
 * HTTP caching
 *
 * Caching API calls reduces additional requests to the server-side, improves performance, and reduces data traffic.
 */

@Injectable({
	providedIn: 'root',
})
export class HttpCacheInterceptor implements HttpInterceptor {
	constructor(private readonly httpCacheService: HttpCacheService) {}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		// Check if the request is cachable
		if (request.method !== 'GET') {
			return next.handle(request);
		}

		const cachedResponse = this.httpCacheService.get(request.urlWithParams);
		const httpContext = request.context.get(CACHE_REQUEST);

		// Check if the data is cached
		if (cachedResponse) {
			// Return cached response if available
			return of(cachedResponse);
		}

		// Check if the data is need to be cached
		if (httpContext.cached) {
			return next.handle(request).pipe(
				tap((event: HttpEvent<any>) => {
					if (event.type === HttpEventType.Response) {
						this.httpCacheService.set(request.urlWithParams, {
							value: event,
							ttl: httpContext.ttl,
						});
					}
				})
			);
		}

		return next.handle(request);
	}
}
