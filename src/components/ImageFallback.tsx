"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "onError"> & {
  fallbackClassName?: string;
};

export default function ImageFallback({
  src,
  alt,
  fallbackClassName,
  ...props
}: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={fallbackClassName ?? "w-full h-full"}
        style={{ backgroundColor: "#F5EFF0" }}
        aria-label={alt}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
