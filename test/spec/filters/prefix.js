'use strict';

describe('Filter: binaryPrefixFactory', function() {

  beforeEach(module('probytes.filters'));

  it('should convert 523 to 523', inject(function(Prefix) {
    var prefixer = Prefix.binaryPrefixFactory(523);
    expect(prefixer(523)).toEqual([523, '']);
  }));

  it('should convert 1024 to 1 Ki', inject(function(Prefix) {
    var prefixer = Prefix.binaryPrefixFactory(1024);
    expect(prefixer(1024)).toEqual([1, 'Ki']);
  }));

  it('should convert 3000 to ~2.930 Ki', inject(function(Prefix) {
    var prefixer = Prefix.binaryPrefixFactory(3000);
    var result = prefixer(3000);
    expect(result[0]).toBeGreaterThan(2.929);
    expect(result[0]).toBeLessThan(2.930);
    expect(result[1]).toBe('Ki');
  }));

  it('should convert 2^20 to 1 Mi', inject(function(Prefix) {
    var val = Math.pow(2, 20);
    var prefixer = Prefix.binaryPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Mi']);
  }));

  it('should convert 2^30 to 1 Gi', inject(function(Prefix) {
    var val = Math.pow(2, 30);
    var prefixer = Prefix.binaryPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Gi']);
  }));

  it('should convert 2^40 to 1 Ti', inject(function(Prefix) {
    var val = Math.pow(2, 40);
    var prefixer = Prefix.binaryPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Ti']);
  }));

  it('should convert 3 * 10^12 to ~2.728 Ti', inject(function(Prefix) {
    var val = 3 * Math.pow(10, 12);
    var prefixer = Prefix.binaryPrefixFactory(val);
    var result = prefixer(val);
    expect(result[0]).toBeGreaterThan(2.728);
    expect(result[0]).toBeLessThan(2.729);
    expect(result[1]).toBe('Ti');
  }));

  it('should convert 2^50 to 1 Pi', inject(function(Prefix) {
    var val = Math.pow(2, 50);
    var prefixer = Prefix.binaryPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Pi']);
  }));

  it('should convert 2^60 to 1 Ei', inject(function(Prefix) {
    var val = Math.pow(2, 60);
    var prefixer = Prefix.binaryPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Ei']);
  }));

  it('should convert 2^70 to 1 Zi', inject(function(Prefix) {
    var val = Math.pow(2, 70);
    var prefixer = Prefix.binaryPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Zi']);
  }));

  it('should convert 2^80 to 1 Yi', inject(function(Prefix) {
    var val = Math.pow(2, 80);
    var prefixer = Prefix.binaryPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Yi']);
  }));
});

describe('Filter: decimalPrefixFactory', function() {

  beforeEach(module('probytes.filters'));

  it('should convert 523 to 523', inject(function(Prefix) {
    var prefixer = Prefix.decimalPrefixFactory(523);
    expect(prefixer(523)).toEqual([523, '']);
  }));

  it('should convert 1000 to 1 k', inject(function(Prefix) {
    var prefixer = Prefix.decimalPrefixFactory(1000);
    expect(prefixer(1000)).toEqual([1, 'k']);
  }));

  it('should convert 3 * 2^10 to 3.072 k', inject(function(Prefix) {
    var val = 3 * Math.pow(2, 10);
    var prefixer = Prefix.decimalPrefixFactory(val);
    expect(prefixer(val)).toEqual([3.072, 'k']);
  }));

  it('should convert 10^6 to 1 M', inject(function(Prefix) {
    var val = Math.pow(10, 6);
    var prefixer = Prefix.decimalPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'M']);
  }));

  it('should convert 10^9 to 1 G', inject(function(Prefix) {
    var val = Math.pow(10, 9);
    var prefixer = Prefix.decimalPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'G']);
  }));

  it('should convert 10^12 to 1 T', inject(function(Prefix) {
    var val = Math.pow(10, 12);
    var prefixer = Prefix.decimalPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'T']);
  }));

  it('should convert 3 * 2^40 to ~3.299 T', inject(function(Prefix) {
    var val = 3 * Math.pow(2, 40);
    var prefixer = Prefix.decimalPrefixFactory(val);
    var result = prefixer(val);
    expect(result[0]).toBeGreaterThan(3.298);
    expect(result[0]).toBeLessThan(3.299);
    expect(result[1]).toBe('T');
  }));

  it('should convert 10^15 to 1 P', inject(function(Prefix) {
    var val = Math.pow(10, 15);
    var prefixer = Prefix.decimalPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'P']);
  }));

  it('should convert 10^18 to 1 E', inject(function(Prefix) {
    var val = Math.pow(10, 18);
    var prefixer = Prefix.decimalPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'E']);
  }));

  it('should convert 10^21 to 1 Z', inject(function(Prefix) {
    var val = Math.pow(10, 21);
    var prefixer = Prefix.decimalPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Z']);
  }));

  it('should convert 10^24 to 1 Y', inject(function(Prefix) {
    var val = Math.pow(10, 24);
    var prefixer = Prefix.decimalPrefixFactory(val);
    expect(prefixer(val)).toEqual([1, 'Y']);
  }));

});
