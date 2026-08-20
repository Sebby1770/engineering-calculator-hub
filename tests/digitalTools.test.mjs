import assert from 'node:assert/strict';
import test from 'node:test';
import { bitwise, convertInteger, twosComplement } from '../src/lib/binary.ts';
import { simplifyBoolean, truthTable } from '../src/lib/booleanAlgebra.ts';
import {
  allocateVlsm,
  describeSubnet,
  formatIPv4,
  parseAddressAndPrefix,
  parseIPv4,
  parseMaskOrPrefix,
  prefixForHosts,
  splitSubnets,
} from '../src/lib/ipSubnet.ts';

test('binary convert 255 is 11111111 / FF', () => {
  const r = convertInteger('255', 10, 8);
  assert.equal(r.binary, '11111111');
  assert.equal(r.hex, 'FF');
  assert.equal(r.octal, '377');
});

test('binary convert 0b1010 nibble grouping', () => {
  const r = convertInteger('1010', 2, 8);
  assert.equal(r.decimal, '10');
  assert.equal(r.grouped, '0000 1010');
});

test('bitwise AND / XOR / NOT on 8-bit values', () => {
  const and = bitwise('12', '10', 'and', 8, 10);
  assert.equal(and.decimal, '8');
  const xor = bitwise('0b1100', '0b1010', 'xor', 8, 2);
  assert.equal(xor.decimal, '6');
  const not = bitwise('0', '0', 'not', 8, 10);
  assert.equal(not.grouped, '1111 1111');
  assert.equal(not.signed, '-1');
});

test("two's complement of -1 is all ones", () => {
  const r = twosComplement('-1', 8);
  assert.equal(r.bits, '11111111');
  assert.equal(r.unsigned, '255');
});

test('two\'s complement rejects overflow', () => {
  assert.throws(() => twosComplement('128', 8), /8-bit/);
});

test('Boolean AB truth table has a single minterm', () => {
  const table = truthTable('AB');
  assert.deepEqual(table.vars, ['A', 'B']);
  assert.deepEqual(table.minterms, [3]);
  assert.equal(table.rows[3].value, true);
});

test('A + A\'B simplifies to A + B', () => {
  const r = simplifyBoolean("A + A'B");
  assert.equal(r.sop, 'A + B');
});

test('AB + A\'B simplifies to B', () => {
  const r = simplifyBoolean("AB + A'B");
  assert.equal(r.sop, 'B');
});

test('A XOR A is 0; A + A\' is 1', () => {
  assert.equal(simplifyBoolean('A XOR A').sop, '0');
  assert.equal(simplifyBoolean("A + A'").sop, '1');
});

test('NAND and engineering OR symbols parse', () => {
  const table = truthTable('A NAND B');
  assert.equal(table.rows[3].value, false);
  assert.equal(table.rows[0].value, true);
  const plus = truthTable('A+B');
  assert.deepEqual(plus.minterms, [1, 2, 3]);
});

test('192.168.1.10/24 network math', () => {
  const { ip, prefix } = parseAddressAndPrefix('192.168.1.10/24', '');
  const info = describeSubnet(ip, prefix);
  assert.equal(info.network, '192.168.1.0');
  assert.equal(info.broadcast, '192.168.1.255');
  assert.equal(info.firstHost, '192.168.1.1');
  assert.equal(info.lastHost, '192.168.1.254');
  assert.equal(info.usableHosts, 254);
  assert.equal(info.mask, '255.255.255.0');
  assert.equal(info.wildcard, '0.0.0.255');
  assert.equal(info.ipClass, 'C');
  assert.equal(info.kind, 'private');
});

test('dotted mask 255.255.255.0 is /24', () => {
  assert.equal(parseMaskOrPrefix('255.255.255.0'), 24);
  assert.equal(parseMaskOrPrefix('/16'), 16);
  assert.equal(parseMaskOrPrefix('8'), 8);
});

test('/31 is a two-host point-to-point and /32 is a host route', () => {
  const p2p = describeSubnet(parseIPv4('10.0.0.0'), 31);
  assert.equal(p2p.usableHosts, 2);
  assert.equal(p2p.firstHost, '10.0.0.0');
  assert.equal(p2p.lastHost, '10.0.0.1');
  const host = describeSubnet(parseIPv4('10.0.0.5'), 32);
  assert.equal(host.usableHosts, 1);
  assert.equal(host.network, '10.0.0.5');
  assert.equal(host.broadcast, '10.0.0.5');
});

test('split /24 into /26 yields four /26s', () => {
  const parts = splitSubnets(parseIPv4('192.168.1.0'), 24, 26);
  assert.equal(parts.length, 4);
  assert.equal(parts[0].cidr, '192.168.1.0/26');
  assert.equal(parts[1].cidr, '192.168.1.64/26');
  assert.equal(parts[2].cidr, '192.168.1.128/26');
  assert.equal(parts[3].cidr, '192.168.1.192/26');
  assert.equal(parts[0].usableHosts, 62);
});

test('VLSM carves 100/50/20 hosts from 192.168.1.0/24', () => {
  const blocks = allocateVlsm(parseIPv4('192.168.1.0'), 24, [
    { name: 'Staff', hosts: 100 },
    { name: 'Voice', hosts: 50 },
    { name: 'Guest', hosts: 20 },
  ]);
  assert.equal(blocks[0].cidr, '192.168.1.0/25');
  assert.equal(blocks[0].usableHosts, 126);
  assert.equal(blocks[1].cidr, '192.168.1.128/26');
  assert.equal(blocks[2].cidr, '192.168.1.192/27');
  assert.ok(prefixForHosts(100) <= 25);
});

test('format/parse IPv4 round-trip', () => {
  assert.equal(formatIPv4(parseIPv4('8.8.8.8')), '8.8.8.8');
  assert.throws(() => parseIPv4('192.168.1'), /four dotted/);
  assert.throws(() => parseIPv4('192.168.1.256'), /out of range/);
});
