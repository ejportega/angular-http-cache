import { HttpContextToken, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Specific data that will send into the HTTP interceptors
 */
export const CACHE_REQUEST = new HttpContextToken<{
	cached: boolean;
	ttl: number;
}>(() => {
	return {
		cached: false,
		ttl: 300000,
	};
});

export interface CacheItem {
	createdAt?: Date;
	ttl: number;
	value: HttpResponse<any>;
}

@Injectable({
	providedIn: 'root',
})
export class HttpCacheService {
	// A HashMap to store the cache. The key is the API URL and the value is the data or CacheItem object.
	private readonly cache = new Map<string, CacheItem>();

	/**
	 * Set method for storing data
	 *
	 * @param key API URL
	 * @param cacheItem CacheItem object
	 */
	set(key: string, cacheItem: CacheItem): void {
		// Check if the key already exists
		if (this.cache.has(key)) {
			return;
		}

		this.cache.set(key, {
			...cacheItem,
			createdAt: new Date(),
		});
	}

	/**
	 *
	 * @param key API URL
	 * @returns HttpResponse
	 */
	get(key: string): HttpResponse<any> | null {
		const cacheItem = this.cache.has(key) ? this.cache.get(key) : undefined;

		if (!cacheItem) {
			return null;
		}

		// Check if the ttl is already expired
		if (new Date().getTime() - cacheItem.createdAt.getTime() > cacheItem.ttl) {
			this.remove(key);

			return null;
		}

		return cacheItem.value;
	}

	/**
	 * Clear all the cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Remove the cache via key
	 *
	 * @param key API URL
	 */
	remove(key: string): void {
		this.cache.delete(key);
	}
}
