'use strict';

describe('Helper: DateTime.secondsInMonth', function() {

  beforeEach(module('probytes.datetime'));

  function secondsToDays(s) {
    return s / (24 * 60 * 60);
  }

  it('should return Jan 2013 to have 31 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 1))).toBe(31);
  }));

  it('should return Feb 2013 to have 28 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 2))).toBe(28);
  }));

  it('should return Feb 2012 to have 29 days (leap year)', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2012, 2))).toBe(29);
  }));

  it('should return Mar 2013 to have 31 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 3))).toBe(31);
  }));

  it('should return Apr 2013 to have 30 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 4))).toBe(30);
  }));

  it('should return May 2013 to have 31 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 5))).toBe(31);
  }));

  it('should return Jun 2013 to have 30 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 6))).toBe(30);
  }));

  it('should return Jul 2013 to have 31 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 7))).toBe(31);
  }));

  it('should return Aug 2013 to have 31 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 8))).toBe(31);
  }));

  it('should return Sep 2013 to have 30 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 9))).toBe(30);
  }));

  it('should return Oct 2013 to have 31 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 10))).toBe(31);
  }));

  it('should return Nov 2013 to have 30 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 11))).toBe(30);
  }));

  it('should return Dec 2013 to have 31 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInMonth(2013, 12))).toBe(31);
  }));
});

describe('Helper: DateTime.secondsInYear', function() {

  beforeEach(module('probytes.datetime'));

  function secondsToDays(s) {
    return s / (24 * 60 * 60);
  }

  it('should return 2012 to have 366 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInYear(2012))).toBe(366);
  }));

  it('should return 2013 to have 365 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInYear(2013))).toBe(365);
  }));

  it('should return 2000 to have 366 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInYear(2000))).toBe(366);
  }));

  it('should return 2100 to have 365 days', inject(function(DateHelper) {
    expect(secondsToDays(DateHelper.secondsInYear(2100))).toBe(365);
  }));
});

describe('Helper: DateTime.elapsedSecondsInMonth', function() {

  beforeEach(module('probytes.datetime'));

  it('should fallback to secondsInMonth for past months', inject(function(DateHelper) {
    spyOn(DateHelper, 'secondsInMonth');
    DateHelper.elapsedSecondsInMonth(2013, 1);
    expect(DateHelper.secondsInMonth).toHaveBeenCalledWith(2013, 1);
  }));

  it('should return 0 for future months', inject(function(DateHelper) {
    // yeah, just blame me when this breaks
    expect(DateHelper.elapsedSecondsInMonth(3000, 5)).toBe(0);
  }));
});

describe('Helper: DateTime.elapsedSecondsInYear', function() {

  beforeEach(module('probytes.datetime'));

  it('should fallback to secondsInYear for past years', inject(function(DateHelper) {
    spyOn(DateHelper, 'secondsInYear');
    DateHelper.elapsedSecondsInYear(2012);
    expect(DateHelper.secondsInYear).toHaveBeenCalledWith(2012);
  }));

  it('should return 0 for future years', inject(function(DateHelper) {
    expect(DateHelper.elapsedSecondsInYear(3000)).toBe(0);
  }));
});
