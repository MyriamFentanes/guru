import Image from "next/image";

interface Props {
  children: React.ReactNode;
  maxWidthClassName?: string;
}

export default function SplitHero({ children, maxWidthClassName = "max-w-sm" }: Props) {
  return (
    <div className="flex flex-1">
      <div className="relative hidden w-1/2 md:block">
        <Image src="/images/hero-asana.jpeg" alt="" fill className="object-cover" priority />
      </div>
      <div className="flex w-full items-center justify-center bg-background-warm px-8 md:w-1/2">
        <div className={`w-full py-16 ${maxWidthClassName}`}>{children}</div>
      </div>
    </div>
  );
}
