import { describe, it, expect, vi } from 'vitest';
import { extractRoles, hasRole, isAdmin, hasAeaAccess } from '../../src/lib/server/auth.js';

describe('Auth Functions', () => {
	describe('extractRoles', () => {
		it('should extract roles from standard key', () => {
			const user = {
				roles: ['AEA_User', 'Admin']
			};
			expect(extractRoles(user)).toEqual(['AEA_User', 'Admin']);
		});

		it('should extract roles from custom namespace', () => {
			const user = {
				'https://aea.com/roles': ['AEA_User']
			};
			expect(extractRoles(user)).toEqual(['AEA_User']);
		});

		it('should return empty array for user without roles', () => {
			const user = {};
			expect(extractRoles(user)).toEqual([]);
		});
	});

	describe('hasRole', () => {
		it('should return true if user has role', () => {
			expect(hasRole(['AEA_User', 'Admin'], 'AEA_User')).toBe(true);
		});

		it('should return false if user does not have role', () => {
			expect(hasRole(['AEA_User'], 'Admin')).toBe(false);
		});
	});

	describe('isAdmin', () => {
		it('should return true for admin role', () => {
			expect(isAdmin(['rol_85l7HNkIgBLXRw5B'])).toBe(true);
			expect(isAdmin(['Admin'])).toBe(true);
		});

		it('should return false for non-admin', () => {
			expect(isAdmin(['AEA_User'])).toBe(false);
		});
	});

	describe('hasAeaAccess', () => {
		it('should return true for AEA_User role', () => {
			expect(hasAeaAccess(['rol_p2JLyXK9UfqFXzCI'])).toBe(true);
			expect(hasAeaAccess(['AEA_User'])).toBe(true);
		});

		it('should return true for admin role', () => {
			expect(hasAeaAccess(['rol_85l7HNkIgBLXRw5B'])).toBe(true);
		});

		it('should return false for user without access', () => {
			expect(hasAeaAccess([])).toBe(false);
		});
	});
});

