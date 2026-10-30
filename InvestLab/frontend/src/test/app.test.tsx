import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { formatINR, formatPercent, formatDate } from '../utils/formatters';
import { LandingPage } from '../pages/LandingPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

describe('InvestLab Frontend Unit Tests', () => {
  describe('Formatters & Currency', () => {
    it('formats Indian Rupees correctly with standard en-IN grouping', () => {
      expect(formatINR(100000)).toContain('1,00,000');
      expect(formatINR(0)).toContain('0.00');
      expect(formatINR(null)).toContain('0.00');
    });

    it('formats positive and negative percentages with signs', () => {
      expect(formatPercent(5.2)).toBe('+5.20%');
      expect(formatPercent(-3.45)).toBe('-3.45%');
      expect(formatPercent(0)).toBe('0.00%');
    });

    it('formats dates consistently', () => {
      expect(formatDate('2026-10-15T10:00:00Z')).toBeDefined();
    });
  });

  describe('Landing Page Rendering', () => {
    it('renders hero title and primary call to action', () => {
      render(
        <AuthProvider>
          <BrowserRouter>
            <LandingPage />
          </BrowserRouter>
        </AuthProvider>
      );

      expect(screen.getByText('Learn Investing by Doing.')).toBeInTheDocument();
      expect(screen.getAllByText('Start Learning')[0]).toBeInTheDocument();
      expect(screen.getByText('Explore 1-Click Demo')).toBeInTheDocument();
      expect(screen.getByText('How InvestLab Works')).toBeInTheDocument();
    });
  });
});
