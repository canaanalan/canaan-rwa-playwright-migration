import React from "react";

type CanaanMigrationLogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  size?: "auth" | "nav" | "compact" | "footer";
};

const dimensions = {
  auth: { width: 190 },
  nav: { height: 38 },
  compact: { height: 34 },
  footer: { height: 24 },
};

export default function CanaanMigrationLogo({
  alt = "Canaan Playwright Migration",
  size = "nav",
  style,
  ...props
}: CanaanMigrationLogoProps) {
  return (
    <img
      alt={alt}
      src="/canaan_migration_logo.png"
      style={{
        display: "inline-block",
        objectFit: "contain",
        verticalAlign: "middle",
        ...dimensions[size],
        ...style,
      }}
      {...props}
    />
  );
}
