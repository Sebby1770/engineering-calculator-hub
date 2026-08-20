"use client";

import { useState } from "react";
import CalcInput from "@/components/ui/CalcInput";
import CalcSelect from "@/components/ui/CalcSelect";
import CalcResult from "@/components/ui/CalcResult";
import WorkSteps from "@/components/ui/WorkSteps";
import {
  allocateVlsm,
  describeSubnet,
  parseAddressAndPrefix,
  splitSubnets,
  type SplitSubnet,
  type SubnetInfo,
  type VlsmBlock,
} from "@/lib/ipSubnet";

const KIND_LABEL: Record<string, string> = {
  "this-network": "This-network (0.0.0.0/8)",
  private: "Private (RFC 1918)",
  loopback: "Loopback",
  "link-local": "Link-local",
  "carrier-grade-nat": "Carrier-grade NAT",
  documentation: "Documentation (TEST-NET)",
  multicast: "Multicast",
  reserved: "Reserved",
  broadcast: "Limited broadcast",
  public: "Public",
};

export default function IpSubnetCalc({ onResult }: { onResult: (r: string) => void }) {
  const [mode, setMode] = useState("lookup");
  const [address, setAddress] = useState("192.168.1.10/24");
  const [mask, setMask] = useState("255.255.255.0");
  const [splitPrefix, setSplitPrefix] = useState("26");
  const [vlsm, setVlsm] = useState("Staff,100\nVoice,50\nGuest,20");
  const [error, setError] = useState("");
  const [info, setInfo] = useState<SubnetInfo | null>(null);
  const [splits, setSplits] = useState<SplitSubnet[]>([]);
  const [blocks, setBlocks] = useState<VlsmBlock[]>([]);

  const calculate = () => {
    try {
      const parsed = parseAddressAndPrefix(address, mask);
      const next = describeSubnet(parsed.ip, parsed.prefix);
      setInfo(next);
      setError("");

      if (mode === "split") {
        const parts = splitSubnets(parsed.ip, parsed.prefix, Number(splitPrefix));
        setSplits(parts);
        setBlocks([]);
        onResult(`${next.network}/${next.prefix} → ${parts.length} × /${splitPrefix}`);
        return;
      }

      if (mode === "vlsm") {
        const requests = vlsm
          .split(/\n|;/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line, i) => {
            const [name, hosts] = line.split(/[,:\s]+/);
            const count = Number(hosts);
            if (!Number.isFinite(count)) {
              throw new Error(`Row ${i + 1}: use Name,hosts (e.g. Staff,100).`);
            }
            return { name: name || `LAN ${i + 1}`, hosts: count };
          });
        const allocated = allocateVlsm(parsed.ip, parsed.prefix, requests);
        setBlocks(allocated);
        setSplits([]);
        onResult(allocated.map((b) => `${b.name} ${b.cidr}`).join(" · "));
        return;
      }

      setSplits([]);
      setBlocks([]);
      onResult(
        `${next.network}/${next.prefix}  mask ${next.mask}  hosts ${next.firstHost}–${next.lastHost} (${next.usableHosts})`,
      );
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Check the address and try again.";
      setError(message);
      setInfo(null);
      setSplits([]);
      setBlocks([]);
      onResult("");
    }
  };

  return (
    <div>
      <CalcSelect
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "lookup", label: "Network details" },
          { value: "split", label: "Equal subnets" },
          { value: "vlsm", label: "VLSM" },
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <CalcInput
          type="text"
          inputMode="text"
          label="IPv4 address"
          value={address}
          onChange={setAddress}
          placeholder="192.168.1.10/24"
        />
        <CalcInput
          type="text"
          inputMode="text"
          label="Mask or prefix"
          value={mask}
          onChange={setMask}
          placeholder="255.255.255.0 or 24"
        />
      </div>
      <p className="mt-2 text-xs text-surface-500 dark:text-surface-400">
        CIDR in the address field (192.168.1.10/24) wins over the mask box. /31 is treated as a
        two-host point-to-point link (RFC 3021); /32 is a host route.
      </p>

      {mode === "split" && (
        <div className="mt-4 max-w-xs">
          <CalcInput
            type="text"
            inputMode="numeric"
            label="New prefix"
            value={splitPrefix}
            onChange={setSplitPrefix}
            placeholder="26"
          />
        </div>
      )}

      {mode === "vlsm" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
            Host requirements (one per line: Name,hosts)
          </label>
          <textarea
            value={vlsm}
            onChange={(e) => setVlsm(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-3 font-mono text-sm text-surface-900 dark:text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800"
          />
        </div>
      )}

      <button
        type="button"
        onClick={calculate}
        className="mt-5 w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
      >
        Calculate
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {info && (
        <>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CalcResult label="Network" value={`${info.network}/${info.prefix}`} />
            <CalcResult label="Broadcast" value={info.broadcast} />
            <CalcResult label="Mask" value={info.mask} />
            <CalcResult label="Wildcard" value={info.wildcard} />
            <CalcResult label="Host range" value={`${info.firstHost} – ${info.lastHost}`} />
            <CalcResult
              label="Usable hosts"
              value={String(info.usableHosts)}
              detail={`${info.totalAddresses} addresses · class ${info.ipClass} · ${KIND_LABEL[info.kind] ?? info.kind}`}
            />
          </div>
          <CalcResult label="IP bits" value={info.binaryIp} />
          <CalcResult label="Mask bits" value={info.binaryMask} />
          <WorkSteps steps={info.steps} />
        </>
      )}

      {splits.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700">
          <table className="min-w-full text-sm font-mono">
            <thead className="bg-surface-50 dark:bg-surface-800 text-surface-500">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">CIDR</th>
                <th className="px-3 py-2 text-left">Hosts</th>
                <th className="px-3 py-2 text-left">Range</th>
              </tr>
            </thead>
            <tbody>
              {splits.map((row) => (
                <tr key={row.cidr} className="border-t border-surface-200 dark:border-surface-800">
                  <td className="px-3 py-1.5">{row.index}</td>
                  <td className="px-3 py-1.5">{row.cidr}</td>
                  <td className="px-3 py-1.5">{row.usableHosts}</td>
                  <td className="px-3 py-1.5">
                    {row.firstHost} – {row.lastHost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {blocks.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-700">
          <table className="min-w-full text-sm font-mono">
            <thead className="bg-surface-50 dark:bg-surface-800 text-surface-500">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">CIDR</th>
                <th className="px-3 py-2 text-left">Need</th>
                <th className="px-3 py-2 text-left">Usable</th>
                <th className="px-3 py-2 text-left">Range</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((row) => (
                <tr key={row.cidr} className="border-t border-surface-200 dark:border-surface-800">
                  <td className="px-3 py-1.5">{row.name}</td>
                  <td className="px-3 py-1.5">{row.cidr}</td>
                  <td className="px-3 py-1.5">{row.hostsRequested}</td>
                  <td className="px-3 py-1.5">{row.usableHosts}</td>
                  <td className="px-3 py-1.5">
                    {row.firstHost} – {row.lastHost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
