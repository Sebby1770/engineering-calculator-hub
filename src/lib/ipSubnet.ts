/**
 * IPv4 subnet arithmetic: CIDR, masks, host ranges, equal splits, and VLSM.
 * Addresses are stored as unsigned 32-bit integers.
 */

export type WorkStep = { label: string; value: string };

export type IPv4Class = "A" | "B" | "C" | "D" | "E";

export type AddressKind =
  | "this-network"
  | "private"
  | "loopback"
  | "link-local"
  | "carrier-grade-nat"
  | "documentation"
  | "multicast"
  | "reserved"
  | "broadcast"
  | "public";

export function parseIPv4(raw: string): number {
  const text = String(raw ?? "").trim();
  const parts = text.split(".");
  if (parts.length !== 4) throw new Error("IPv4 addresses use four dotted octets (e.g. 192.168.1.10).");
  const octets = parts.map((p) => {
    if (!/^\d+$/.test(p)) throw new Error(`"${p}" is not an octet.`);
    const n = Number(p);
    if (n < 0 || n > 255 || String(n) !== String(Number(p))) {
      throw new Error(`Octet ${p} is out of range 0–255.`);
    }
    return n;
  });
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

export function formatIPv4(value: number): string {
  const v = value >>> 0;
  return `${(v >>> 24) & 255}.${(v >>> 16) & 255}.${(v >>> 8) & 255}.${v & 255}`;
}

export function prefixToMask(prefix: number): number {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("Prefix length must be an integer 0–32.");
  }
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

export function maskToPrefix(mask: number): number {
  const m = mask >>> 0;
  const bits = m.toString(2).padStart(32, "0");
  if (!/^1*0*$/.test(bits)) throw new Error(`${formatIPv4(m)} is not a contiguous subnet mask.`);
  return bits.split("1").length - 1;
}

export function parseMaskOrPrefix(raw: string): number {
  const text = String(raw ?? "").trim();
  if (!text) throw new Error("Enter a prefix (/24) or dotted mask (255.255.255.0).");
  if (text.startsWith("/")) {
    const n = Number(text.slice(1));
    if (!Number.isInteger(n) || n < 0 || n > 32) throw new Error("Prefix length must be 0–32.");
    return n;
  }
  if (text.includes(".")) return maskToPrefix(parseIPv4(text));
  if (!/^\d+$/.test(text)) throw new Error("Enter a prefix (/24) or dotted mask (255.255.255.0).");
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0 || n > 32) throw new Error("Prefix length must be 0–32.");
  return n;
}

export function parseCidr(raw: string): { ip: number; prefix: number } {
  const text = String(raw ?? "").trim();
  const slash = text.indexOf("/");
  if (slash === -1) throw new Error("Use CIDR notation such as 192.168.1.0/24.");
  return {
    ip: parseIPv4(text.slice(0, slash)),
    prefix: parseMaskOrPrefix(text.slice(slash)),
  };
}

export function ipv4Class(ip: number): IPv4Class {
  const first = (ip >>> 24) & 255;
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D";
  return "E";
}

function inRange(ip: number, network: number, prefix: number): boolean {
  const mask = prefixToMask(prefix);
  return ((ip & mask) >>> 0) === (network >>> 0);
}

export function addressKind(ip: number): AddressKind {
  if (inRange(ip, parseIPv4("0.0.0.0"), 8)) return "this-network";
  if (inRange(ip, parseIPv4("10.0.0.0"), 8)) return "private";
  if (inRange(ip, parseIPv4("127.0.0.0"), 8)) return "loopback";
  if (inRange(ip, parseIPv4("169.254.0.0"), 16)) return "link-local";
  if (inRange(ip, parseIPv4("172.16.0.0"), 12)) return "private";
  if (inRange(ip, parseIPv4("192.0.2.0"), 24)) return "documentation";
  if (inRange(ip, parseIPv4("192.88.99.0"), 24)) return "reserved";
  if (inRange(ip, parseIPv4("192.168.0.0"), 16)) return "private";
  if (inRange(ip, parseIPv4("198.18.0.0"), 15)) return "reserved";
  if (inRange(ip, parseIPv4("198.51.100.0"), 24)) return "documentation";
  if (inRange(ip, parseIPv4("203.0.113.0"), 24)) return "documentation";
  if (inRange(ip, parseIPv4("100.64.0.0"), 10)) return "carrier-grade-nat";
  if (inRange(ip, parseIPv4("224.0.0.0"), 4)) return "multicast";
  if (inRange(ip, parseIPv4("240.0.0.0"), 4)) return "reserved";
  if (ip === parseIPv4("255.255.255.255")) return "broadcast";
  return "public";
}

export type SubnetInfo = {
  ip: string;
  prefix: number;
  mask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  totalAddresses: number;
  ipClass: IPv4Class;
  kind: AddressKind;
  binaryIp: string;
  binaryMask: string;
  steps: WorkStep[];
};

function usable(prefix: number, network: number, broadcast: number): { first: number; last: number; count: number } {
  const total = prefix === 32 ? 1 : 2 ** (32 - prefix);
  if (prefix === 32) return { first: network, last: network, count: 1 };
  if (prefix === 31) return { first: network, last: broadcast, count: 2 };
  return { first: (network + 1) >>> 0, last: (broadcast - 1) >>> 0, count: total - 2 };
}

