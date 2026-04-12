import { describe, it, expect } from 'vitest';
import { getBranchFullName, formatPercentage, normalizeCollegeData } from '../collegeHelpers';

describe('collegeHelpers', () => {
    describe('getBranchFullName', () => {
        it('should return full name for common abbreviations', () => {
            expect(getBranchFullName('CSE')).toBe('Computer Science and Engineering');
            expect(getBranchFullName('IT')).toBe('Information Technology');
            expect(getBranchFullName('MECH')).toBe('Mechanical Engineering');
        });

        it('should handle AI branches correctly', () => {
            expect(getBranchFullName('AI&DS')).toBe('Artificial Intelligence and Data Science');
            expect(getBranchFullName('AIML')).toBe('Artificial Intelligence and Machine Learning');
        });

        it('should return default if branch not recognized', () => {
            expect(getBranchFullName('')).toBe('Engineering');
            expect(getBranchFullName('Unknown')).toBe('Unknown');
        });
    });

    describe('formatPercentage', () => {
        it('should format numbers correctly', () => {
            expect(formatPercentage(95)).toBe('95%');
            expect(formatPercentage(0)).toBe('N/A');
        });
    });

    describe('normalizeCollegeData', () => {
        it('should return default values for null input', () => {
            const result = normalizeCollegeData(null);
            expect(result.college_name).toBe('Unknown College');
            expect(result.city).toBe('N/A');
        });

        it('should correctly map fields from camelCase to snake_case', () => {
            const rawData = {
                collegeCode: '1234',
                collegeName: 'Test College',
                placementRate: 85
            };
            const result = normalizeCollegeData(rawData);
            expect(result.college_code).toBe('1234');
            expect(result.college_name).toBe('Test College');
            expect(result.placement_rate).toBe(85);
        });
    });
});
