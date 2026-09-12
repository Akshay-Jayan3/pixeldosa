import { ConfidenceMeter } from "@/registry/confidence-meter/confidence-meter";

export default function ConfidenceMeterDemo() {
  return (
    <div className="flex flex-col gap-4">
      <ConfidenceMeter confidence="low" />
      <ConfidenceMeter confidence="medium" provenance="acme-robotics.com" />
      <ConfidenceMeter confidence="high" provenance="similar records" />
    </div>
  );
}
