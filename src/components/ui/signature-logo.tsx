"use client";

import Image from "next/image";
import { cn } from "@/src/lib/utils";

type SignatureLogoProps = {
    className?: string;
};

const SignatureLogo = ({ className }: SignatureLogoProps) => {
    return (
        <div className={cn("relative h-[200px] w-full flex items-center justify-center", className)}>
            {/* Light mode signature (dark text) */}
            <Image
                src="/assets/signature-dark.png"
                alt="Dean Fields Signature"
                width={400}
                height={133}
                className="dark:hidden object-contain"
                priority
            />
            {/* Dark mode signature (light text) */}
            <Image
                src="/assets/signature-light.png"
                alt="Dean Fields Signature"
                width={400}
                height={133}
                className="hidden dark:block object-contain"
                priority
            />
        </div>
    );
};

export default SignatureLogo;
