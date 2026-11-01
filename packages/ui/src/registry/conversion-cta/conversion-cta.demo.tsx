import { ConversionCTA } from "@/registry/conversion-cta/conversion-cta";

export default function ConversionCTADemo() {
  return (
    <ConversionCTA
      alignment="center"
      title="Ready to make room for better work?"
      description="Bring your team together and give the next idea a clear path forward."
      actions={
        <>
          <a href="#get-started" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">Get started</a>
          <a href="#contact" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">Talk to our team</a>
        </>
      }
      note="No credit card required to start."
    />
  );
}