export function describeSubnet(ip: number, prefix: number): SubnetInfo {
  const mask = prefixToMask(prefix);
  const network = (ip & mask) >>> 0;
  const wildcard = (~mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const hosts = usable(prefix, network, broadcast);
  const total = prefix === 32 ? 1 : 2 ** (32 - prefix);
  const steps: WorkStep[] = [
    { label: "Address", value: `${formatIPv4(ip)}/${prefix}` },
    { label: "Mask", value: `${formatIPv4(mask)}  (${prefixToBits(mask)})` },
    { label: "Network", value: formatIPv4(network) },
    { label: "Broadcast", value: formatIPv4(broadcast) },
    { label: "Usable hosts", value: String(hosts.count) },
  ];
  return {
    ip: formatIPv4(ip),
    prefix,
    mask: formatIPv4(mask),
    wildcard: formatIPv4(wildcard),
    network: formatIPv4(network),
    broadcast: formatIPv4(broadcast),
    firstHost: formatIPv4(hosts.first),
    lastHost: formatIPv4(hosts.last),
    usableHosts: hosts.count,
    totalAddresses: total,
    ipClass: ipv4Class(ip),
    kind: addressKind(ip),
    binaryIp: toOctetBits(ip),
    binaryMask: toOctetBits(mask),
    steps,
  };
}

function prefixToBits(mask: number): string {
  return toOctetBits(mask);
}

function toOctetBits(value: number): string {
  return formatIPv4(value)
    .split(".")
    .map((o) => Number(o).toString(2).padStart(8, "0"))
    .join(".");
}

export function parseAddressAndPrefix(address: string, maskOrPrefix: string): { ip: number; prefix: number } {
  const text = String(address ?? "").trim();
  if (text.includes("/")) return parseCidr(text);
  return { ip: parseIPv4(text), prefix: parseMaskOrPrefix(maskOrPrefix) };
}

export type SplitSubnet = {
  index: number;
  cidr: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
};

export function splitSubnets(ip: number, prefix: number, newPrefix: number): SplitSubnet[] {
  if (newPrefix < prefix) throw new Error("New prefix must be longer than the parent prefix.");
  if (newPrefix > 32) throw new Error("Prefix length must be 0–32.");
  const parent = describeSubnet(ip, prefix);
  const parentNet = parseIPv4(parent.network);
  const count = 2 ** (newPrefix - prefix);
  const size = 2 ** (32 - newPrefix);
  const out: SplitSubnet[] = [];
  const limit = Math.min(count, 64);
  for (let i = 0; i < limit; i += 1) {
    const net = (parentNet + i * size) >>> 0;
    const info = describeSubnet(net, newPrefix);
    out.push({
      index: i,
      cidr: `${info.network}/${newPrefix}`,
      network: info.network,
      broadcast: info.broadcast,
      firstHost: info.firstHost,
      lastHost: info.lastHost,
      usableHosts: info.usableHosts,
    });
  }
  return out;
}

export function prefixForHosts(hosts: number): number {
  if (!Number.isInteger(hosts) || hosts < 1) throw new Error("Host count must be a positive integer.");
  if (hosts === 1) return 32;
  if (hosts === 2) return 31;
  for (let p = 30; p >= 0; p -= 1) {
    if (2 ** (32 - p) - 2 >= hosts) return p;
  }
  throw new Error("That many hosts will not fit in IPv4.");
}

export type VlsmRequest = { name: string; hosts: number };
export type VlsmBlock = {
  name: string;
  hostsRequested: number;
  cidr: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  prefix: number;
};

export function allocateVlsm(ip: number, prefix: number, requests: VlsmRequest[]): VlsmBlock[] {
  if (!Array.isArray(requests) || requests.length === 0) throw new Error("Add at least one host requirement.");
  const parent = describeSubnet(ip, prefix);
  const parentNet = parseIPv4(parent.network);
  const parentEnd = (parseIPv4(parent.broadcast) + 1) >>> 0;
  const ordered = requests
    .map((r, i) => ({
      name: (r.name || `LAN ${i + 1}`).trim() || `LAN ${i + 1}`,
      hosts: Number(r.hosts),
      order: i,
    }))
    .sort((a, b) => b.hosts - a.hosts || a.order - b.order);

  let cursor = parentNet;
  const allocated: VlsmBlock[] = [];

  for (const req of ordered) {
    const p = prefixForHosts(req.hosts);
    if (p < prefix) {
      throw new Error(`${req.name} needs /${p}, which is larger than the parent /${prefix}.`);
    }
    const size = 2 ** (32 - p);
    const aligned = Math.ceil(cursor / size) * size;
    const start = aligned >>> 0;
    const end = (start + size) >>> 0;
    if (start < parentNet || end > parentEnd || end <= start) {
      throw new Error(`Not enough space in ${parent.network}/${prefix} for ${req.name} (${req.hosts} hosts).`);
    }
    const info = describeSubnet(start, p);
    allocated.push({
      name: req.name,
      hostsRequested: req.hosts,
      cidr: `${info.network}/${p}`,
      network: info.network,
      broadcast: info.broadcast,
      firstHost: info.firstHost,
      lastHost: info.lastHost,
      usableHosts: info.usableHosts,
      prefix: p,
    });
    cursor = end;
  }

  return allocated.sort((a, b) => parseIPv4(a.network) - parseIPv4(b.network));
}
